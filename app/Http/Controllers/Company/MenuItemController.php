<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\MenuItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MenuItemController extends Controller
{
    public function menu(Request $request): Response
    {
        $company = $request->current_company;
        $branch = $request->current_branch;

        if (!$company) {
            return Inertia::render('company/no-company');
        }

        if ($branch) {
            $branch->load('restaurant');
        }
        $restaurant = $branch ? $branch->restaurant : $company->mainRestaurant;

        if (!$restaurant) {
            return Inertia::render('company/menu-items/index', [
                'branch' => $branch,
                'menuItems' => ['data' => [], 'links' => [], 'current_page' => 1, 'last_page' => 1],
                'categories' => [],
                'filters' => [],
                'restaurant' => null,
            ]);
        }

        $query = MenuItem::where('restaurant_id', $restaurant->id);

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $menuItems = $query->orderBy('category')->orderBy('name')->paginate(20)->withQueryString();

        $categories = MenuItem::where('restaurant_id', $restaurant->id)
            ->distinct()
            ->pluck('category')
            ->filter();

        return Inertia::render('company/menu-items/index', [
            'branch' => $branch,
            'menuItems' => $menuItems,
            'categories' => $categories,
            'filters' => $request->only(['category', 'search']),
            'restaurant' => $restaurant,
        ]);
    }

    public function index(Request $request, Branch $branch): Response
    {
        $company = $request->current_company;

        if ($branch->company_id !== $company->id) {
            abort(403);
        }

        $query = MenuItem::where('restaurant_id', $branch->restaurant_id);

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $menuItems = $query->orderBy('category')->orderBy('name')->paginate(20)->withQueryString();

        $categories = MenuItem::where('restaurant_id', $branch->restaurant_id)
            ->distinct()
            ->pluck('category')
            ->filter();

        return Inertia::render('company/menu-items/index', [
            'branch' => $branch,
            'menuItems' => $menuItems,
            'categories' => $categories,
            'filters' => $request->only(['category', 'search']),
        ]);
    }

    public function create(Request $request, Branch $branch): Response
    {
        $company = $request->current_company;

        if ($branch->company_id !== $company->id) {
            abort(403);
        }

        $categories = MenuItem::where('restaurant_id', $branch->restaurant_id)
            ->distinct()
            ->pluck('category')
            ->filter();

        return Inertia::render('company/menu-items/create', [
            'branch' => $branch,
            'existingCategories' => $categories,
        ]);
    }

    public function store(Request $request, Branch $branch): RedirectResponse
    {
        $company = $request->current_company;

        if ($branch->company_id !== $company->id) {
            abort(403);
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
            'restaurant_id' => $branch->restaurant_id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'category' => $validated['category'] ?? null,
            'image_url' => $validated['image_url'] ?? null,
            'is_available' => $validated['is_available'] ?? true,
        ]);

        return redirect()
            ->route('company.branches.menu-items.index', $branch)
            ->with('success', 'Producto creado correctamente.');
    }

    public function edit(Request $request, Branch $branch, MenuItem $menuItem): Response
    {
        $company = $request->current_company;

        if ($branch->company_id !== $company->id || $menuItem->restaurant_id !== $branch->restaurant_id) {
            abort(403);
        }

        $categories = MenuItem::where('restaurant_id', $branch->restaurant_id)
            ->distinct()
            ->pluck('category')
            ->filter();

        return Inertia::render('company/menu-items/edit', [
            'branch' => $branch,
            'menuItem' => $menuItem,
            'existingCategories' => $categories,
        ]);
    }

    public function update(Request $request, Branch $branch, MenuItem $menuItem): RedirectResponse
    {
        $company = $request->current_company;

        if ($branch->company_id !== $company->id || $menuItem->restaurant_id !== $branch->restaurant_id) {
            abort(403);
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

        return redirect()
            ->route('company.branches.menu-items.index', $branch)
            ->with('success', 'Producto actualizado correctamente.');
    }

    public function destroy(Request $request, Branch $branch, MenuItem $menuItem): RedirectResponse
    {
        $company = $request->current_company;

        if ($branch->company_id !== $company->id || $menuItem->restaurant_id !== $branch->restaurant_id) {
            abort(403);
        }

        $menuItem->delete();

        return redirect()
            ->route('company.branches.menu-items.index', $branch)
            ->with('success', 'Producto eliminado correctamente.');
    }

    public function toggleAvailability(Request $request, Branch $branch, MenuItem $menuItem): RedirectResponse
    {
        $company = $request->current_company;

        if ($branch->company_id !== $company->id || $menuItem->restaurant_id !== $branch->restaurant_id) {
            abort(403);
        }

        $menuItem->update(['is_available' => !$menuItem->is_available]);

        $status = $menuItem->is_available ? 'disponible' : 'no disponible';

        return back()->with('success', "Producto marcado como {$status}.");
    }

    private function getRestaurantForCompany(Request $request)
    {
        $company = $request->current_company;
        $branch = $request->current_branch;

        return $branch?->restaurant ?? $company->restaurants()->first();
    }

    public function createForCompany(Request $request): Response
    {
        $company = $request->current_company;
        $restaurant = $this->getRestaurantForCompany($request);

        if (!$restaurant) {
            return redirect()->route('company.menu')
                ->with('error', 'No hay un restaurante configurado.');
        }

        $categories = MenuItem::where('restaurant_id', $restaurant->id)
            ->distinct()
            ->pluck('category')
            ->filter();

        return Inertia::render('company/menu-items/create', [
            'branch' => $request->current_branch,
            'existingCategories' => $categories,
            'restaurant' => $restaurant,
        ]);
    }

    public function storeForCompany(Request $request): RedirectResponse
    {
        $restaurant = $this->getRestaurantForCompany($request);

        if (!$restaurant) {
            return redirect()->route('company.menu')
                ->with('error', 'No hay un restaurante configurado.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'category' => ['nullable', 'string', 'max:100'],
            'image_url' => ['nullable', 'string', 'max:255'],
            'is_available' => ['nullable'],
        ]);

        MenuItem::create([
            'restaurant_id' => $restaurant->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'category' => $validated['category'] ?? null,
            'image_url' => $validated['image_url'] ?? null,
            'is_available' => $request->boolean('is_available', true),
        ]);

        return redirect()
            ->route('company.menu')
            ->with('success', 'Producto creado correctamente.');
    }

    public function editForCompany(Request $request, MenuItem $menuItem): Response
    {
        $restaurant = $this->getRestaurantForCompany($request);

        if (!$restaurant || $menuItem->restaurant_id !== $restaurant->id) {
            abort(403);
        }

        $categories = MenuItem::where('restaurant_id', $restaurant->id)
            ->distinct()
            ->pluck('category')
            ->filter();

        return Inertia::render('company/menu-items/edit', [
            'branch' => $request->current_branch,
            'menuItem' => $menuItem,
            'existingCategories' => $categories,
            'restaurant' => $restaurant,
        ]);
    }

    public function updateForCompany(Request $request, MenuItem $menuItem): RedirectResponse
    {
        $restaurant = $this->getRestaurantForCompany($request);

        if (!$restaurant || $menuItem->restaurant_id !== $restaurant->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'category' => ['nullable', 'string', 'max:100'],
            'image_url' => ['nullable', 'string', 'max:255'],
            'is_available' => ['nullable'],
        ]);

        $menuItem->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'category' => $validated['category'] ?? null,
            'image_url' => $validated['image_url'] ?? null,
            'is_available' => $request->boolean('is_available', true),
        ]);

        return redirect()
            ->route('company.menu')
            ->with('success', 'Producto actualizado correctamente.');
    }

    public function destroyForCompany(Request $request, MenuItem $menuItem): RedirectResponse
    {
        $restaurant = $this->getRestaurantForCompany($request);

        if (!$restaurant || $menuItem->restaurant_id !== $restaurant->id) {
            abort(403);
        }

        $menuItem->delete();

        return redirect()
            ->route('company.menu')
            ->with('success', 'Producto eliminado correctamente.');
    }

    public function toggleAvailabilityForCompany(Request $request, MenuItem $menuItem): RedirectResponse
    {
        $restaurant = $this->getRestaurantForCompany($request);

        if (!$restaurant || $menuItem->restaurant_id !== $restaurant->id) {
            abort(403);
        }

        $menuItem->update(['is_available' => !$menuItem->is_available]);

        $status = $menuItem->is_available ? 'disponible' : 'no disponible';

        return back()->with('success', "Producto marcado como {$status}.");
    }
}
