<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            $productIds = collect($validated['items'])->pluck('product_id');
            // Lock the selected product rows to prevent race conditions during checkout
            $products = Product::whereIn('id', $productIds)->lockForUpdate()->get()->keyBy('id');

            $totalAmount = 0;
            $orderItems = [];

            foreach ($validated['items'] as $item) {
                $product = $products[$item['product_id']];

                if ($product->stock_quantity < $item['quantity']) {
                    throw new Exception("Insufficient stock for product: {$product->name}");
                }

                // Deduct inventory
                $product->decrement('stock_quantity', $item['quantity']);

                $price = $product->sale_price ?? $product->price;
                $totalAmount += $price * $item['quantity'];

                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $price, // Snapshot of price at checkout
                ];
            }

            $order = $request->user()->orders()->create([
                'total_amount' => $totalAmount,
                'shipping_address' => $validated['shipping_address'],
                'order_status' => 'pending',
            ]);

            $order->items()->createMany($orderItems);

            DB::commit();
            return response()->json(['message' => 'Order placed successfully', 'order' => $order], 201);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}