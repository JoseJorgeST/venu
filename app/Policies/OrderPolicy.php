<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class OrderPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('orders.view_any') || $user->hasPermissionTo('orders.view');
    }

    public function view(User $user, Order $order): bool
    {
        if ($user->hasPermissionTo('orders.view_any')) {
            return true;
        }

        if ($user->isAdmin()) {
            return $user->companies->contains('id', $order->restaurant?->company_id);
        }

        return $order->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('orders.create');
    }

    public function update(User $user, Order $order): bool
    {
        if (!$user->hasPermissionTo('orders.update')) {
            return false;
        }

        if ($user->isAdmin()) {
            return $user->companies->contains('id', $order->restaurant?->company_id);
        }

        return false;
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->hasPermissionTo('orders.delete');
    }
}
