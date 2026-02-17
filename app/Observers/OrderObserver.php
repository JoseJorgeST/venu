<?php

namespace App\Observers;

use App\Enums\LoyaltyTransactionType;
use App\Enums\OrderStatus;
use App\Models\LoyaltyLog;
use App\Models\Order;

class OrderObserver
{
    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "updated" event.
     * Cuando status pasa a "completed", suma puntos (total_amount / 1) al usuario y crea LoyaltyLog.
     */
    public function updated(Order $order): void
    {
        if (! $order->wasChanged('status') || $order->status !== OrderStatus::Completed) {
            return;
        }

        if ($order->loyaltyLogs()->where('points_change', '>', 0)->exists()) {
            return;
        }

        $points = (int) round((float) $order->total_amount);
        if ($points <= 0) {
            return;
        }

        $order->user->increment('wallet_points', $points);

        LoyaltyLog::create([
            'user_id' => $order->user_id,
            'restaurant_id' => $order->restaurant_id,
            'points_change' => $points,
            'transaction_type' => LoyaltyTransactionType::Earn,
            'order_id' => $order->id,
        ]);
    }

    /**
     * Handle the Order "deleted" event.
     */
    public function deleted(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "restored" event.
     */
    public function restored(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "force deleted" event.
     */
    public function forceDeleted(Order $order): void
    {
        //
    }
}
