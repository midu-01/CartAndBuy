<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::withCount('orders')->latest();

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
}
