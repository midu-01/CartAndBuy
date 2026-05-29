<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        $permissions = [
            'view reports', 'export reports',
            'view orders', 'manage orders', 'bulk update orders',
            'view products', 'manage products', 'bulk update products',
            'manage coupons', 'bulk generate coupons',
            'manage payments', 'manage refunds',
            'manage users', 'add customer notes',
            'manage roles', 'view activity log',
            'create manual order',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // create roles and assign created permissions
        $roleSuperAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $roleSuperAdmin->givePermissionTo(Permission::all());

        $roleOrderManager = Role::firstOrCreate(['name' => 'order_manager']);
        $roleOrderManager->givePermissionTo([
            'view orders', 'manage orders', 'bulk update orders',
            'manage payments', 'manage refunds', 'create manual order',
        ]);

        $roleProductManager = Role::firstOrCreate(['name' => 'product_manager']);
        $roleProductManager->givePermissionTo([
            'view products', 'manage products', 'bulk update products',
            'manage coupons', 'bulk generate coupons',
        ]);

        $roleReportViewer = Role::firstOrCreate(['name' => 'report_viewer']);
        $roleReportViewer->givePermissionTo(['view reports', 'export reports']);

        $roleSupportAgent = Role::firstOrCreate(['name' => 'support_agent']);
    }
}
