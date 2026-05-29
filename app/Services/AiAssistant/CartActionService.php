<?php

namespace App\Services\AiAssistant;

use App\Services\CartService;
use Illuminate\Http\Request;

class CartActionService
{
    public function __construct(private readonly CartService $cartService) {}

    /** @return array<string, mixed> */
    public function getCart(Request $request): array
    {
        return $this->cartService->getSummary($request);
    }

    /** @return array{success: bool, message: string, product_name?: string} */
    public function addToCart(Request $request, int $productId, int $quantity = 1): array
    {
        return $this->cartService->addProductById($request, $productId, $quantity);
    }
}
