<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/categories', [
            'categories' => Category::with('parent')->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id'
        ]);
        $validated['slug'] = Str::slug($validated['name']);
        
        Category::create($validated);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category created']);
        return back();
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id'
        ]);
        $validated['slug'] = Str::slug($validated['name']);

        $category->update($validated);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category updated']);
        return back();
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return back();
    }
}