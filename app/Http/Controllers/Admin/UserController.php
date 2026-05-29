<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AdminActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::withCount('orders')->select(['id', 'name', 'email', 'role', 'admin_notes', 'created_at'])->latest();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        return Inertia::render('admin/users', [
            'users' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function updateNote(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $user->update(['admin_notes' => $request->admin_notes]);

        AdminActivityLogger::log(
            'user.note_updated',
            User::class,
            $user->id,
            "Admin note updated for user #{$user->id} ({$user->email})."
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Customer note saved.']);

        return back();
    }
}
