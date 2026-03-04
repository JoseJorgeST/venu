<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\TableLocation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TableLocationController extends Controller
{
    public function index(Request $request): Response
    {
        $company = $request->current_company;

        if (!$company) {
            return Inertia::render('company/no-company');
        }

        $locations = TableLocation::where('company_id', $company->id)
            ->with('restaurant')
            ->ordered()
            ->get();

        return Inertia::render('company/table-locations/index', [
            'locations' => $locations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $company = $request->current_company;

        if (!$company) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:255'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'restaurant_id' => ['nullable', 'exists:restaurants,id'],
            'is_active' => ['nullable'],
        ]);

        TableLocation::create([
            'company_id' => $company->id,
            'restaurant_id' => $validated['restaurant_id'] ?? null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'capacity' => $validated['capacity'] ?? null,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => TableLocation::where('company_id', $company->id)->max('sort_order') + 1,
        ]);

        return back()->with('success', 'Ubicación creada correctamente.');
    }

    public function update(Request $request, TableLocation $tableLocation): RedirectResponse
    {
        $company = $request->current_company;

        if (!$company || $tableLocation->company_id !== $company->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:255'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable'],
        ]);

        $tableLocation->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'capacity' => $validated['capacity'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Ubicación actualizada correctamente.');
    }

    public function destroy(Request $request, TableLocation $tableLocation): RedirectResponse
    {
        $company = $request->current_company;

        if (!$company || $tableLocation->company_id !== $company->id) {
            abort(403);
        }

        $tableLocation->delete();

        return back()->with('success', 'Ubicación eliminada correctamente.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $company = $request->current_company;

        if (!$company) {
            abort(403);
        }

        $validated = $request->validate([
            'locations' => ['required', 'array'],
            'locations.*.id' => ['required', 'exists:table_locations,id'],
            'locations.*.sort_order' => ['required', 'integer'],
        ]);

        foreach ($validated['locations'] as $item) {
            TableLocation::where('id', $item['id'])
                ->where('company_id', $company->id)
                ->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', 'Orden actualizado.');
    }
}
