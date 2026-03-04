<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CompanyPolicy
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
        return $user->hasPermissionTo('companies.view_any');
    }

    public function view(User $user, Company $company): bool
    {
        if ($user->hasPermissionTo('companies.view_any')) {
            return true;
        }

        return $user->companies->contains($company);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('companies.create');
    }

    public function update(User $user, Company $company): bool
    {
        if ($user->hasPermissionTo('companies.update')) {
            return $user->companies->contains($company);
        }

        return false;
    }

    public function delete(User $user, Company $company): bool
    {
        return $user->hasPermissionTo('companies.delete');
    }
}
