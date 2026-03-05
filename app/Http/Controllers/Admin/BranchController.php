<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Company;
use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    public function create(Company $company): Response
    {
        return Inertia::render('admin/branches/create', [
            'company' => $company,
        ]);
    }

    public function store(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'is_main' => ['boolean'],
            'restaurant_name' => ['required', 'string', 'max:255'],
            'restaurant_category' => ['nullable', 'string', 'max:100'],
            'restaurant_description' => ['nullable', 'string'],
            'restaurant_address' => ['nullable', 'string', 'max:255'],
        ]);

        $restaurant = Restaurant::create([
            'company_id' => $company->id,
            'name' => $validated['restaurant_name'],
            'slug' => Str::slug($validated['restaurant_name']) . '-' . Str::random(5),
            'category' => $validated['restaurant_category'] ?? null,
            'description' => $validated['restaurant_description'] ?? null,
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
            ->route('admin.companies.show', $company)
            ->with('success', 'Sucursal creada correctamente.');
    }

    public function show(Company $company, Branch $branch): Response
    {
        if ($branch->company_id !== $company->id) {
            abort(404);
        }

        $branch->load('restaurant.menuItems');

        $stats = [
            'total_orders' => $branch->restaurant ? $branch->restaurant->orders()->count() : 0,
            'total_revenue' => $branch->restaurant ? $branch->restaurant->orders()->where('status', 'completed')->sum('total_amount') : 0,
            'menu_items' => $branch->restaurant ? $branch->restaurant->menuItems()->count() : 0,
        ];

        return Inertia::render('admin/branches/show', [
            'company' => $company,
            'branch' => $branch,
            'stats' => $stats,
            'stripeStatus' => [
                'has_key' => !empty($branch->stripe_key),
                'has_secret' => !empty($branch->stripe_secret),
                'has_webhook' => !empty($branch->stripe_webhook_secret),
                'enabled' => $branch->stripe_enabled,
            ],
        ]);
    }

    public function edit(Company $company, Branch $branch): Response
    {
        if ($branch->company_id !== $company->id) {
            abort(404);
        }

        $branch->load('restaurant');

        return Inertia::render('admin/branches/edit', [
            'company' => $company,
            'branch' => $branch,
            'stripeStatus' => [
                'has_key' => !empty($branch->stripe_key),
                'has_secret' => !empty($branch->stripe_secret),
                'has_webhook' => !empty($branch->stripe_webhook_secret),
                'enabled' => $branch->stripe_enabled,
            ],
        ]);
    }

    public function update(Request $request, Company $company, Branch $branch): RedirectResponse
    {
        if ($branch->company_id !== $company->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'is_main' => ['boolean'],
            'is_active' => ['boolean'],
            'restaurant_name' => ['required', 'string', 'max:255'],
            'restaurant_category' => ['nullable', 'string', 'max:100'],
            'restaurant_description' => ['nullable', 'string'],
            'stripe_key' => ['nullable', 'string', 'max:255'],
            'stripe_secret' => ['nullable', 'string', 'max:255'],
            'stripe_webhook_secret' => ['nullable', 'string', 'max:255'],
            'stripe_enabled' => ['boolean'],
        ]);

        $branchData = [
            'name' => $validated['name'],
            'code' => $validated['code'],
            'is_main' => $validated['is_main'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'stripe_enabled' => $validated['stripe_enabled'] ?? false,
        ];

        // Solo actualizar las keys si se proporcionan valores no vacíos
        if (!empty($validated['stripe_key'])) {
            $branchData['stripe_key'] = $validated['stripe_key'];
        }
        if (!empty($validated['stripe_secret'])) {
            $branchData['stripe_secret'] = $validated['stripe_secret'];
        }
        if (!empty($validated['stripe_webhook_secret'])) {
            $branchData['stripe_webhook_secret'] = $validated['stripe_webhook_secret'];
        }

        $branch->update($branchData);

        if ($branch->restaurant) {
            $branch->restaurant->update([
                'name' => $validated['restaurant_name'],
                'category' => $validated['restaurant_category'],
                'description' => $validated['restaurant_description'],
                'is_active' => $validated['is_active'] ?? true,
            ]);
        }

        return redirect()
            ->route('admin.companies.branches.show', [$company, $branch])
            ->with('success', 'Sucursal actualizada correctamente.');
    }

    public function destroy(Company $company, Branch $branch): RedirectResponse
    {
        if ($branch->company_id !== $company->id) {
            abort(404);
        }

        $branch->restaurant?->delete();
        $branch->delete();

        return redirect()
            ->route('admin.companies.show', $company)
            ->with('success', 'Sucursal eliminada correctamente.');
    }

    public function menu(Company $company, Branch $branch): Response
    {
        if ($branch->company_id !== $company->id) {
            abort(404);
        }

        $branch->load('restaurant');

        $menuItems = $branch->restaurant
            ? MenuItem::where('restaurant_id', $branch->restaurant->id)
                ->orderBy('category')
                ->orderBy('name')
                ->paginate(20)
            : collect();

        $categories = $branch->restaurant
            ? MenuItem::where('restaurant_id', $branch->restaurant->id)
                ->distinct()
                ->pluck('category')
                ->filter()
            : collect();

        return Inertia::render('admin/branches/menu', [
            'company' => $company,
            'branch' => $branch,
            'menuItems' => $menuItems,
            'categories' => $categories,
        ]);
    }

    public function storeMenuItem(Request $request, Company $company, Branch $branch): RedirectResponse
    {
        if ($branch->company_id !== $company->id || !$branch->restaurant) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'category' => ['nullable', 'string', 'max:100'],
            'image_url' => ['nullable', 'url', 'max:255'],
            'is_available' => ['boolean'],
        ]);

        MenuItem::create([
            'restaurant_id' => $branch->restaurant->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'category' => $validated['category'] ?? null,
            'image_url' => $validated['image_url'] ?? null,
            'is_available' => $validated['is_available'] ?? true,
        ]);

        return back()->with('success', 'Producto creado correctamente.');
    }

    public function updateMenuItem(Request $request, Company $company, Branch $branch, MenuItem $menuItem): RedirectResponse
    {
        if ($branch->company_id !== $company->id || !$branch->restaurant || $menuItem->restaurant_id !== $branch->restaurant->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'category' => ['nullable', 'string', 'max:100'],
            'image_url' => ['nullable', 'url', 'max:255'],
            'is_available' => ['boolean'],
        ]);

        $menuItem->update($validated);

        return back()->with('success', 'Producto actualizado correctamente.');
    }

    public function destroyMenuItem(Company $company, Branch $branch, MenuItem $menuItem): RedirectResponse
    {
        if ($branch->company_id !== $company->id || !$branch->restaurant || $menuItem->restaurant_id !== $branch->restaurant->id) {
            abort(404);
        }

        $menuItem->delete();

        return back()->with('success', 'Producto eliminado correctamente.');
    }
}
