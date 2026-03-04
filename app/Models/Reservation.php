<?php

namespace App\Models;

use App\Enums\ReservationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read \App\Models\User $user
 * @property-read \App\Models\Restaurant $restaurant
 */
class Reservation extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'restaurant_id',
        'date',
        'time',
        'party_size',
        'table_number',
        'table_location',
        'status',
        'special_requests',
        'rejection_reason',
        'admin_message',
        'alternative_date',
        'alternative_time',
        'responded_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'party_size' => 'integer',
            'status' => ReservationStatus::class,
            'alternative_date' => 'date',
            'responded_at' => 'datetime',
        ];
    }

    /**
     * Get the user that made the reservation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the restaurant the reservation is for.
     */
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }
}
