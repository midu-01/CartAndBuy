<?php

namespace App\Services\AiAssistant;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AiAssistantService
{
    public function __construct(
        private readonly AiProviderInterface $ai,
        private readonly ProductSearchService $productSearch,
        private readonly CartActionService $cartAction,
    ) {}

    /**
     * Handle a user message and return a structured response.
     *
     * @return array{message: string, type: string, products?: array<int, array<string, mixed>>, cart?: array<string, mixed>, actions?: array<int, array<string, string>>}
     */
    public function handle(Request $request, string $userMessage): array
    {
        $context = $this->getContext($request);
        $lower = Str::lower(trim($userMessage));

        $intent = $this->detectIntent($lower, $userMessage, $context);

        $response = match ($intent) {
            'view_cart' => $this->handleViewCart($request),
            'checkout' => $this->handleCheckout($request),
            'add_to_cart' => $this->handleAddToCart($request, $lower, $context),
            'delivery_info' => $this->handleDeliveryInfo(),
            'view_orders' => $this->handleViewOrders($request),
            'refine_search' => $this->handleRefineSearch($userMessage, $context),
            'search_products' => $this->handleSearchProducts($userMessage),
            'wishlist_view' => $this->handleWishlistView($request),
            'wishlist_add' => $this->handleWishlistAdd($request, $context),
            'show_reviews' => $this->handleShowReviews($userMessage, $context),
            'coupon_info' => $this->handleCouponInfo(),
            'compare_products' => $this->handleCompareProducts($context),
            'size_guide' => $this->handleSizeGuide(),
            'budget_filter' => $this->handleBudgetFilter($userMessage, $context),
            'bengali_response' => $this->handleBengaliResponse(),
            default => $this->handleGeneral($request, $userMessage, $context),
        };

        $context['history'][] = ['role' => 'user', 'content' => $userMessage];
        $context['history'][] = ['role' => 'assistant', 'content' => $response['message']];

        $maxHistory = (int) config('ai.max_history', 10);
        if (count($context['history']) > $maxHistory * 2) {
            $context['history'] = array_slice($context['history'], -$maxHistory * 2);
        }

        if (isset($response['products'])) {
            $context['last_products'] = $response['products'];
        }

        if (isset($response['search_params'])) {
            $context['last_search_params'] = $response['search_params'];
        }

        $this->saveContext($request, $context);

        return $response;
    }

    /** @param array<string, mixed> $context */
    private function detectIntent(string $lower, string $originalMessage, array $context): string
    {
        if ($this->isBengali($originalMessage)) {
            return 'bengali_response';
        }

        if (Str::contains($lower, ['my cart', 'view cart', 'show cart', "what's in cart", 'cart summary', 'see my cart'])) {
            return 'view_cart';
        }

        if (Str::contains($lower, ['checkout', 'place order', 'proceed to checkout', 'go to checkout'])) {
            return 'checkout';
        }

        if (Str::contains($lower, ['add to cart', 'add it to cart', 'add this to cart', 'put it in cart'])) {
            return 'add_to_cart';
        }

        if (preg_match('/add (the )?(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|[1-5])/i', $lower)) {
            return 'add_to_cart';
        }

        if (Str::contains($lower, ['my wishlist', 'saved items', 'saved products', 'favourites', 'favorites', 'wish list'])) {
            return 'wishlist_view';
        }

        if (Str::contains($lower, ['add to wishlist', 'save for later', 'save this', 'add to favorites', 'add to favourites', 'add to favourite'])) {
            return 'wishlist_add';
        }

        if (Str::contains($lower, ['review', 'reviews', 'rating', 'ratings', 'what do people think', 'is it good', 'quality', 'feedback', 'people say', 'customer opinion'])) {
            return 'show_reviews';
        }

        if (Str::contains($lower, ['coupon', 'promo', 'discount code', 'voucher', 'promo code', 'offer code', 'any deals', 'any offers', 'discount available'])) {
            return 'coupon_info';
        }

        if (Str::contains($lower, ['compare', ' vs ', ' versus ', 'difference between', 'which is better', 'which one is', 'better option'])) {
            return 'compare_products';
        }

        if (Str::contains($lower, ['size guide', 'what size', 'which size', 'sizing', 'size chart', 'measurement', 'size for me', 'fit guide'])) {
            return 'size_guide';
        }

        if (preg_match('/(?:only have|i have|my budget|have only)\s+(?:tk\.?|bdt\.?|৳)?\s*(\d+)/i', $lower)
            || Str::contains($lower, ['too expensive', "can't afford", 'more affordable', 'cheaper option', 'something cheaper'])) {
            return 'budget_filter';
        }

        if (Str::contains($lower, ['delivery', 'shipping', 'how long', 'how many days', 'shipping cost', 'free shipping'])) {
            return 'delivery_info';
        }

        if (Str::contains($lower, ['track', 'order status', 'where is my order', 'my order', 'order history', 'recent orders'])) {
            return 'view_orders';
        }

        $hasSearchContext = ! empty($context['last_products']) && ! empty($context['last_search_params']);
        $isRefining = Str::contains($lower, ['only', 'but', 'filter', 'within', 'show cheaper', 'show more expensive', 'now under', 'now above']);
        $hasNewSearch = Str::contains($lower, ['show me', 'find me', 'search for', 'looking for a', 'do you have']);

        if ($hasSearchContext && $isRefining && ! $hasNewSearch) {
            return 'refine_search';
        }

        if (Str::contains($lower, ['show', 'find', 'search', 'looking for', 'do you have', 'give me', 'need', 'want', 'get me'])) {
            return 'search_products';
        }

        if ($this->hasProductKeywords($lower)) {
            return 'search_products';
        }

        return 'general';
    }

    private function isBengali(string $message): bool
    {
        return (bool) preg_match('/[\x{0980}-\x{09FF}]/u', $message);
    }

    private function hasProductKeywords(string $lower): bool
    {
        $keywords = [
            'shirt', 'dress', 'shoe', 'shoes', 'phone', 'laptop', 'bag', 'watch',
            'saree', 'pants', 'trouser', 'jacket', 'sandal', 'slipper', 'kurta',
            'cap', 'hat', 'sunglass', 'belt', 'wallet', 'headphone', 'earphone',
            'charger', 'case', 'cover', 'cream', 'lotion', 'perfume',
        ];

        return Str::contains($lower, $keywords);
    }

    /** @return array<string, mixed> */
    private function handleSearchProducts(string $message): array
    {
        $params = $this->productSearch->parseQuery($message);
        $result = $this->productSearch->search($params);
        $products = $this->productSearch->formatProducts($result['products']);

        if (empty($products)) {
            return [
                'message' => "I couldn't find any products matching your search. Try different keywords or browse our full catalog.",
                'type' => 'text',
                'actions' => [
                    ['label' => 'Browse All Products', 'action' => 'link', 'url' => '/shop'],
                ],
            ];
        }

        $count = count($products);
        $intro = $count === 1 ? "Here's what I found:" : "Here are {$count} products I found for you:";

        return [
            'message' => $intro,
            'type' => 'products',
            'products' => $products,
            'search_params' => $params,
            'actions' => [
                ['label' => 'View All Results', 'action' => 'link', 'url' => $this->productSearch->buildShopUrl($params)],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    private function handleRefineSearch(string $message, array $context): array
    {
        $previousParams = $context['last_search_params'] ?? [];
        $params = $this->productSearch->parseQuery($message, $previousParams);
        $result = $this->productSearch->search($params);
        $products = $this->productSearch->formatProducts($result['products']);

        if (empty($products)) {
            return [
                'message' => 'No products match those filters. Try broadening your search.',
                'type' => 'text',
            ];
        }

        return [
            'message' => 'Here are the refined results:',
            'type' => 'products',
            'products' => $products,
            'search_params' => $params,
            'actions' => [
                ['label' => 'View All Results', 'action' => 'link', 'url' => $this->productSearch->buildShopUrl($params)],
            ],
        ];
    }

    /** @return array<string, mixed> */
    private function handleViewCart(Request $request): array
    {
        $cart = $this->cartAction->getCart($request);

        if ($cart['is_empty']) {
            return [
                'message' => 'Your cart is empty. Let me help you find something great!',
                'type' => 'text',
                'actions' => [
                    ['label' => 'Browse Products', 'action' => 'link', 'url' => '/shop'],
                    ['label' => 'Best Sellers', 'action' => 'quick', 'message' => 'Show me best sellers'],
                ],
            ];
        }

        $freeShippingNote = $cart['has_free_shipping']
            ? "\n\n🆓 You qualify for **free shipping**!"
            : "\n\n🚚 Add ৳".number_format((float) $cart['amount_to_free_shipping'], 0).' more for **free shipping**!';

        return [
            'message' => "Here's what's in your cart:".$freeShippingNote,
            'type' => 'cart',
            'cart' => $cart,
            'actions' => [
                ['label' => 'Go to Checkout', 'action' => 'link', 'url' => '/checkout'],
                ['label' => 'View Cart', 'action' => 'link', 'url' => '/cart'],
            ],
        ];
    }

    /** @return array<string, mixed> */
    private function handleCheckout(Request $request): array
    {
        $cart = $this->cartAction->getCart($request);

        if ($cart['is_empty']) {
            return [
                'message' => 'Your cart is empty! Add some products before checking out.',
                'type' => 'text',
                'actions' => [
                    ['label' => 'Browse Products', 'action' => 'link', 'url' => '/shop'],
                ],
            ];
        }

        if (! $request->user()) {
            return [
                'message' => 'You need to be logged in to checkout. Please sign in to continue.',
                'type' => 'text',
                'actions' => [
                    ['label' => 'Login', 'action' => 'link', 'url' => '/login'],
                    ['label' => 'Register', 'action' => 'link', 'url' => '/register'],
                ],
            ];
        }

        return [
            'message' => "Ready to checkout! You have {$cart['item_count']} item(s) totaling {$cart['formatted_total']}.",
            'type' => 'cart',
            'cart' => $cart,
            'actions' => [
                ['label' => 'Proceed to Checkout', 'action' => 'link', 'url' => '/checkout'],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    private function handleAddToCart(Request $request, string $lower, array $context): array
    {
        /** @var array<int, array<string, mixed>> $lastProducts */
        $lastProducts = $context['last_products'] ?? [];

        if (empty($lastProducts)) {
            return [
                'message' => 'Please search for a product first, then I can add it to your cart!',
                'type' => 'text',
            ];
        }

        $index = $this->detectOrdinalIndex($lower) ?? 0;

        if (! isset($lastProducts[$index])) {
            return [
                'message' => "I couldn't determine which product to add. Please specify (e.g. \"add the first one\").",
                'type' => 'text',
            ];
        }

        $productId = (int) $lastProducts[$index]['id'];
        $result = $this->cartAction->addToCart($request, $productId, 1);

        if (! $result['success']) {
            return ['message' => $result['message'], 'type' => 'text'];
        }

        $freeShippingAlert = $this->buildFreeShippingAlert($request);
        $baseMessage = $result['message'].$freeShippingAlert;

        $actions = [
            ['label' => 'View Cart', 'action' => 'link', 'url' => '/cart'],
            ['label' => 'Checkout', 'action' => 'link', 'url' => '/checkout'],
        ];

        // Upsell: suggest complementary products from same category
        $addedProduct = $lastProducts[$index];
        if (! empty($addedProduct['category'])) {
            $upsellResult = $this->productSearch->search([
                'keyword' => (string) $addedProduct['category'],
                'sort' => 'latest',
            ]);
            $upsellProducts = $this->productSearch->formatProducts(
                $upsellResult['products']->filter(fn (Product $p) => $p->id !== $productId)->values()->take(3)
            );

            if (! empty($upsellProducts)) {
                return [
                    'message' => $baseMessage."\n\n**You might also like:**",
                    'type' => 'products',
                    'products' => array_values($upsellProducts),
                    'actions' => $actions,
                ];
            }
        }

        return [
            'message' => $baseMessage,
            'type' => 'text',
            'actions' => $actions,
        ];
    }

    private function buildFreeShippingAlert(Request $request): string
    {
        $cart = $this->cartAction->getCart($request);

        if ($cart['has_free_shipping']) {
            return "\n\n🆓 You now qualify for **free shipping**!";
        }

        $remaining = number_format((float) $cart['amount_to_free_shipping'], 0);

        return "\n\n🚚 Add ৳{$remaining} more for **free shipping**!";
    }

    private function detectOrdinalIndex(string $lower): ?int
    {
        $map = [
            'first' => 0, '1st' => 0, '1' => 0,
            'second' => 1, '2nd' => 1, '2' => 1,
            'third' => 2, '3rd' => 2, '3' => 2,
            'fourth' => 3, '4th' => 3, '4' => 3,
            'fifth' => 4, '5th' => 4, '5' => 4,
        ];

        foreach ($map as $word => $index) {
            if (preg_match('/\b'.preg_quote($word, '/').'\b/', $lower)) {
                return $index;
            }
        }

        return null;
    }

    /** @return array<string, mixed> */
    private function handleDeliveryInfo(): array
    {
        return [
            'message' => "**Delivery Information**\n\n"
                ."📦 Standard Delivery: 3–7 business days\n"
                ."🚀 Express Delivery: 1–2 business days\n"
                ."🆓 Free shipping on orders above ৳2,000\n\n"
                .'We deliver all across Bangladesh. You\'ll receive tracking info via email after dispatch.',
            'type' => 'text',
            'actions' => [
                ['label' => 'Shop Now', 'action' => 'link', 'url' => '/shop'],
            ],
        ];
    }

    /** @return array<string, mixed> */
    private function handleViewOrders(Request $request): array
    {
        if (! $request->user()) {
            return [
                'message' => 'Please log in to view your orders.',
                'type' => 'text',
                'actions' => [
                    ['label' => 'Login', 'action' => 'link', 'url' => '/login'],
                ],
            ];
        }

        $orders = Order::where('user_id', $request->user()->id)
            ->latest()
            ->take(3)
            ->get();

        if ($orders->isEmpty()) {
            return [
                'message' => "You haven't placed any orders yet. Start shopping!",
                'type' => 'text',
                'actions' => [
                    ['label' => 'Browse Products', 'action' => 'link', 'url' => '/shop'],
                ],
            ];
        }

        $orderText = "**Your Recent Orders:**\n\n";
        foreach ($orders as $order) {
            $statusEmoji = match ($order->status) {
                'pending' => '⏳',
                'processing' => '🔄',
                'shipped' => '🚚',
                'delivered' => '✅',
                'cancelled' => '❌',
                default => '📦',
            };
            $orderText .= "{$statusEmoji} **Order #{$order->id}** — ".Str::ucfirst($order->status)."\n";
            $orderText .= '   ৳'.number_format((float) $order->total, 2).' · '.$order->created_at->diffForHumans()."\n\n";
        }

        return [
            'message' => $orderText,
            'type' => 'text',
            'actions' => [
                ['label' => 'View All Orders', 'action' => 'link', 'url' => '/orders'],
            ],
        ];
    }

    /** @return array<string, mixed> */
    private function handleWishlistView(Request $request): array
    {
        if (! $request->user()) {
            return [
                'message' => 'Please log in to view your wishlist.',
                'type' => 'text',
                'actions' => [
                    ['label' => 'Login', 'action' => 'link', 'url' => '/login'],
                ],
            ];
        }

        $items = Wishlist::where('user_id', $request->user()->id)
            ->with('product.category', 'product.reviews')
            ->latest()
            ->take(6)
            ->get();

        if ($items->isEmpty()) {
            return [
                'message' => 'Your wishlist is empty. Browse products and save the ones you love! 💝',
                'type' => 'text',
                'actions' => [
                    ['label' => 'Browse Products', 'action' => 'link', 'url' => '/shop'],
                ],
            ];
        }

        $products = $this->productSearch->formatProducts($items->pluck('product'));

        return [
            'message' => 'Here are your saved items:',
            'type' => 'products',
            'products' => $products,
            'actions' => [
                ['label' => 'View Full Wishlist', 'action' => 'link', 'url' => '/wishlist'],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    private function handleWishlistAdd(Request $request, array $context): array
    {
        if (! $request->user()) {
            return [
                'message' => 'Please log in to save items to your wishlist.',
                'type' => 'text',
                'actions' => [
                    ['label' => 'Login', 'action' => 'link', 'url' => '/login'],
                ],
            ];
        }

        /** @var array<int, array<string, mixed>> $lastProducts */
        $lastProducts = $context['last_products'] ?? [];

        if (empty($lastProducts)) {
            return [
                'message' => 'Please search for a product first, then I can add it to your wishlist!',
                'type' => 'text',
            ];
        }

        $product = Product::find((int) $lastProducts[0]['id']);

        if (! $product) {
            return ['message' => 'Product not found.', 'type' => 'text'];
        }

        $existing = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            $existing->delete();

            return [
                'message' => "**{$product->name}** removed from your wishlist.",
                'type' => 'text',
                'actions' => [
                    ['label' => 'View Wishlist', 'action' => 'link', 'url' => '/wishlist'],
                ],
            ];
        }

        Wishlist::create([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
        ]);

        return [
            'message' => "**{$product->name}** added to your wishlist! 💝",
            'type' => 'text',
            'actions' => [
                ['label' => 'View Wishlist', 'action' => 'link', 'url' => '/wishlist'],
                ['label' => 'Add to Cart', 'action' => 'quick', 'message' => 'Add the first one to cart'],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    private function handleShowReviews(string $message, array $context): array
    {
        $product = null;

        /** @var array<int, array<string, mixed>> $lastProducts */
        $lastProducts = $context['last_products'] ?? [];

        if (! empty($lastProducts)) {
            $product = Product::find((int) $lastProducts[0]['id']);
        }

        if (! $product) {
            $params = $this->productSearch->parseQuery($message);
            if (! empty($params['keyword'])) {
                $result = $this->productSearch->search($params);
                $product = $result['products']->first();
            }
        }

        if (! $product) {
            return [
                'message' => 'Which product would you like to see reviews for? Try searching for a product first!',
                'type' => 'text',
            ];
        }

        // Load only approved reviews; compute stats from the loaded collection.
        $reviews = $product->reviews()->where('is_approved', true)->with('user')->latest()->take(3)->get();

        if ($reviews->isEmpty()) {
            return [
                'message' => "**{$product->name}** has no reviews yet. Be the first to review it!",
                'type' => 'text',
                'actions' => [
                    ['label' => 'View Product', 'action' => 'link', 'url' => "/products/{$product->slug}"],
                ],
            ];
        }

        $totalReviews = $product->reviews()->where('is_approved', true)->count();
        $avgRating = round((float) $reviews->avg('rating'), 1);

        $reviewText = "**{$product->name}** — ⭐ {$avgRating}/5 from {$totalReviews} review".($totalReviews > 1 ? 's' : '')."\n\n";

        foreach ($reviews as $review) {
            $stars = str_repeat('★', (int) $review->rating).str_repeat('☆', 5 - (int) $review->rating);
            $reviewText .= "{$stars} {$review->comment}\n\n";
        }

        if ($totalReviews > 3) {
            $reviewText .= '...and '.($totalReviews - 3).' more reviews.';
        }

        return [
            'message' => rtrim($reviewText),
            'type' => 'text',
            'actions' => [
                ['label' => 'View Product', 'action' => 'link', 'url' => "/products/{$product->slug}"],
            ],
        ];
    }

    /** @return array<string, mixed> */
    private function handleCouponInfo(): array
    {
        $coupons = Coupon::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->where(function ($q) {
                $q->whereNull('max_uses')->orWhereColumn('used_count', '<', 'max_uses');
            })
            ->take(5)
            ->get();

        if ($coupons->isEmpty()) {
            return [
                'message' => "No active coupons right now, but check back soon for deals! 🎁\n\nDon't forget — you get **free shipping** on orders above ৳2,000.",
                'type' => 'text',
                'actions' => [
                    ['label' => 'Browse Products', 'action' => 'link', 'url' => '/shop'],
                ],
            ];
        }

        $couponText = "🎁 **Available Coupons:**\n\n";
        foreach ($coupons as $coupon) {
            $discount = $coupon->type === 'percent' ? "{$coupon->value}% off" : "৳{$coupon->value} off";
            $minOrder = $coupon->min_order ? ' (min. order ৳'.number_format((float) $coupon->min_order, 0).')' : '';
            $couponText .= "• **{$coupon->code}** — {$discount}{$minOrder}\n";
        }

        $couponText .= "\n🚚 Free shipping on orders above ৳2,000!";

        return [
            'message' => $couponText,
            'type' => 'text',
            'actions' => [
                ['label' => 'Shop Now', 'action' => 'link', 'url' => '/shop'],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    private function handleCompareProducts(array $context): array
    {
        /** @var array<int, array<string, mixed>> $lastProducts */
        $lastProducts = $context['last_products'] ?? [];

        if (count($lastProducts) < 2) {
            return [
                'message' => 'Please search for products first, then I can compare them for you!',
                'type' => 'text',
            ];
        }

        $p1 = $lastProducts[0];
        $p2 = $lastProducts[1];

        $p1Price = (float) ($p1['sale_price'] ?? $p1['price']);
        $p2Price = (float) ($p2['sale_price'] ?? $p2['price']);

        $compareText = "**Product Comparison**\n\n";
        $compareText .= "**{$p1['name']}**\n";
        $compareText .= '• Price: ৳'.number_format($p1Price, 2)."\n";
        if ($p1['rating']) {
            $compareText .= "• Rating: {$p1['rating']}/5 ({$p1['review_count']} reviews)\n";
        }
        $compareText .= '• Stock: '.($p1['in_stock'] ? 'In Stock ✅' : 'Out of Stock ❌')."\n\n";

        $compareText .= "**{$p2['name']}**\n";
        $compareText .= '• Price: ৳'.number_format($p2Price, 2)."\n";
        if ($p2['rating']) {
            $compareText .= "• Rating: {$p2['rating']}/5 ({$p2['review_count']} reviews)\n";
        }
        $compareText .= '• Stock: '.($p2['in_stock'] ? 'In Stock ✅' : 'Out of Stock ❌');

        if ($p1Price < $p2Price && $p1['in_stock']) {
            $compareText .= "\n\n💡 **{$p1['name']}** offers better value at ৳".number_format($p1Price, 2).'.';
        } elseif ($p2Price < $p1Price && $p2['in_stock']) {
            $compareText .= "\n\n💡 **{$p2['name']}** offers better value at ৳".number_format($p2Price, 2).'.';
        }

        return [
            'message' => $compareText,
            'type' => 'text',
            'actions' => [
                ['label' => "View {$p1['name']}", 'action' => 'link', 'url' => "/products/{$p1['slug']}"],
                ['label' => "View {$p2['name']}", 'action' => 'link', 'url' => "/products/{$p2['slug']}"],
            ],
        ];
    }

    /** @return array<string, mixed> */
    private function handleSizeGuide(): array
    {
        return [
            'message' => "**Size Guide — CartAndBuy**\n\n"
                ."**Tops & Shirts (Bangladesh sizing):**\n"
                ."• S — Chest 36\", Waist 30\"\n"
                ."• M — Chest 38\", Waist 32\"\n"
                ."• L — Chest 40\", Waist 34\"\n"
                ."• XL — Chest 42\", Waist 36\"\n"
                ."• XXL — Chest 44\", Waist 38\"\n\n"
                ."**Sarees & Dresses:**\n"
                ."• One size fits most (5.2–5.8 ft height)\n"
                ."• Custom tailoring available on request\n\n"
                ."**Shoes:**\n"
                ."• UK sizing. If between sizes, go a size up.\n\n"
                .'💡 Tip: Check the product page for item-specific sizing!',
            'type' => 'text',
            'actions' => [
                ['label' => 'Browse Clothing', 'action' => 'quick', 'message' => 'Show me clothing'],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    private function handleBudgetFilter(string $message, array $context): array
    {
        $budget = null;
        if (preg_match('/(?:only have|i have|my budget is|budget|have only|within)\s+(?:tk\.?|bdt\.?|৳)?\s*(\d+)/i', $message, $m)) {
            $budget = (float) $m[1];
        }

        if (! $budget) {
            return [
                'message' => "What's your budget? Tell me the amount and I'll find the best options for you!\n\nExample: \"I have ৳1500\" or \"budget ৳2000\"",
                'type' => 'text',
            ];
        }

        $previousParams = $context['last_search_params'] ?? [];
        $params = array_merge($previousParams, ['max_price' => $budget, 'sort' => 'price_asc']);

        $result = $this->productSearch->search($params);
        $products = $this->productSearch->formatProducts($result['products']);

        if (empty($products)) {
            return [
                'message' => 'No products found within your ৳'.number_format($budget, 0).' budget. Try browsing our full catalog for more options.',
                'type' => 'text',
                'actions' => [
                    ['label' => 'Browse All', 'action' => 'link', 'url' => '/shop'],
                ],
            ];
        }

        return [
            'message' => 'Here are the best options within your ৳'.number_format($budget, 0).' budget:',
            'type' => 'products',
            'products' => $products,
            'search_params' => $params,
            'actions' => [
                ['label' => 'View All Results', 'action' => 'link', 'url' => $this->productSearch->buildShopUrl($params)],
            ],
        ];
    }

    /** @return array<string, mixed> */
    private function handleBengaliResponse(): array
    {
        return [
            'message' => "আমি বাংলায় সাহায্য করতে পারব! (I can help in Bengali!)\n\nPlease type in English or Banglish (e.g., \"ami ekta shirt dekhaite chai\") and I'll find what you need. 😊",
            'type' => 'text',
            'actions' => [
                ['label' => '🛍️ Products', 'action' => 'link', 'url' => '/shop'],
                ['label' => 'Delivery তথ্য', 'action' => 'quick', 'message' => 'Delivery information'],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    private function handleGeneral(Request $request, string $message, array $context): array
    {
        if (! $this->ai->isEnabled()) {
            return [
                'message' => 'I can help you find products, view your cart, check orders, or get delivery info. What are you looking for?',
                'type' => 'text',
                'actions' => [
                    ['label' => 'Browse Products', 'action' => 'link', 'url' => '/shop'],
                    ['label' => 'My Cart', 'action' => 'quick', 'message' => 'Show my cart'],
                    ['label' => 'Delivery Info', 'action' => 'quick', 'message' => 'Delivery information'],
                ],
            ];
        }

        try {
            $systemPrompt = $this->buildSystemPrompt($request);
            $messages = [['role' => 'system', 'content' => $systemPrompt]];

            foreach (array_slice($context['history'], -6) as $h) {
                $messages[] = $h;
            }

            $messages[] = ['role' => 'user', 'content' => $message];

            $reply = $this->ai->complete($messages);

            return ['message' => $reply ?: "I'm not sure how to help with that. Try asking about products or your cart!", 'type' => 'text'];
        } catch (\Exception) {
            return [
                'message' => "I'm having trouble connecting right now. You can browse our shop or contact support.",
                'type' => 'text',
                'actions' => [
                    ['label' => 'Browse Shop', 'action' => 'link', 'url' => '/shop'],
                    ['label' => 'Contact Us', 'action' => 'link', 'url' => '/contact'],
                ],
            ];
        }
    }

    private function buildSystemPrompt(Request $request): string
    {
        $userName = $request->user()?->name ?? 'there';

        return "You are CartAndBuy's friendly AI shopping assistant. "
            .'The shop is based in Bangladesh and uses BDT (৳) as currency. '
            .'Free shipping on orders above ৳2,000. '
            ."The customer's name is {$userName}. "
            .'Keep answers short (2–3 sentences max). '
            .'If asked about specific products or prices, invite the user to search using natural language.';
    }

    /** @return array<string, mixed> */
    private function getContext(Request $request): array
    {
        /** @var array<string, mixed> */
        return $request->session()->get('ai_context', [
            'history' => [],
            'last_products' => [],
            'last_search_params' => [],
        ]);
    }

    /** @param array<string, mixed> $context */
    private function saveContext(Request $request, array $context): void
    {
        $request->session()->put('ai_context', $context);
    }
}
