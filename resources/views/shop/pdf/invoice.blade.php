<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1a1a1a; padding: 36px; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e94560; }
        .brand { font-size: 24px; font-weight: bold; color: #e94560; letter-spacing: -0.5px; }
        .brand-sub { font-size: 10px; color: #888; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px; }
        .invoice-meta { text-align: right; }
        .invoice-title { font-size: 18px; font-weight: bold; color: #1a1a1a; }
        .invoice-meta p { font-size: 11px; color: #666; margin-top: 4px; }
        .bill-to { margin-bottom: 28px; }
        .bill-to h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 8px; }
        .bill-to p { font-size: 12px; color: #333; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        thead th { background: #f8f8f8; text-align: left; padding: 10px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; border-bottom: 1px solid #e5e5e5; }
        thead th:last-child, thead th:nth-last-child(2) { text-align: right; }
        tbody td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #f0f0f0; color: #333; vertical-align: top; }
        tbody td:last-child { text-align: right; font-weight: 600; }
        tbody td:nth-last-child(2) { text-align: right; }
        tbody td:nth-child(2) { text-align: center; }
        tfoot td { padding: 8px 12px; font-size: 12px; }
        tfoot td:first-child { text-align: right; color: #666; }
        tfoot td:last-child { text-align: right; font-weight: 600; }
        .total-row td { font-size: 14px; font-weight: bold; border-top: 2px solid #e94560; padding-top: 12px; }
        .total-row td:first-child { color: #1a1a1a; }
        .total-row td:last-child { color: #e94560; }
        .meta-row { margin-top: 20px; padding: 12px 16px; background: #f8f8f8; border-radius: 6px; font-size: 11px; color: #555; line-height: 1.8; }
        .meta-row strong { color: #333; }
        .notes-row { margin-top: 12px; padding: 12px 16px; background: #fff8e1; border-left: 3px solid #fbbf24; font-size: 11px; color: #555; }
        .notes-row strong { color: #333; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; font-size: 10px; color: #aaa; line-height: 1.8; }
        .gift-badge { display: inline-block; background: #fdf2f8; color: #9333ea; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; margin-bottom: 6px; }
    </style>
</head>
<body>

<div class="header">
    <div>
        <div class="brand">CartAndBuy</div>
        <div class="brand-sub">Tax Invoice</div>
    </div>
    <div class="invoice-meta">
        <div class="invoice-title">Invoice #{{ $order->id }}</div>
        <p>Date: {{ $order->created_at->format('d M Y') }}</p>
        <p>Order Status: {{ ucfirst($order->status) }}</p>
        @if($order->tracking_number)
            <p>Tracking: {{ $order->tracking_number }}</p>
        @endif
    </div>
</div>

<div class="bill-to">
    <h4>Bill To</h4>
    @php $addr = $order->shipping_address; @endphp
    <p>
        <strong>{{ trim(($addr['first_name'] ?? '') . ' ' . ($addr['last_name'] ?? '')) }}</strong><br>
        @if(!empty($addr['phone'])){{ $addr['phone'] }}<br>@endif
        {{ $addr['address'] ?? '' }}<br>
        @if(!empty($addr['upazilla'])){{ $addr['upazilla'] }}, @endif
        {{ $addr['city'] ?? '' }}, {{ $addr['state'] ?? '' }}
        @if(!empty($addr['zip'])) — {{ $addr['zip'] }}@endif<br>
        {{ $addr['country'] ?? 'Bangladesh' }}
    </p>
</div>

@if($order->is_gift)
<div style="margin-bottom: 16px;">
    <div class="gift-badge">🎁 Gift Order</div>
    @if($order->gift_message)
        <div style="font-size: 11px; color: #666; margin-top: 4px; font-style: italic;">"{{ $order->gift_message }}"</div>
    @endif
</div>
@endif

<table>
    <thead>
        <tr>
            <th style="width: 30px">#</th>
            <th>Product</th>
            <th style="width: 60px; text-align:center">Qty</th>
            <th style="width: 100px; text-align:right">Unit Price</th>
            <th style="width: 100px; text-align:right">Total</th>
        </tr>
    </thead>
    <tbody>
        @foreach($order->items as $index => $item)
        <tr>
            <td>{{ $index + 1 }}</td>
            <td>
                {{ $item->product_name }}
                @if($item->variant_attributes)
                    <div style="font-size: 10px; color: #888; margin-top: 2px;">
                        @foreach($item->variant_attributes as $key => $value)
                            {{ ucfirst($key) }}: {{ $value }}@if(!$loop->last), @endif
                        @endforeach
                    </div>
                @endif
            </td>
            <td style="text-align:center">{{ $item->quantity }}</td>
            <td style="text-align:right">৳{{ number_format($item->unit_price, 2) }}</td>
            <td style="text-align:right">৳{{ number_format($item->total_price, 2) }}</td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td colspan="4" style="text-align:right; color:#666; padding-top: 12px; border-top: 1px solid #eee;">Subtotal</td>
            <td style="text-align:right; padding-top: 12px; border-top: 1px solid #eee;">৳{{ number_format($order->subtotal, 2) }}</td>
        </tr>
        <tr>
            <td colspan="4" style="text-align:right; color:#666;">Shipping</td>
            <td style="text-align:right;">{{ $order->shipping_cost > 0 ? '৳' . number_format($order->shipping_cost, 2) : 'Free' }}</td>
        </tr>
        @if($order->discount_amount > 0)
        <tr>
            <td colspan="4" style="text-align:right; color:#16a34a;">
                Discount @if($order->coupon_code)({{ $order->coupon_code }})@endif
            </td>
            <td style="text-align:right; color:#16a34a;">-৳{{ number_format($order->discount_amount, 2) }}</td>
        </tr>
        @endif
        <tr class="total-row">
            <td colspan="4" style="text-align:right;">Grand Total</td>
            <td>৳{{ number_format($order->total, 2) }}</td>
        </tr>
    </tfoot>
</table>

<div class="meta-row">
    <strong>Payment Method:</strong> {{ strtoupper($order->payment_method) }} &nbsp;·&nbsp;
    <strong>Payment Status:</strong> {{ ucfirst($order->payment_status) }}
    @if($order->transaction_id)
        &nbsp;·&nbsp; <strong>Transaction ID:</strong> {{ $order->transaction_id }}
    @endif
    @if($order->requested_delivery_date)
        <br><strong>Requested Delivery:</strong> {{ \Carbon\Carbon::parse($order->requested_delivery_date)->format('d M Y') }}
        @if($order->requested_delivery_time)
            ({{ $order->requested_delivery_time }})
        @endif
    @endif
</div>

@if($order->notes)
<div class="notes-row">
    <strong>Order Notes:</strong> {{ $order->notes }}
</div>
@endif

<div class="footer">
    Thank you for shopping with <strong>CartAndBuy</strong>!<br>
    For support, contact us at <strong>support@cartandbuy.com</strong><br>
    This is a computer-generated invoice and does not require a signature.
</div>

</body>
</html>
