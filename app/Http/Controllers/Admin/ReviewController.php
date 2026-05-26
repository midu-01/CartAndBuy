<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Review::with(['user', 'product'])->latest();

        if ($request->filled('approved')) {
            $query->where('is_approved', $request->approved === 'true');
        }

        return Inertia::render('admin/reviews', [
            'reviews' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['approved']),
        ]);
    }

    public function approve(Review $review)
    {
        $review->update(['is_approved' => ! $review->is_approved]);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Review visibility toggled']);

        return back();
    }

    public function destroy(Review $review)
    {
        $review->delete();

        return back();
    }
}
