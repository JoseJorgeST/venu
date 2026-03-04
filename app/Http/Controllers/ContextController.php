<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ContextController extends Controller
{
    public function switchCompany(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => ['required', 'exists:companies,id'],
        ]);

        $user = $request->user();
        $company = Company::findOrFail($validated['company_id']);

        if (!$user->isSuperAdmin() && !$user->companies->contains($company)) {
            abort(403, 'No tienes acceso a esta empresa.');
        }

        $mainBranch = $company->branches()->where('is_main', true)->first()
            ?? $company->branches()->first();

        $user->update([
            'current_company_id' => $company->id,
            'current_branch_id' => $mainBranch?->id,
        ]);

        $redirectTo = $user->isSuperAdmin() ? 'admin.dashboard' : 'company.dashboard';

        return redirect()
            ->route($redirectTo)
            ->with('success', "Cambiado a {$company->name}");
    }

    public function switchBranch(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'branch_id' => ['nullable', 'exists:branches,id'],
        ]);

        $user = $request->user();
        $branchId = $validated['branch_id'] ?? null;

        if ($branchId) {
            $branch = Branch::findOrFail($branchId);

            if ($branch->company_id !== $user->current_company_id) {
                abort(403, 'Esta sucursal no pertenece a tu empresa actual.');
            }

            $user->update(['current_branch_id' => $branch->id]);

            return redirect()->route('company.dashboard')->with('success', "Cambiado a sucursal {$branch->name}");
        }

        $user->update(['current_branch_id' => null]);
        $company = Company::find($user->current_company_id);

        return redirect()->route('company.dashboard')->with('success', "Viendo {$company->name} (Principal)");
    }

    public function getContext(Request $request): array
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

        $companies = $user->isSuperAdmin()
            ? Company::where('is_active', true)->get(['id', 'name', 'slug', 'logo_url'])
            : $user->companies()->where('is_active', true)->get(['companies.id', 'name', 'slug', 'logo_url']);

        $currentCompany = app('current_company');
        $currentBranch = app('current_branch');

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
