<?php

namespace App\Policies;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class BranchPolicy
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
        return $user->hasPermissionTo('branches.view_any');
    }

    public function view(User $user, Branch $branch): bool
    {
        if ($user->hasPermissionTo('branches.view_any')) {
            return true;
        }

        return $user->companies->contains('id', $branch->company_id);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('branches.create');
    }

    public function update(User $user, Branch $branch): bool
    {
        if (!$user->hasPermissionTo('branches.update')) {
            return false;
        }

        return $user->companies->contains('id', $branch->company_id);
    }

    public function delete(User $user, Branch $branch): bool
    {
        if (!$user->hasPermissionTo('branches.delete')) {
            return false;
        }

        return $user->companies->contains('id', $branch->company_id);
    }
}
