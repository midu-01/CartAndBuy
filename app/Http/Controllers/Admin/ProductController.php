<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with(['category', 'brand', 'variants'])->latest();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('label')) {
            $query->where('label', $request->label);
        }

        return Inertia::render('admin/products', [
            'products' => $query->paginate(15)->withQueryString(),
            'categories' => Category::orderBy('name')->get(),
            'brands' => Brand::orderBy('name')->get(),
            'filters' => $request->only(['search', 'category_id', 'brand_id', 'status', 'label']),
            'lowStockCount' => Product::lowStock()->count(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateProduct($request);

        $data['slug'] = Str::slug($data['name']);
        $data['images'] = $this->uploadImages($request);
        $data['tags'] = $this->parseTags($request->input('tags'));
        $data['size_chart'] = $this->parseJsonArray($request->input('size_chart'));
        $data['faqs'] = $this->parseJsonArray($request->input('faqs'));

        $variants = $this->parseVariants($request->input('variants'));
        unset($data['variants']);

        $product = new Product;
        $product->forceFill($data)->save();
        $this->syncVariants($product, $variants);
        $this->bustProductCaches();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product created.']);

        return to_route('admin.products.index');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $this->validateProduct($request);

        $data['slug'] = Str::slug($data['name']);
        $data['tags'] = $this->parseTags($request->input('tags'));
        $data['size_chart'] = $this->parseJsonArray($request->input('size_chart'));
        $data['faqs'] = $this->parseJsonArray($request->input('faqs'));

        $newImages = $this->uploadImages($request);
        if (! empty($newImages)) {
            $data['images'] = array_merge($product->images ?? [], $newImages);
        } else {
            unset($data['images']);
        }

        $variants = $this->parseVariants($request->input('variants'));
        unset($data['variants']);

        $product->forceFill($data)->save();
        $this->syncVariants($product, $variants);
        $this->bustProductCaches();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product updated.']);

        return to_route('admin.products.index');
    }

    public function duplicate(Product $product): RedirectResponse
    {
        $clone = $product->replicate(['slug', 'sku']);
        $clone->name = $product->name.' (Copy)';
        $clone->slug = Str::slug($clone->name).'-'.Str::random(5);
        $clone->sku = $product->sku ? $product->sku.'-COPY-'.strtoupper(Str::random(3)) : null;
        $clone->status = 'draft';
        $clone->save();
        $product->variants()->each(function (ProductVariant $variant) use ($clone): void {
            $copy = $variant->replicate(['sku']);
            $copy->product_id = $clone->id;
            $copy->sku = $variant->sku ? $variant->sku.'-COPY-'.strtoupper(Str::random(3)) : null;
            $copy->save();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product duplicated as draft.']);

        return to_route('admin.products.index');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();
        $this->bustProductCaches();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product deleted.']);

        return to_route('admin.products.index');
    }

    public function export(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="products.csv"',
        ];

        return response()->streamDownload(function (): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'name', 'sku', 'description', 'price', 'sale_price', 'stock_qty',
                'status', 'is_active', 'is_featured', 'tags',
                'variant_sku', 'variant_attributes', 'variant_price_modifier', 'variant_stock_qty', 'variant_is_active',
            ]);

            Product::query()->with('variants')->orderBy('id')->chunk(100, function ($products) use ($handle): void {
                foreach ($products as $product) {
                    $baseRow = [
                        $product->name,
                        $product->sku,
                        $product->description,
                        $product->price,
                        $product->sale_price,
                        $product->stock_qty,
                        $product->status,
                        $product->is_active ? '1' : '0',
                        $product->is_featured ? '1' : '0',
                        implode(',', $product->tags ?? []),
                    ];

                    if ($product->variants->isEmpty()) {
                        fputcsv($handle, array_merge($baseRow, ['', '', '', '', '']));
                    } else {
                        foreach ($product->variants as $variant) {
                            fputcsv($handle, array_merge($baseRow, [
                                $variant->sku ?? '',
                                json_encode($variant->attributes),
                                $variant->price_modifier,
                                $variant->stock_qty,
                                $variant->is_active ? '1' : '0',
                            ]));
                        }
                    }
                }
            });

            fclose($handle);
        }, 'products.csv', $headers);
    }

    public function bulkUpdate(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:products,id'],
            'field' => ['required', 'in:status,is_active,is_featured,category_id'],
            'value' => ['required'],
        ]);

        $allowed = ['status', 'is_active', 'is_featured', 'category_id'];
        $field = $request->field;

        abort_unless(in_array($field, $allowed), 422, 'Invalid field.');

        Product::whereIn('id', $request->ids)->update([$field => $request->value]);

        Inertia::flash('toast', ['type' => 'success', 'message' => count($request->ids).' product(s) updated.']);

        return back();
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        $handle = fopen($request->file('file')->getRealPath(), 'r');
        $header = fgetcsv($handle);
        $rows = [];

        while (($row = fgetcsv($handle)) !== false) {
            $data = array_combine($header, $row);
            if ($data && filled($data['name'] ?? null)) {
                $rows[] = $data;
            }
        }

        fclose($handle);

        $groups = [];
        foreach ($rows as $row) {
            $key = filled($row['sku'] ?? null) ? 'sku:'.$row['sku'] : 'name:'.$row['name'];
            $groups[$key][] = $row;
        }

        $imported = 0;

        foreach ($groups as $groupRows) {
            $first = $groupRows[0];

            $product = filled($first['sku'] ?? null)
                ? Product::firstOrNew(['sku' => $first['sku']])
                : new Product;

            $product->forceFill([
                'name' => $first['name'],
                'slug' => $product->exists ? $product->slug : Str::slug($first['name']).'-'.Str::lower(Str::random(5)),
                'description' => $first['description'] ?? null,
                'price' => (float) ($first['price'] ?? 0),
                'sale_price' => filled($first['sale_price'] ?? null) ? (float) $first['sale_price'] : null,
                'stock_qty' => (int) ($first['stock_qty'] ?? 0),
                'status' => $first['status'] ?? 'published',
                'is_active' => (bool) ($first['is_active'] ?? true),
                'is_featured' => (bool) ($first['is_featured'] ?? false),
                'tags' => $this->parseTags($first['tags'] ?? null),
                'low_stock_threshold' => 5,
            ])->save();

            foreach ($groupRows as $row) {
                if (blank($row['variant_attributes'] ?? null)) {
                    continue;
                }

                $attributes = json_decode($row['variant_attributes'], true);
                if (! is_array($attributes) || empty($attributes)) {
                    continue;
                }

                $variant = filled($row['variant_sku'] ?? null)
                    ? ProductVariant::firstOrNew(['sku' => $row['variant_sku']])
                    : new ProductVariant;

                $variant->forceFill([
                    'product_id' => $product->id,
                    'sku' => filled($row['variant_sku'] ?? null) ? $row['variant_sku'] : null,
                    'attributes' => $attributes,
                    'price_modifier' => (float) ($row['variant_price_modifier'] ?? 0),
                    'stock_qty' => (int) ($row['variant_stock_qty'] ?? 0),
                    'is_active' => (bool) ($row['variant_is_active'] ?? true),
                ])->save();
            }

            $imported++;
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$imported} products imported."]);

        return to_route('admin.products.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateProduct(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'stock_qty' => ['required', 'integer', 'min:0'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'status' => ['required', 'in:draft,published,scheduled'],
            'publish_at' => ['nullable', 'date'],
            'label' => ['nullable', 'in:new_arrival,best_seller,trending'],
            'video_url' => ['nullable', 'url', 'max:500'],
            'size_chart' => ['nullable', 'json'],
            'faqs' => ['nullable', 'json'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:2048'],
            'tags' => ['nullable', 'string'],
            'variants' => ['nullable', 'string'],
        ]);
    }

    /**
     * @return array<string>
     */
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

    /**
     * @return array<string>|null
     */
    private function parseTags(?string $tags): ?array
    {
        if (! $tags) {
            return null;
        }

        return array_values(array_filter(array_map('trim', explode(',', $tags))));
    }

    /**
     * @return array<int, mixed>|null
     */
    private function parseJsonArray(?string $value): ?array
    {
        if (blank($value)) {
            return null;
        }

        $decoded = json_decode($value, true);

        return is_array($decoded) ? $decoded : null;
    }

    /**
     * @return array<int, array<string, mixed>>|null
     */
    private function parseVariants(?string $variants): ?array
    {
        if ($variants === null) {
            return null;
        }

        if (blank($variants)) {
            return [];
        }

        $decoded = json_decode($variants, true);

        return is_array($decoded) ? array_values(array_filter($decoded, 'is_array')) : [];
    }

    /**
     * @param  array<int, array<string, mixed>>|null  $variants
     */
    private function syncVariants(Product $product, ?array $variants): void
    {
        if ($variants === null) {
            return;
        }

        $keptIds = [];

        foreach ($variants as $variantData) {
            $variant = isset($variantData['id'])
                ? $product->variants()->whereKey($variantData['id'])->first() ?? new ProductVariant
                : new ProductVariant;

            $variant->forceFill([
                'product_id' => $product->id,
                'sku' => blank($variantData['sku'] ?? null) ? null : $variantData['sku'],
                'attributes' => is_array($variantData['attributes'] ?? null) ? $variantData['attributes'] : [],
                'price_modifier' => (float) ($variantData['price_modifier'] ?? 0),
                'stock_qty' => (int) ($variantData['stock_qty'] ?? 0),
                'images' => is_array($variantData['images'] ?? null) ? $variantData['images'] : null,
                'is_active' => (bool) ($variantData['is_active'] ?? true),
            ])->save();

            $keptIds[] = $variant->id;
        }

        $product->variants()
            ->when($keptIds !== [], fn ($query) => $query->whereNotIn('id', $keptIds))
            ->delete();
    }

    private function bustProductCaches(): void
    {
        Cache::forget('home_featured_products');
        Cache::forget('home_hero_products');
        Cache::forget('admin_dashboard_stats');
        Cache::forget('admin_dashboard_top_products');
    }
}
