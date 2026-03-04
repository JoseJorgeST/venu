<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $this->createPermissions();
        $this->createRoles();
    }

    private function createPermissions(): void
    {
        $permissions = [
            // Companies
            'companies.view_any',
            'companies.view',
            'companies.create',
            'companies.update',
            'companies.delete',

            // Branches
            'branches.view_any',
            'branches.view',
            'branches.create',
            'branches.update',
            'branches.delete',

            // Restaurants
            'restaurants.view_any',
            'restaurants.view',
            'restaurants.create',
            'restaurants.update',
            'restaurants.delete',

            // Menu Items
            'menu_items.view_any',
            'menu_items.view',
            'menu_items.create',
            'menu_items.update',
            'menu_items.delete',

            // Orders
            'orders.view_any',
            'orders.view',
            'orders.create',
            'orders.update',
            'orders.delete',

            // Reservations
            'reservations.view_any',
            'reservations.view',
            'reservations.create',
            'reservations.update',
            'reservations.delete',

            // Users
            'users.view_any',
            'users.view',
            'users.create',
            'users.update',
            'users.delete',

            // Reports
            'reports.view_global',
            'reports.view_company',

            // Settings
            'settings.view',
            'settings.update',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }
    }

    private function createRoles(): void
    {
        // Super Admin - Full access to everything
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        // Admin - Company owner/manager
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->syncPermissions([
            // Own companies only (scoped by middleware)
            'companies.view',
            'companies.update',

            // Branches management
            'branches.view_any',
            'branches.view',
            'branches.create',
            'branches.update',
            'branches.delete',

            // Restaurants management
            'restaurants.view_any',
            'restaurants.view',
            'restaurants.create',
            'restaurants.update',
            'restaurants.delete',

            // Menu Items management
            'menu_items.view_any',
            'menu_items.view',
            'menu_items.create',
            'menu_items.update',
            'menu_items.delete',

            // Orders (view and update status)
            'orders.view_any',
            'orders.view',
            'orders.update',

            // Reservations
            'reservations.view_any',
            'reservations.view',
            'reservations.update',

            // Company reports
            'reports.view_company',

            // Settings
            'settings.view',
            'settings.update',
        ]);

        // Customer - Regular user
        $customer = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
        $customer->syncPermissions([
            // View restaurants and menu
            'restaurants.view_any',
            'restaurants.view',
            'menu_items.view_any',
            'menu_items.view',

            // Own orders
            'orders.view',
            'orders.create',

            // Own reservations
            'reservations.view',
            'reservations.create',
            'reservations.update',
            'reservations.delete',
        ]);
    }
}
