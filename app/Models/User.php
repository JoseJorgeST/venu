<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Order> $orders
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Reservation> $reservations
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LoyaltyLog> $loyaltyLogs
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Company> $companies
 * @property-read \App\Models\Company|null $currentCompany
 * @property-read \App\Models\Branch|null $currentBranch
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'google_id',
        'wallet_points',
        'stripe_customer_id',
        'current_company_id',
        'current_branch_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'wallet_points' => 'integer',
        ];
    }

    /**
     * Get the orders placed by the user.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the reservations made by the user.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get the loyalty logs for the user.
     */
    public function loyaltyLogs(): HasMany
    {
        return $this->hasMany(LoyaltyLog::class);
    }

    /**
     * Get the companies this user belongs to.
     */
    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(Company::class, 'company_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get the current active company.
     */
    public function currentCompany(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'current_company_id');
    }

    /**
     * Get the current active branch.
     */
    public function currentBranch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'current_branch_id');
    }

    /**
     * Check if user is a super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    /**
     * Check if user is an admin (company owner/manager).
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user is a customer.
     */
    public function isCustomer(): bool
    {
        return $this->hasRole('customer');
    }

    /**
     * Get companies owned by this user.
     */
    public function ownedCompanies(): HasMany
    {
        return $this->hasMany(Company::class, 'owner_id');
    }

    /**
     * Switch to a different company context.
     */
    public function switchToCompany(Company $company): bool
    {
        if (!$this->isSuperAdmin() && !$this->companies->contains($company)) {
            return false;
        }

        $this->update([
            'current_company_id' => $company->id,
            'current_branch_id' => $company->branches()->where('is_main', true)->first()?->id,
        ]);

        return true;
    }

    /**
     * Switch to a different branch context.
     */
    public function switchToBranch(Branch $branch): bool
    {
        if ($branch->company_id !== $this->current_company_id) {
            return false;
        }

        $this->update(['current_branch_id' => $branch->id]);

        return true;
    }
}
