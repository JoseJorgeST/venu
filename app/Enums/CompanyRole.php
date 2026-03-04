<?php

namespace App\Enums;

enum CompanyRole: string
{
    case Owner = 'owner';
    case Manager = 'manager';
    case Staff = 'staff';

    public function label(): string
    {
        return match ($this) {
            self::Owner => 'Propietario',
            self::Manager => 'Gerente',
            self::Staff => 'Personal',
        };
    }

    public function canManageCompany(): bool
    {
        return in_array($this, [self::Owner, self::Manager]);
    }

    public function canManageBranches(): bool
    {
        return in_array($this, [self::Owner, self::Manager]);
    }

    public function canManageStaff(): bool
    {
        return $this === self::Owner;
    }
}
