<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int|null $company_id
 * @property string $name
 * @property string $slug
 * @property string|null $category
 * @property string|null $image_url
 * @property string|null $description
 * @property float|null $rating
 * @property float|null $latitude
 * @property float|null $longitude
 * @property bool $is_active
 * @property-read \App\Models\Company|null $company
 * @property-read \App\Models\Branch|null $branch
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MenuItem> $menuItems
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Order> $orders
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Reservation> $reservations
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LoyaltyLog> $loyaltyLogs
 */
class Restaurant extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'company_id',
        'name',
        'slug',
        'category',
        'image_url',
        'description',
        'rating',
        'latitude',
        'longitude',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'decimal:2',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the menu items for the restaurant.
     */
    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class);
    }

    /**
     * Get the orders for the restaurant.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the reservations for the restaurant.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get the loyalty logs for the restaurant.
     */
    public function loyaltyLogs(): HasMany
    {
        return $this->hasMany(LoyaltyLog::class);
    }

    /**
     * Get the company that owns the restaurant.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the branch associated with this restaurant.
     */
    public function branch(): HasOne
    {
        return $this->hasOne(Branch::class);
    }

    /**
     * Scope to filter restaurants by company.
     */
    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }
}
