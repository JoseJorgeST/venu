<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Restaurant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    public function index(Request $request): Response
    {
        $company = $request->current_company;

        $branches = $company->branches()
            ->with('restaurant')
            ->latest()
            ->paginate(15);

        return Inertia::render('company/branches/index', [
            'branches' => $branches,
            'company' => $company,
        ]);
    }

    public function create(Request $request): Response
    {
        $company = $request->current_company;

        return Inertia::render('company/branches/create', [
            'company' => $company,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $company = $request->current_company;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', "unique:branches,code,NULL,id,company_id,{$company->id}"],
            'is_main' => ['boolean'],
            'restaurant_name' => ['required', 'string', 'max:255'],
            'restaurant_category' => ['nullable', 'string', 'max:100'],
            'restaurant_description' => ['nullable', 'string'],
            'restaurant_address' => ['nullable', 'string', 'max:255'],
            'restaurant_latitude' => ['nullable', 'numeric'],
            'restaurant_longitude' => ['nullable', 'numeric'],
        ]);

        $restaurant = Restaurant::create([
            'company_id' => $company->id,
            'name' => $validated['restaurant_name'],
            'slug' => Str::slug($validated['restaurant_name']) . '-' . Str::random(5),
            'category' => $validated['restaurant_category'] ?? null,
            'description' => $validated['restaurant_description'] ?? null,
            'latitude' => $validated['restaurant_latitude'] ?? null,
            'longitude' => $validated['restaurant_longitude'] ?? null,
            'is_active' => true,
        ]);

        Branch::create([
            'company_id' => $company->id,
            'restaurant_id' => $restaurant->id,
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'is_main' => $validated['is_main'] ?? false,
            'is_active' => true,
        ]);

        return redirect()
            ->route('company.branches.index')
            ->with('success', 'Sucursal creada correctamente.');
    }

    public function show(Request $request, Branch $branch): Response
    {
        $company = $request->current_company;

        if ($branch->company_id !== $company->id) {
            abort(403);
        }

        $branch->load('restaurant.menuItems');

        $stats = [
            'total_orders' => $branch->orders()->count(),
            'total_revenue' => $branch->orders()->where('status', 'completed')->sum('total_amount'),
            'total_reservations' => $branch->reservations()->count(),
            'menu_items' => $branch->menuItems()->count(),
        ];

        return Inertia::render('company/branches/show', [
            'branch' => $branch,
            'stats' => $stats,
        ]);
    }

    public function edit(Request $request, Branch $branch): Response
    {
        $company = $request->current_company;

        if ($branch->company_id !== $company->id) {
            abort(403);
        }

        $branch->load('restaurant');

        return Inertia::render('company/branches/edit', [
            'branch' => $branch,
            'company' => $company,
        ]);
    }

    public function update(Request $request, Branch $branch): RedirectResponse
    {
        $company = $request->current_company;

        if ($branch->company_id !== $company->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', "unique:branches,code,{$branch->id},id,company_id,{$company->id}"],
            'is_main' => ['boolean'],
            'is_active' => ['boolean'],
            'restaurant_name' => ['required', 'string', 'max:255'],
            'restaurant_category' => ['nullable', 'string', 'max:100'],
            'restaurant_description' => ['nullable', 'string'],
            'restaurant_latitude' => ['nullable', 'numeric'],
            'restaurant_longitude' => ['nullable', 'numeric'],
        ]);

        $branch->update([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'is_main' => $validated['is_main'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if ($branch->restaurant) {
            $branch->restaurant->update([
                'name' => $validated['restaurant_name'],
                'category' => $validated['restaurant_category'],
                'description' => $validated['restaurant_description'],
                'latitude' => $validated['restaurant_latitude'],
                'longitude' => $validated['restaurant_longitude'],
            ]);
        }

        return redirect()
            ->route('company.branches.show', $branch)
            ->with('success', 'Sucursal actualizada correctamente.');
    }

    public function destroy(Request $request, Branch $branch): RedirectResponse
    {
        $company = $request->current_company;

        if ($branch->company_id !== $company->id) {
            abort(403);
        }

        if ($branch->is_main && $company->branches()->count() > 1) {
            return back()->with('error', 'No puedes eliminar la sucursal principal mientras haya otras sucursales.');
        }

        $branch->restaurant?->delete();
        $branch->delete();

        return redirect()
            ->route('company.branches.index')
            ->with('success', 'Sucursal eliminada correctamente.');
    }

    public function toggleStatus(Request $request, Branch $branch): RedirectResponse
    {
        $company = $request->current_company;

        if ($branch->company_id !== $company->id) {
            abort(403);
        }

        $branch->update(['is_active' => !$branch->is_active]);

        if ($branch->restaurant) {
            $branch->restaurant->update(['is_active' => $branch->is_active]);
        }

        $status = $branch->is_active ? 'activada' : 'desactivada';

        return back()->with('success', "Sucursal {$status} correctamente.");
    }
}
