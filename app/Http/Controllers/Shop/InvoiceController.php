<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function download(Request $request, Order $order)
    {
        if ($order->user_id) {
            abort_if($order->user_id !== $request->user()?->id, 403);
        } else {
            abort_if($request->query('token') !== $order->order_token, 403);
        }

        $order->load(['items.product', 'items.variant']);

        // A basic HTML layout for the invoice, as creating a separate view file might be overkill for this plan step.
        // In reality, this should be a view like view('pdf.invoice', compact('order'))
        $html = view('shop.pdf.invoice', ['order' => $order])->render();

        $pdf = Pdf::loadHTML($html);

        return $pdf->download("invoice-{$order->id}.pdf");
    }
}
