<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/roles', [
            'roles' => Role::with('permissions')->get(),
            'permissions' => Permission::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:roles,name'],
        ]);

        Role::create(['name' => $request->name, 'guard_name' => 'web']);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Role \"{$request->name}\" created."]);

        return back();
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100', "unique:roles,name,{$role->id}"],
        ]);

        $role->update(['name' => $request->name]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role updated.']);

        return back();
    }

    public function destroy(Role $role): RedirectResponse
    {
        abort_if($role->name === 'super_admin', 422, 'The super_admin role cannot be deleted.');

        $role->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role deleted.']);

        return back();
    }
}
