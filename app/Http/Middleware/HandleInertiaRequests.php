<?php

namespace App\Http\Middleware;

use App\Http\Controllers\ContextController;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    ...$user->toArray(),
                    'roles' => $user->roles->pluck('name'),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'tenant' => $user ? $this->getTenantContext($request) : null,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }

    private function getTenantContext(Request $request): array
    {
        $user = $request->user();

        if (!$user) {
            return [
                'companies' => [],
                'branches' => [],
                'currentCompany' => null,
                'currentBranch' => null,
            ];
        }

        $companies = $user->hasRole('super_admin')
            ? Company::where('is_active', true)->get(['id', 'name', 'slug', 'logo_url'])
            : $user->companies()->where('is_active', true)->get(['companies.id', 'name', 'slug', 'logo_url']);

        $currentCompany = app()->bound('current_company') ? app('current_company') : null;
        $currentBranch = app()->bound('current_branch') ? app('current_branch') : null;

        $branches = $currentCompany
            ? $currentCompany->branches()->where('is_active', true)->get(['id', 'name', 'code', 'is_main'])
            : collect();

        return [
            'companies' => $companies,
            'branches' => $branches,
            'currentCompany' => $currentCompany ? [
                'id' => $currentCompany->id,
                'name' => $currentCompany->name,
                'slug' => $currentCompany->slug,
                'logo_url' => $currentCompany->logo_url,
            ] : null,
            'currentBranch' => $currentBranch ? [
                'id' => $currentBranch->id,
                'name' => $currentBranch->name,
                'code' => $currentBranch->code,
                'is_main' => $currentBranch->is_main,
            ] : null,
        ];
    }
}
