<?php

namespace Tests;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Fortify\Features;
use Spatie\Permission\PermissionRegistrar;

abstract class TestCase extends BaseTestCase
{
    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }

    /**
     * Seed roles/permissions and create a super_admin user.
     * Call this in any test that hits permission-guarded admin routes.
     */
    protected function createSuperAdmin(array $overrides = []): User
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $this->seed(RolesAndPermissionsSeeder::class);

        $user = User::factory()->create(array_merge(['role' => 'admin'], $overrides));
        $user->assignRole('super_admin');

        return $user;
    }

    /**
     * Create an admin user with a specific Spatie role.
     * Requires roles/permissions to already be seeded.
     */
    protected function createAdminWithRole(string $role, array $overrides = []): User
    {
        $user = User::factory()->create(array_merge(['role' => 'admin'], $overrides));
        $user->assignRole($role);

        return $user;
    }
}
