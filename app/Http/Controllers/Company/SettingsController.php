<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(Request $request): Response
    {
        $company = $request->current_company;
        $branch = $request->current_branch;

        if (!$company) {
            return Inertia::render('company/no-company');
        }

        if ($branch) {
            $branch->load('restaurant');
            return Inertia::render('company/settings/index', [
                'company' => $company,
                'branch' => $branch,
                'mode' => 'branch',
            ]);
        }

        return Inertia::render('company/settings/index', [
            'company' => $company,
            'branch' => null,
            'mode' => 'company',
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $company = $request->current_company;
        $branch = $request->current_branch;

        if (!$company) {
            abort(403);
        }

        if ($branch) {
            return $this->updateBranch($request, $branch);
        }

        return $this->updateCompany($request, $company);
    }

    private function updateCompany(Request $request, $company): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', "unique:companies,slug,{$company->id}"],
            'description' => ['nullable', 'string'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:50'],
            'logo_url' => ['nullable', 'string', 'max:500'],
        ]);

        $company->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?: Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'tax_id' => $validated['tax_id'] ?? null,
            'logo_url' => $validated['logo_url'] ?? null,
        ]);

        return back()->with('success', 'Configuración de empresa actualizada.');
    }

    private function updateBranch(Request $request, $branch): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'restaurant_name' => ['nullable', 'string', 'max:255'],
            'restaurant_category' => ['nullable', 'string', 'max:100'],
            'restaurant_description' => ['nullable', 'string'],
            'restaurant_image_url' => ['nullable', 'string', 'max:500'],
        ]);

        $branch->update([
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'address' => $validated['address'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
        ]);

        if ($branch->restaurant) {
            $branch->restaurant->update([
                'name' => $validated['restaurant_name'] ?? $branch->restaurant->name,
                'category' => $validated['restaurant_category'] ?? null,
                'description' => $validated['restaurant_description'] ?? null,
                'image_url' => $validated['restaurant_image_url'] ?? null,
            ]);
        }

        return back()->with('success', 'Configuración de sucursal actualizada.');
    }
}
