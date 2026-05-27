<?php

namespace App\Services\AiAssistant;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ProductSearchService
{
    /**
     * @param  array<string, mixed>  $params
     * @return array{products: Collection<int, Product>, total: int, search_params: array<string, mixed>}
     */
    public function search(array $params): array
    {
        $query = Product::with(['category', 'reviews'])->active();

        if (! empty($params['keyword'])) {
            $keyword = $params['keyword'];
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%");
            });
        }

        if (! empty($params['category_id'])) {
            $query->whereIn('category_id', (array) $params['category_id']);
        }

        if (! empty($params['min_price'])) {
            $query->where('price', '>=', $params['min_price']);
        }

        if (! empty($params['max_price'])) {
            $query->where(function ($q) use ($params) {
                $q->whereRaw('COALESCE(sale_price, price) <= ?', [$params['max_price']]);
            });
        }

        if (! empty($params['in_stock'])) {
            $query->where('stock_qty', '>', 0);
        }

        if (! empty($params['discounted'])) {
            $query->whereNotNull('sale_price');
        }

        if (! empty($params['featured'])) {
            $query->where('is_featured', true);
        }

        match ($params['sort'] ?? 'latest') {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            default => $query->latest(),
        };

        $total = $query->count();
        $products = $query->take(6)->get();

        return [
            'products' => $products,
            'total' => $total,
            'search_params' => $params,
        ];
    }

    /**
     * Parse a natural language message into structured search parameters.
     *
     * @param  array<string, mixed>  $previousParams
     * @return array<string, mixed>
     */
    public function parseQuery(string $message, array $previousParams = []): array
    {
        $params = $previousParams;
        $lower = Str::lower($message);

        // Price range — "under 2000", "below 500", "max 1000"
        if (preg_match('/(?:under|below|max|maximum|less than|at most)\s+(?:tk\.?|bdt\.?|৳)?\s*(\d+)/i', $message, $m)) {
            $params['max_price'] = (float) $m[1];
        }

        // "above 500", "over 1000", "min 500"
        if (preg_match('/(?:above|over|min|minimum|more than|at least)\s+(?:tk\.?|bdt\.?|৳)?\s*(\d+)/i', $message, $m)) {
            $params['min_price'] = (float) $m[1];
        }

        // "between 500 and 2000" / "500 to 2000"
        if (preg_match('/between\s+(?:tk\.?|bdt\.?|৳)?\s*(\d+)\s+(?:and|to|-)\s+(?:tk\.?|bdt\.?|৳)?\s*(\d+)/i', $message, $m)) {
            $params['min_price'] = (float) $m[1];
            $params['max_price'] = (float) $m[2];
        } elseif (preg_match('/(?:tk\.?|bdt\.?|৳)\s*(\d+)\s*(?:to|-)\s*(?:tk\.?|bdt\.?|৳)?\s*(\d+)/i', $message, $m)) {
            $params['min_price'] = (float) $m[1];
            $params['max_price'] = (float) $m[2];
        }

        // Sort detection
        if (Str::contains($lower, ['cheapest', 'lowest price', 'budget friendly', 'price low to high'])) {
            $params['sort'] = 'price_asc';
        } elseif (Str::contains($lower, ['expensive', 'highest price', 'premium', 'price high to low'])) {
            $params['sort'] = 'price_desc';
        } elseif (Str::contains($lower, ['latest', 'newest', 'new arrival', 'recent'])) {
            $params['sort'] = 'latest';
        }

        // Discount / sale detection
        if (Str::contains($lower, ['discount', 'sale', 'offer', 'deal', 'on sale'])) {
            $params['discounted'] = true;
        }

        // Featured / best sellers
        if (Str::contains($lower, ['best seller', 'bestseller', 'featured', 'top product', 'popular'])) {
            $params['featured'] = true;
            $params['sort'] = $params['sort'] ?? 'latest';
        }

        // Stock filter
        if (Str::contains($lower, ['in stock', 'available', 'currently available'])) {
            $params['in_stock'] = true;
        }

        // Category detection against DB
        $categories = Category::all();
        foreach ($categories as $category) {
            if (Str::contains($lower, Str::lower($category->name))) {
                $childIds = $category->children()->pluck('id');
                $params['category_id'] = $childIds->push($category->id)->toArray();
                break;
            }
        }

        // Keyword extraction — strip intent/filter words and extract the core noun phrase
        $stopWords = [
            'show', 'me', 'find', 'search', 'get', 'give', 'need', 'want', 'looking for',
            'do you have', 'best', 'latest', 'newest', 'cheapest', 'discounted', 'sale',
            'offer', 'popular', 'featured', 'under', 'below', 'above', 'between', 'and',
            'to', 'in stock', 'available', 'please', 'some', 'any', 'the', 'a', 'an', 'all',
        ];

        $keyword = $message;
        foreach ($stopWords as $word) {
            $keyword = (string) preg_replace('/\b'.preg_quote($word, '/').'\b/i', '', $keyword);
        }

        // Strip price mentions
        $keyword = (string) preg_replace('/(?:tk\.?|bdt\.?|৳)?\s*\d+/i', '', $keyword);

        // Strip category names if detected
        if (! empty($params['category_id'])) {
            foreach ($categories as $category) {
                $keyword = (string) str_ireplace($category->name, '', $keyword);
            }
        }

        $keyword = trim((string) preg_replace('/\s+/', ' ', $keyword));

        if (strlen($keyword) >= 2) {
            $params['keyword'] = $keyword;
        } elseif (isset($params['keyword']) && empty($keyword)) {
            // Preserve previous keyword when only filters were changed
        }

        return $params;
    }

    /**
     * @param  Collection<int, Product>  $products
     * @return array<int, array<string, mixed>>
     */
    public function formatProducts(Collection $products): array
    {
        return $products->map(function (Product $product): array {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => (float) $product->price,
                'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                'image' => $product->images[0] ?? null,
                'category' => $product->category?->name,
                'rating' => $product->reviews->count() > 0 ? round((float) $product->reviews->avg('rating'), 1) : null,
                'review_count' => $product->reviews->count(),
                'in_stock' => $product->isInStock(),
                'stock_qty' => $product->stock_qty,
                'description' => $product->description ? Str::limit($product->description, 100) : null,
                'is_featured' => $product->is_featured,
            ];
        })->values()->all();
    }

    /** @param array<string, mixed> $params */
    public function buildShopUrl(array $params): string
    {
        $query = array_filter([
            'search' => $params['keyword'] ?? null,
            'min_price' => $params['min_price'] ?? null,
            'max_price' => $params['max_price'] ?? null,
            'sort' => $params['sort'] ?? null,
        ]);

        return '/shop'.($query ? '?'.http_build_query($query) : '');
    }
}
