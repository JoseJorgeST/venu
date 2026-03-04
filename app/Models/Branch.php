<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

/**
 * @property int $id
 * @property int $company_id
 * @property int|null $restaurant_id
 * @property string $name
 * @property string|null $code
 * @property bool $is_main
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Company $company
 * @property-read \App\Models\Restaurant|null $restaurant
 */
class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'restaurant_id',
        'name',
        'code',
        'is_main',
        'is_active',
    ];

    protected $casts = [
        'is_main' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Branch $branch) {
            if ($branch->is_main) {
                static::where('company_id', $branch->company_id)
                    ->where('is_main', true)
                    ->update(['is_main' => false]);
            }
        });

        static::updating(function (Branch $branch) {
            if ($branch->isDirty('is_main') && $branch->is_main) {
                static::where('company_id', $branch->company_id)
                    ->where('id', '!=', $branch->id)
                    ->where('is_main', true)
                    ->update(['is_main' => false]);
            }
        });
    }

    /**
     * Get the company that owns the branch.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the restaurant associated with this branch.
     */
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    /**
     * Get orders through the restaurant.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'restaurant_id', 'restaurant_id');
    }

    /**
     * Get reservations through the restaurant.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'restaurant_id', 'restaurant_id');
    }

    /**
     * Get menu items through the restaurant.
     */
    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'restaurant_id', 'restaurant_id');
    }

    /**
     * Scope to filter only active branches.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter only main branches.
     */
    public function scopeMain($query)
    {
        return $query->where('is_main', true);
    }
}
