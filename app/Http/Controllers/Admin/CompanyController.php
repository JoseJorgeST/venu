<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\TableLocation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Company::with(['owner', 'branches'])
            ->withCount(['branches', 'users']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('owner', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('status')) {
            $query->where('is_active', $request->boolean('status'));
        }

        $companies = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('admin/companies/index', [
            'companies' => $companies,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        $admins = User::role('admin')->get(['id', 'name', 'email']);
        $availableAdmins = User::role('admin')
            ->whereDoesntHave('ownedCompanies')
            ->get(['id', 'name', 'email']);

        return Inertia::render('admin/companies/create', [
            'admins' => $admins,
            'availableAdmins' => $availableAdmins,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $hasOwnerId = !empty($request->input('owner_id'));
        
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:companies,slug'],
            'owner_id' => ['nullable', 'exists:users,id'],
            'logo_url' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable'],
            'locations' => ['nullable', 'array'],
            'locations.*.name' => ['required_with:locations', 'string', 'max:50'],
            'locations.*.description' => ['nullable', 'string', 'max:255'],
        ];

        if (!$hasOwnerId) {
            $rules['owner_name'] = ['required', 'string', 'max:255'];
            $rules['owner_email'] = ['required', 'email', 'unique:users,email'];
        }

        $validated = $request->validate($rules);

        $ownerId = $validated['owner_id'] ?? null;

        if (empty($ownerId)) {
            $owner = User::create([
                'name' => $validated['owner_name'],
                'email' => $validated['owner_email'],
                'password' => bcrypt(Str::random(16)),
            ]);
            $owner->assignRole('admin');
            $ownerId = $owner->id;
        }

        $company = Company::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']),
            'owner_id' => $ownerId,
            'logo_url' => $validated['logo_url'] ?? null,
            'description' => $validated['description'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'tax_id' => $validated['tax_id'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        $company->addUser(User::find($ownerId), 'owner');

        if (!empty($validated['locations'])) {
            foreach ($validated['locations'] as $index => $locationData) {
                TableLocation::create([
                    'company_id' => $company->id,
                    'name' => $locationData['name'],
                    'description' => $locationData['description'] ?? null,
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ]);
            }
        }

        return redirect()
            ->route('admin.companies.index')
            ->with('success', 'Empresa creada correctamente.');
    }

    public function show(Company $company): Response
    {
        $company->load([
            'owner',
            'branches.restaurant',
            'users',
            'tableLocations',
        ]);

        $stats = [
            'total_branches' => $company->branches()->count(),
            'total_orders' => $company->orders()->count(),
            'total_revenue' => $company->orders()->where('status', 'completed')->sum('total_amount'),
            'total_reservations' => $company->reservations()->count(),
        ];

        return Inertia::render('admin/companies/show', [
            'company' => $company,
            'stats' => $stats,
            'stripeStatus' => [
                'has_secret' => !empty($company->stripe_secret),
                'has_webhook' => !empty($company->stripe_webhook_secret),
            ],
        ]);
    }

    public function edit(Company $company): Response
    {
        $company->load(['owner', 'users', 'tableLocations']);
        
        $admins = User::role('admin')->get(['id', 'name', 'email']);

        return Inertia::render('admin/companies/edit', [
            'company' => $company,
            'admins' => $admins,
            'stripeStatus' => [
                'has_secret' => !empty($company->stripe_secret),
                'has_webhook' => !empty($company->stripe_webhook_secret),
            ],
        ]);
    }

    public function update(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('companies')->ignore($company->id)],
            'owner_id' => ['required', 'exists:users,id'],
            'logo_url' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable'],
            'remove_previous_owner' => ['nullable'],
            'stripe_key' => ['nullable', 'string', 'max:255'],
            'stripe_secret' => ['nullable', 'string', 'max:255'],
            'stripe_webhook_secret' => ['nullable', 'string', 'max:255'],
            'stripe_enabled' => ['nullable'],
        ]);

        $newOwnerId = (int) $validated['owner_id'];
        
        if ($company->owner_id !== $newOwnerId) {
            $previousOwnerId = $company->owner_id;
            
            if ($request->boolean('remove_previous_owner')) {
                $company->removeUser(User::find($previousOwnerId));
            } else {
                $company->users()->updateExistingPivot($previousOwnerId, ['role' => 'manager']);
            }
            
            $newOwner = User::find($newOwnerId);
            if (!$newOwner->hasRole('admin')) {
                $newOwner->assignRole('admin');
            }
            $company->addUser($newOwner, 'owner');
        }

        $updateData = [
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']),
            'owner_id' => $newOwnerId,
            'logo_url' => $validated['logo_url'] ?? null,
            'description' => $validated['description'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'tax_id' => $validated['tax_id'] ?? null,
            'is_active' => $request->boolean('is_active', true),
            'stripe_enabled' => $request->boolean('stripe_enabled', false),
        ];

        if (!empty($validated['stripe_key'])) {
            $updateData['stripe_key'] = $validated['stripe_key'];
        }

        if (!empty($validated['stripe_secret'])) {
            $updateData['stripe_secret'] = $validated['stripe_secret'];
        }

        if (!empty($validated['stripe_webhook_secret'])) {
            $updateData['stripe_webhook_secret'] = $validated['stripe_webhook_secret'];
        }

        $company->update($updateData);

        return redirect()
            ->route('admin.companies.show', $company)
            ->with('success', 'Empresa actualizada correctamente.');
    }

    public function destroy(Company $company): RedirectResponse
    {
        $company->delete();

        return redirect()
            ->route('admin.companies.index')
            ->with('success', 'Empresa eliminada correctamente.');
    }

    public function toggleStatus(Company $company): RedirectResponse
    {
        $company->update(['is_active' => !$company->is_active]);

        $status = $company->is_active ? 'activada' : 'desactivada';

        return back()->with('success', "Empresa {$status} correctamente.");
    }
}
