<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\TableLocation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TableLocationController extends Controller
{
    public function store(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable'],
        ]);

        $maxOrder = TableLocation::where('company_id', $company->id)->max('sort_order') ?? 0;

        TableLocation::create([
            'company_id' => $company->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $maxOrder + 1,
        ]);

        return back()->with('status', 'Ubicación creada correctamente.');
    }

    public function update(Request $request, Company $company, TableLocation $tableLocation): RedirectResponse
    {
        if ($tableLocation->company_id !== $company->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable'],
        ]);

        $tableLocation->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('status', 'Ubicación actualizada correctamente.');
    }

    public function destroy(Company $company, TableLocation $tableLocation): RedirectResponse
    {
        if ($tableLocation->company_id !== $company->id) {
            abort(403);
        }

        $tableLocation->delete();

        return back()->with('status', 'Ubicación eliminada correctamente.');
    }

    public function reorder(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'locations' => ['required', 'array'],
            'locations.*.id' => ['required', 'integer', 'exists:table_locations,id'],
            'locations.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['locations'] as $locationData) {
            TableLocation::where('id', $locationData['id'])
                ->where('company_id', $company->id)
                ->update(['sort_order' => $locationData['sort_order']]);
        }

        return back()->with('status', 'Orden actualizado correctamente.');
    }
}
