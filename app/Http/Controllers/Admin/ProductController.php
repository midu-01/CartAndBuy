<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with('category')->latest();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return Inertia::render('admin/products', [
            'products'   => $query->paginate(15)->withQueryString(),
            'categories' => Category::orderBy('name')->get(),
            'filters'    => $request->only(['search', 'category_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price'       => ['required', 'numeric', 'min:0'],
            'sale_price'  => ['nullable', 'numeric', 'min:0'],
            'stock_qty'   => ['required', 'integer', 'min:0'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'is_featured' => ['boolean'],
            'is_active'   => ['boolean'],
            'images'      => ['nullable', 'array'],
            'images.*'    => ['image', 'max:2048'],
        ]);

        $data['slug'] = Str::slug($data['name']);
        $data['images'] = $this->uploadImages($request);

        Product::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product created.']);

        return to_route('admin.products.index');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price'       => ['required', 'numeric', 'min:0'],
            'sale_price'  => ['nullable', 'numeric', 'min:0'],
            'stock_qty'   => ['required', 'integer', 'min:0'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'is_featured' => ['boolean'],
            'is_active'   => ['boolean'],
            'images'      => ['nullable', 'array'],
            'images.*'    => ['image', 'max:2048'],
        ]);

        $data['slug'] = Str::slug($data['name']);

        $newImages = $this->uploadImages($request);
        if (! empty($newImages)) {
            $data['images'] = array_merge($product->images ?? [], $newImages);
        } else {
            unset($data['images']);
        }

        $product->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product updated.']);

        return to_route('admin.products.index');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product deleted.']);

        return to_route('admin.products.index');
    }

    /** @return array<string> */
    private function uploadImages(Request $request): array
    {
        if (! $request->hasFile('images')) {
            return [];
        }

        $paths = [];
        foreach ($request->file('images') as $file) {
            $paths[] = Storage::disk('public')->url($file->store('products', 'public'));
        }

        return $paths;
    }
}
