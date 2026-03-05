<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeaturedController extends Controller
{
    public function index(): Response
    {
        $featuredCompanies = Company::where('is_featured', true)
            ->with('mainRestaurant')
            ->orderBy('featured_order')
            ->get();

        $featuredBranches = Branch::where('is_featured', true)
            ->with(['company', 'restaurant'])
            ->orderBy('featured_order')
            ->get();

        $availableCompanies = Company::where('is_active', true)
            ->where('is_featured', false)
            ->with('mainRestaurant')
            ->orderBy('name')
            ->get();

        $availableBranches = Branch::where('is_active', true)
            ->where('is_featured', false)
            ->with(['company', 'restaurant'])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/featured/index', [
            'featuredCompanies' => $featuredCompanies,
            'featuredBranches' => $featuredBranches,
            'availableCompanies' => $availableCompanies,
            'availableBranches' => $availableBranches,
        ]);
    }

    public function toggleCompany(Company $company): RedirectResponse
    {
        $company->update([
            'is_featured' => !$company->is_featured,
            'featured_order' => $company->is_featured ? 0 : Company::where('is_featured', true)->max('featured_order') + 1,
        ]);

        return back()->with('success', $company->is_featured 
            ? 'Empresa agregada a destacados.' 
            : 'Empresa removida de destacados.');
    }

    public function toggleBranch(Branch $branch): RedirectResponse
    {
        $branch->update([
            'is_featured' => !$branch->is_featured,
            'featured_order' => $branch->is_featured ? 0 : Branch::where('is_featured', true)->max('featured_order') + 1,
        ]);

        return back()->with('success', $branch->is_featured 
            ? 'Sucursal agregada a destacados.' 
            : 'Sucursal removida de destacados.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'companies' => 'array',
            'companies.*.id' => 'required|exists:companies,id',
            'companies.*.order' => 'required|integer|min:0',
            'branches' => 'array',
            'branches.*.id' => 'required|exists:branches,id',
            'branches.*.order' => 'required|integer|min:0',
        ]);

        foreach ($validated['companies'] ?? [] as $item) {
            Company::where('id', $item['id'])->update(['featured_order' => $item['order']]);
        }

        foreach ($validated['branches'] ?? [] as $item) {
            Branch::where('id', $item['id'])->update(['featured_order' => $item['order']]);
        }

        return back()->with('success', 'Orden actualizado correctamente.');
    }
}
