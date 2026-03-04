<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCompanyAccess
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
            return redirect()->route('login');
        }

        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        if (!$user->isAdmin()) {
            abort(403, 'No tienes permisos para acceder a esta sección.');
        }

        $currentCompany = $request->current_company;

        if (!$currentCompany && $user->companies->isNotEmpty()) {
            $firstCompany = $user->companies->first();
            $user->update(['current_company_id' => $firstCompany->id]);
            $request->merge(['current_company' => $firstCompany]);
        }

        return $next($request);
    }
}
