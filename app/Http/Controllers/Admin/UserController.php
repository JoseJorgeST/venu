<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::with(['roles', 'companies']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            $query->role($role);
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        $roles = Role::all(['id', 'name']);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function create(): Response
    {
        $roles = Role::all(['id', 'name']);
        $companies = Company::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('admin/users/create', [
            'roles' => $roles,
            'companies' => $companies,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', 'exists:roles,name'],
            'company_ids' => ['nullable', 'array'],
            'company_ids.*' => ['exists:companies,id'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => bcrypt($validated['password'] ?? Str::random(16)),
        ]);

        $user->assignRole($validated['role']);

        if (!empty($validated['company_ids']) && $validated['role'] === 'admin') {
            foreach ($validated['company_ids'] as $companyId) {
                $company = Company::find($companyId);
                $company?->addUser($user, 'manager');
            }
        }

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Usuario creado correctamente.');
    }

    public function show(User $user): Response
    {
        $user->load(['roles', 'companies', 'orders', 'reservations']);

        $stats = [
            'total_orders' => $user->orders()->count(),
            'total_spent' => $user->orders()->where('status', 'completed')->sum('total_amount'),
            'total_reservations' => $user->reservations()->count(),
            'wallet_points' => $user->wallet_points,
        ];

        return Inertia::render('admin/users/show', [
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    public function edit(User $user): Response
    {
        $user->load(['roles', 'companies']);
        $roles = Role::all(['id', 'name']);
        $companies = Company::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('admin/users/edit', [
            'user' => $user,
            'roles' => $roles,
            'companies' => $companies,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', 'exists:roles,name'],
            'company_ids' => ['nullable', 'array'],
            'company_ids.*' => ['exists:companies,id'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => bcrypt($validated['password'])]);
        }

        $user->syncRoles([$validated['role']]);

        if ($validated['role'] === 'admin' && !empty($validated['company_ids'])) {
            $user->companies()->sync(
                collect($validated['company_ids'])->mapWithKeys(fn ($id) => [$id => ['role' => 'manager']])->all()
            );
        } elseif ($validated['role'] !== 'admin') {
            $user->companies()->detach();
        }

        return redirect()
            ->route('admin.users.show', $user)
            ->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->isSuperAdmin()) {
            return back()->with('error', 'No se puede eliminar un super administrador.');
        }

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Usuario eliminado correctamente.');
    }

    public function assignRole(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'exists:roles,name'],
        ]);

        $user->syncRoles([$validated['role']]);

        return back()->with('success', 'Rol asignado correctamente.');
    }
}
