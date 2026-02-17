<?php

namespace App\Models;

use App\Enums\LoyaltyTransactionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read \App\Models\User $user
 * @property-read \App\Models\Restaurant $restaurant
 * @property-read \App\Models\Order|null $order
 */
class LoyaltyLog extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'restaurant_id',
        'points_change',
        'transaction_type',
        'order_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'points_change' => 'integer',
            'transaction_type' => LoyaltyTransactionType::class,
        ];
    }

    /**
     * Get the user the loyalty log belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the restaurant the loyalty log belongs to.
     */
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    /**
     * Get the order associated with the loyalty log (if any).
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
