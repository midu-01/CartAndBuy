<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with(['category', 'brand'])->published();

        if ($request->filled('search')) {
            $query->search($request->search);
        }
        if ($request->filled('category')) {
            $category = Category::where('slug', $request->category)
                ->orWhere('id', $request->category)
                ->with('children')
                ->first();
            if ($category) {
                $ids = $category->children->pluck('id')->prepend($category->id);
                $query->whereIn('category_id', $ids);
            }
        }
        if ($request->filled('brand')) {
            $query->forBrandSlug($request->brand);
        }
        if ($request->filled('label')) {
            $query->withLabel($request->label);
        }
        if ($request->filled('min_price') || $request->filled('max_price')) {
            $query->priceRange(
                $request->filled('min_price') ? (float) $request->min_price : null,
                $request->filled('max_price') ? (float) $request->max_price : null,
            );
        }

        $query->when($request->sort === 'price_asc', fn ($q) => $q->orderBy('price', 'asc'))
            ->when($request->sort === 'price_desc', fn ($q) => $q->orderBy('price', 'desc'))
            ->when(! $request->filled('sort'), fn ($q) => $q->latest());

        return Inertia::render('shop/products', [
            'products' => $query->paginate(12)->withQueryString(),
            'filters' => $request->only(['search', 'category', 'brand', 'label', 'min_price', 'max_price', 'sort']),
            'categories' => Category::whereNull('parent_id')->with('children')->get(),
            'brands' => Brand::orderBy('name')->get(),
        ]);
    }

    public function show(Request $request, Product $product): Response
    {
        abort_if(! $product->is_active, 404);
        abort_if($product->status !== 'published', 404);
        abort_if($product->publish_at && $product->publish_at->isFuture(), 404);

        $product->load([
            'category',
            'brand',
            'variants' => fn ($q) => $q->where('is_active', true),
            'reviews' => fn ($q) => $q->where('is_approved', true)->with('user'),
        ]);

        $relatedProducts = Product::published()
            ->where('id', '!=', $product->id)
            ->where('category_id', $product->category_id)
            ->withAvg(['reviews as average_rating' => fn ($q) => $q->where('is_approved', true)], 'rating')
            ->withCount(['reviews as review_count' => fn ($q) => $q->where('is_approved', true)])
            ->take(4)
            ->get();

        $user = $request->user();
        $recentlyViewedIds = collect($request->session()->get('recently_viewed_products', []))
            ->reject(fn (int $id) => $id === $product->id)
            ->take(8)
            ->values();

        $recentlyViewed = Product::with(['category', 'brand'])
            ->published()
            ->whereIn('id', $recentlyViewedIds)
            ->get()
            ->sortBy(fn (Product $recentProduct) => $recentlyViewedIds->search($recentProduct->id))
            ->values();

        $request->session()->put(
            'recently_viewed_products',
            collect([$product->id])
                ->merge($recentlyViewedIds)
                ->unique()
                ->take(8)
                ->values()
                ->all()
        );

        // Compute from already-loaded collection — avoids extra DB round-trips.
        $approvedReviews = $product->reviews->where('is_approved', true);
        $averageRating = $approvedReviews->isNotEmpty()
            ? round((float) $approvedReviews->avg('rating'), 2)
            : 0;

        // userReviewed should be true even for unapproved reviews, so we can't rely
        // on the approved-only collection loaded above — use a targeted exists() query.
        $userReviewed = $user
            ? $product->reviews()->where('user_id', $user->id)->exists()
            : false;

        return Inertia::render('shop/product-detail', [
            'product' => $product,
            'averageRating' => $averageRating,
            'relatedProducts' => $relatedProducts,
            'recentlyViewed' => $recentlyViewed,
            'userWishlisted' => $user
                ? $user->wishlists()->where('product_id', $product->id)->exists()
                : false,
            'userReviewed' => $userReviewed,
        ]);
    }
}
