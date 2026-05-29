<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller
{
    public function sync(Request $request, Role $role): RedirectResponse
    {
        abort_if($role->name === 'super_admin', 422, 'super_admin permissions cannot be modified.');

        $request->validate([
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role->syncPermissions($request->permissions);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Permissions for \"{$role->name}\" updated."]);

        return back();
    }
}
