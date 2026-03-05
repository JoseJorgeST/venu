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

    /**
     * Get the owning company (either directly or through branch).
     */
    public function getOwnerCompany(): ?Company
    {
        if ($this->company_id) {
            return $this->company;
        }

        $branch = $this->branch;
        if ($branch) {
            return $branch->company;
        }

        return null;
    }

    /**
     * Get Stripe configuration for this restaurant.
     * Returns branch Stripe config if it's a branch restaurant, otherwise company config.
     * Each entity must have its own Stripe configured.
     */
    public function getStripeConfig(): ?array
    {
        $branch = $this->branch;
        
        // Si es un restaurante de sucursal, DEBE tener su propio Stripe
        if ($branch) {
            if ($branch->hasStripeConfigured()) {
                return [
                    'stripe_key' => $branch->stripe_key,
                    'stripe_secret' => $branch->stripe_secret,
                    'stripe_webhook_secret' => $branch->stripe_webhook_secret,
                    'source' => 'branch',
                    'source_id' => $branch->id,
                ];
            }
            // Sucursal sin Stripe configurado = no hay método de pago
            return null;
        }

        // Si es un restaurante de empresa directamente
        $company = $this->getOwnerCompany();
        if ($company && $company->hasStripeConfigured()) {
            return [
                'stripe_key' => $company->stripe_key,
                'stripe_secret' => $company->stripe_secret,
                'stripe_webhook_secret' => $company->stripe_webhook_secret,
                'source' => 'company',
                'source_id' => $company->id,
            ];
        }

        return null;
    }

    /**
     * Get Stripe client for this restaurant.
     */
    public function getStripeClient(): ?\Stripe\StripeClient
    {
        $config = $this->getStripeConfig();
        
        if (!$config) {
            return null;
        }

        return new \Stripe\StripeClient($config['stripe_secret']);
    }

    /**
     * Check if restaurant has Stripe configured.
     */
    public function hasStripeConfigured(): bool
    {
        return $this->getStripeConfig() !== null;
    }
}
