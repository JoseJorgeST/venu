<?php

namespace App\Http\Middleware;

use App\Models\Branch;
use App\Models\Company;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class SetTenantContext
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        $currentCompany = null;
        $currentBranch = null;

        if ($user->isSuperAdmin()) {
            if ($user->current_company_id) {
                $currentCompany = Company::find($user->current_company_id);
                if ($user->current_branch_id) {
                    $currentBranch = Branch::find($user->current_branch_id);
                }
            }
        } elseif ($user->isAdmin()) {
            if ($user->current_company_id && $user->companies->contains('id', $user->current_company_id)) {
                $currentCompany = $user->companies->firstWhere('id', $user->current_company_id);
            } else {
                $currentCompany = $user->companies->first();
                if ($currentCompany) {
                    $user->update(['current_company_id' => $currentCompany->id]);
                }
            }

            if ($currentCompany) {
                if ($user->current_branch_id) {
                    $currentBranch = $currentCompany->branches->firstWhere('id', $user->current_branch_id);
                }
                if (!$currentBranch) {
                    $currentBranch = $currentCompany->branches()->where('is_main', true)->first()
                        ?? $currentCompany->branches()->first();
                    if ($currentBranch) {
                        $user->update(['current_branch_id' => $currentBranch->id]);
                    }
                }
            }
        }

        if ($currentCompany !== null) {
            app()->instance('current_company', $currentCompany);
        }
        if ($currentBranch !== null) {
            app()->instance('current_branch', $currentBranch);
        }

        $request->merge([
            'current_company' => $currentCompany,
            'current_branch' => $currentBranch,
        ]);

        View::share('currentCompany', $currentCompany);
        View::share('currentBranch', $currentBranch);

        return $next($request);
    }
}
