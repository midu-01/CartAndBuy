<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000'
        ]);

        $product->reviews()->updateOrCreate(
            ['user_id' => $request->user()->id],
            ['rating' => $validated['rating'], 'comment' => $validated['comment'], 'is_approved' => false]
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Review submitted and awaits approval.']);
        return back();
    }
}