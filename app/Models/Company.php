<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property int $owner_id
 * @property string|null $logo_url
 * @property string|null $description
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $address
 * @property string|null $tax_id
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $owner
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Branch> $branches
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Restaurant> $restaurants
 */
class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'owner_id',
        'logo_url',
        'description',
        'email',
        'phone',
        'address',
        'tax_id',
        'stripe_key',
        'stripe_secret',
        'stripe_webhook_secret',
        'stripe_enabled',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'stripe_enabled' => 'boolean',
    ];

    protected $hidden = [
        'stripe_secret',
        'stripe_webhook_secret',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Company $company) {
            if (empty($company->slug)) {
                $company->slug = Str::slug($company->name);
            }
        });
    }

    /**
     * Get the owner of the company.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get the branches of the company.
     */
    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }

    /**
     * Get the main branch of the company.
     */
    public function mainBranch(): HasMany
    {
        return $this->hasMany(Branch::class)->where('is_main', true);
    }

    /**
     * Get the users associated with the company.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'company_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get the restaurants that belong directly to this company.
     */
    public function restaurants(): HasMany
    {
        return $this->hasMany(Restaurant::class);
    }

    /**
     * Get the main restaurant of the company (first one created).
     */
    public function mainRestaurant()
    {
        return $this->hasOne(Restaurant::class)->oldestOfMany();
    }

    /**
     * Get all orders from all branches/restaurants.
     */
    public function orders(): HasManyThrough
    {
        return $this->hasManyThrough(
            Order::class,
            Restaurant::class,
            'company_id',      // Foreign key on restaurants table
            'restaurant_id',   // Foreign key on orders table
            'id',              // Local key on companies table
            'id'               // Local key on restaurants table
        );
    }

    /**
     * Get all reservations from all branches/restaurants.
     */
    public function reservations(): HasManyThrough
    {
        return $this->hasManyThrough(
            Reservation::class,
            Restaurant::class,
            'company_id',
            'restaurant_id',
            'id',
            'id'
        );
    }

    /**
     * Add a user to the company with a specific role.
     */
    public function addUser(User $user, string $role = 'staff'): void
    {
        $this->users()->syncWithoutDetaching([
            $user->id => ['role' => $role],
        ]);
    }

    /**
     * Remove a user from the company.
     */
    public function removeUser(User $user): void
    {
        $this->users()->detach($user->id);
    }

    /**
     * Check if a user belongs to this company.
     */
    public function hasUser(User $user): bool
    {
        return $this->users()->where('user_id', $user->id)->exists();
    }

    /**
     * Get the user's role in this company.
     */
    public function getUserRole(User $user): ?string
    {
        $pivot = $this->users()->where('user_id', $user->id)->first();
        return $pivot?->pivot?->role;
    }

    /**
     * Get the table locations for the company.
     */
    public function tableLocations(): HasMany
    {
        return $this->hasMany(TableLocation::class);
    }

    /**
     * Scope to filter only active companies.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Check if company has Stripe configured and enabled.
     */
    public function hasStripeConfigured(): bool
    {
        return $this->stripe_enabled 
            && !empty($this->stripe_key) 
            && !empty($this->stripe_secret);
    }

    /**
     * Get Stripe client for this company.
     */
    public function getStripeClient(): ?\Stripe\StripeClient
    {
        if (!$this->hasStripeConfigured()) {
            return null;
        }

        return new \Stripe\StripeClient($this->stripe_secret);
    }
}
