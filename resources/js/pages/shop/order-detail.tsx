import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft, XCircle, RotateCcw, Download, Truck, CheckCircle2,
    Clock, Package, Ban, Gift, StickyNote, CalendarClock, ExternalLink,
    ChevronDown, ChevronUp,
} from 'lucide-react';
import ShopLayout from '@/layouts/shop-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: string;
    total_price: string;
    variant_attributes: Record<string, string> | null;
    product: { images: string[] | null } | null;
}
interface ShippingAddress {
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    email: string;
    phone: string;
}
interface StatusHistory {
    id: number;
    status: string;
    notes: string | null;
    created_at: string;
}
interface OrderRequest {
    id: number;
    type: string;
    status: string;
    reason: string;
    order_item_id: number | null;
    created_at: string;
}
interface Order {
    id: number;
    status: string;
    subtotal: string;
    shipping_cost: string;
    discount_amount: string;
    total: string;
    payment_method: string;
    payment_status: string;
    coupon_code: string | null;
    created_at: string;
    shipping_address: ShippingAddress;
    items: OrderItem[];
    notes: string | null;
    is_gift: boolean;
    gift_message: string | null;
    requested_delivery_date: string | null;
    requested_delivery_time: string | null;
    tracking_number: string | null;
    courier_name: string | null;
    tracking_url: string | null;
    order_token: string | null;
    user_id: number | null;
    statusHistories: StatusHistory[];
    requests: OrderRequest[];
}
interface Props { order: Order }

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, React.ElementType> = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle2,
    cancelled: Ban,
};

const requestTypeColors: Record<string, string> = {
    cancel: 'bg-red-100 text-red-700',
    return: 'bg-orange-100 text-orange-700',
    exchange: 'bg-blue-100 text-blue-700',
    refund: 'bg-purple-100 text-purple-700',
};

const requestStatusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    resolved: 'bg-gray-100 text-gray-600',
};

function RequestModal({ order }: { order: Order }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'return',
        reason: '',
        order_item_id: '',
    });

    const canRequest = !['cancelled'].includes(order.status);
    const requestableTypes = order.status === 'delivered' || order.status === 'shipped'
        ? [
            { value: 'return', label: 'Return Item(s)' },
            { value: 'exchange', label: 'Exchange Item(s)' },
            { value: 'refund', label: 'Request Refund' },
          ]
        : [
            { value: 'cancel', label: 'Cancel Item (Partial)' },
            { value: 'refund', label: 'Request Refund' },
          ];

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/orders/${order.id}/requests${order.order_token ? `?token=${order.order_token}` : ''}`, {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

    if (!canRequest) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                    Submit Request
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Submit a Request</DialogTitle>
                    <DialogDescription>
                        Our team will review your request and respond within 1–2 business days.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Request Type</label>
                        <div className="space-y-2">
                            {requestableTypes.map((t) => (
                                <label
                                    key={t.value}
                                    className={cn(
                                        'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors',
                                        data.type === t.value
                                            ? 'border-[#e94560] bg-[#e94560]/5 font-medium text-[#e94560]'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300',
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="type"
                                        value={t.value}
                                        checked={data.type === t.value}
                                        onChange={() => setData('type', t.value)}
                                        className="hidden"
                                    />
                                    {t.label}
                                </label>
                            ))}
                        </div>
                        {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Specific Item
                            <span className="ml-1 text-xs font-normal text-gray-400">(Optional)</span>
                        </label>
                        <select
                            value={data.order_item_id}
                            onChange={(e) => setData('order_item_id', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                        >
                            <option value="">All items / Entire order</option>
                            {order.items.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.product_name} (Qty: {item.quantity})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Reason</label>
                        <textarea
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            rows={3}
                            placeholder="Describe the reason for your request…"
                            className={cn(
                                'w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none',
                                errors.reason && 'border-red-400',
                            )}
                        />
                        {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason}</p>}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={processing}>Cancel</Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="border-0 bg-[#e94560] text-white hover:bg-[#c73652]"
                        >
                            {processing ? 'Submitting…' : 'Submit Request'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function OrderDetailPage({ order }: Props) {
    const addr = order.shipping_address;
    const [cancelling, setCancelling] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [reordering, setReordering] = useState(false);
    const [showTimeline, setShowTimeline] = useState(true);

    const invoiceUrl = `/orders/${order.id}/invoice${order.order_token ? `?token=${order.order_token}` : ''}`;
    const reorderUrl = `/orders/${order.id}/reorder${order.order_token ? `?token=${order.order_token}` : ''}`;

    function handleCancel() {
        setCancelling(true);
        router.patch(
            `/orders/${order.id}/cancel${order.order_token ? `?token=${order.order_token}` : ''}`,
            {},
            { onFinish: () => { setCancelling(false); setDialogOpen(false); } },
        );
    }

    function handleReorder() {
        setReordering(true);
        router.post(reorderUrl, {}, { onFinish: () => setReordering(false) });
    }

    const sortedHistories = [...(order.statusHistories ?? [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    return (
        <ShopLayout>
            <Head title={`Order #${order.id} — CartAndBuy`} />
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
                <Link href="/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
                    <ArrowLeft className="size-4" /> Back to Orders
                </Link>

                {/* Header */}
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                        <p className="mt-0.5 text-sm text-gray-500">
                            Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`border-0 capitalize text-sm ${statusColors[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                            {order.status}
                        </Badge>
                        <a href={invoiceUrl} target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm" className="gap-1.5">
                                <Download className="size-4" />
                                Invoice
                            </Button>
                        </a>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReorder}
                            disabled={reordering}
                            className="gap-1.5"
                        >
                            <RotateCcw className="size-4" />
                            {reordering ? 'Adding…' : 'Reorder'}
                        </Button>
                        <RequestModal order={order} />
                        {order.status === 'pending' && (
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="gap-1.5">
                                        <XCircle className="size-4" />
                                        Cancel Order
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Cancel Order #{order.id}?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. Your order will be cancelled and items will be restocked.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline" disabled={cancelling}>Keep Order</Button>
                                        </DialogClose>
                                        <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
                                            {cancelling ? 'Cancelling…' : 'Yes, Cancel Order'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Left column */}
                    <div className="space-y-4 md:col-span-2">
                        {/* Items */}
                        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                            <div className="border-b bg-gray-50 px-5 py-4">
                                <h2 className="font-semibold text-gray-900">Items Ordered</h2>
                            </div>
                            <div className="divide-y">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-4">
                                        <img
                                            src={item.product?.images?.[0] ?? 'https://placehold.co/64x64/e2e8f0/64748b?text=?'}
                                            alt=""
                                            className="h-16 w-16 rounded-lg bg-gray-50 object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.product_name}</p>
                                            {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 && (
                                                <p className="mt-0.5 text-xs text-gray-400 capitalize">
                                                    {Object.entries(item.variant_attributes).map(([k, v]) => `${k}: ${v}`).join(' / ')}
                                                </p>
                                            )}
                                            <p className="mt-0.5 text-sm text-gray-500">Qty: {item.quantity} × ৳{Number(item.unit_price).toFixed(2)}</p>
                                        </div>
                                        <p className="font-bold text-gray-900">৳{Number(item.total_price).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tracking Info */}
                        {(order.tracking_number || order.courier_name) && (
                            <div className="rounded-xl border border-gray-100 bg-white p-5">
                                <h2 className="mb-3 font-semibold text-gray-900">Tracking Information</h2>
                                <div className="space-y-2 text-sm">
                                    {order.courier_name && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Courier</span>
                                            <span className="font-medium text-gray-900">{order.courier_name}</span>
                                        </div>
                                    )}
                                    {order.tracking_number && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Tracking #</span>
                                            <span className="font-mono text-sm font-medium text-gray-900">{order.tracking_number}</span>
                                        </div>
                                    )}
                                    {order.tracking_url && (
                                        <a
                                            href={order.tracking_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-2 flex items-center gap-1.5 text-[#e94560] hover:underline"
                                        >
                                            <ExternalLink className="size-3.5" />
                                            Track your shipment
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Order Timeline */}
                        {sortedHistories.length > 0 && (
                            <div className="rounded-xl border border-gray-100 bg-white p-5">
                                <button
                                    type="button"
                                    onClick={() => setShowTimeline((v) => !v)}
                                    className="flex w-full items-center justify-between"
                                >
                                    <h2 className="font-semibold text-gray-900">Order Timeline</h2>
                                    {showTimeline ? (
                                        <ChevronUp className="size-4 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="size-4 text-gray-400" />
                                    )}
                                </button>
                                {showTimeline && (
                                    <div className="mt-4 space-y-0">
                                        {sortedHistories.map((history, idx) => {
                                            const Icon = statusIcons[history.status] ?? Clock;
                                            const isLast = idx === sortedHistories.length - 1;
                                            return (
                                                <div key={history.id} className="relative flex gap-4">
                                                    {/* Left line */}
                                                    <div className="flex flex-col items-center">
                                                        <div className={cn('z-10 flex size-8 shrink-0 items-center justify-center rounded-full', isLast ? (history.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600') : 'bg-gray-100 text-gray-500')}>
                                                            <Icon className="size-4" />
                                                        </div>
                                                        {!isLast && <div className="w-px flex-1 bg-gray-100 my-1" />}
                                                    </div>
                                                    {/* Content */}
                                                    <div className={cn('pb-4', isLast ? '' : '')}>
                                                        <p className="text-sm font-semibold capitalize text-gray-900">{history.status}</p>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(history.created_at).toLocaleString('en-GB', {
                                                                day: 'numeric', month: 'short', year: 'numeric',
                                                                hour: '2-digit', minute: '2-digit',
                                                            })}
                                                        </p>
                                                        {history.notes && (
                                                            <p className="mt-1 text-xs text-gray-500">{history.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Previous Requests */}
                        {order.requests && order.requests.length > 0 && (
                            <div className="rounded-xl border border-gray-100 bg-white p-5">
                                <h2 className="mb-4 font-semibold text-gray-900">Your Requests</h2>
                                <div className="space-y-3">
                                    {order.requests.map((req) => (
                                        <div key={req.id} className="rounded-lg bg-gray-50 px-4 py-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={cn('border-0 text-xs capitalize', requestTypeColors[req.type] ?? 'bg-gray-100 text-gray-600')}>
                                                        {req.type}
                                                    </Badge>
                                                    <Badge className={cn('border-0 text-xs capitalize', requestStatusColors[req.status] ?? 'bg-gray-100 text-gray-600')}>
                                                        {req.status}
                                                    </Badge>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(req.created_at).toLocaleDateString('en-GB')}
                                                </span>
                                            </div>
                                            <p className="mt-1.5 text-sm text-gray-600">{req.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Shipping Address */}
                        <div className="rounded-xl border border-gray-100 bg-white p-5">
                            <h2 className="mb-3 font-semibold text-gray-900">Shipping Address</h2>
                            <p className="text-sm text-gray-600">{addr.first_name} {addr.last_name}</p>
                            <p className="text-sm text-gray-600">{addr.address}</p>
                            <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                            <p className="text-sm text-gray-600">{addr.country}</p>
                            {(addr.email || addr.phone) && (
                                <p className="mt-1 text-sm text-gray-500">{[addr.email, addr.phone].filter(Boolean).join(' · ')}</p>
                            )}
                        </div>

                        {/* Gift & Notes */}
                        {(order.is_gift || order.notes || order.requested_delivery_date) && (
                            <div className="rounded-xl border border-gray-100 bg-white p-5">
                                <h2 className="mb-3 font-semibold text-gray-900">Order Details</h2>
                                <div className="space-y-3 text-sm">
                                    {order.is_gift && (
                                        <div className="flex items-start gap-2">
                                            <Gift className="mt-0.5 size-4 shrink-0 text-purple-500" />
                                            <div>
                                                <p className="font-medium text-gray-700">Gift Order</p>
                                                {order.gift_message && (
                                                    <p className="mt-0.5 italic text-gray-500">"{order.gift_message}"</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {order.requested_delivery_date && (
                                        <div className="flex items-start gap-2">
                                            <CalendarClock className="mt-0.5 size-4 shrink-0 text-blue-500" />
                                            <div>
                                                <p className="font-medium text-gray-700">Preferred Delivery</p>
                                                <p className="text-gray-500">
                                                    {new Date(order.requested_delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    {order.requested_delivery_time && ` · ${order.requested_delivery_time}`}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {order.notes && (
                                        <div className="flex items-start gap-2">
                                            <StickyNote className="mt-0.5 size-4 shrink-0 text-amber-500" />
                                            <div>
                                                <p className="font-medium text-gray-700">Order Notes</p>
                                                <p className="text-gray-500">{order.notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column — Summary */}
                    <div>
                        <div className="sticky top-24 rounded-xl border border-gray-100 bg-white p-5 text-sm">
                            <h2 className="mb-3 font-semibold text-gray-900">Order Summary</h2>
                            <div className="space-y-2 text-gray-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>৳{Number(order.subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>{Number(order.shipping_cost) === 0 ? <span className="text-green-600">Free</span> : `৳${Number(order.shipping_cost).toFixed(2)}`}</span>
                                </div>
                                {Number(order.discount_amount) > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                                        <span>-৳{Number(order.discount_amount).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t pt-3 font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>৳{Number(order.total).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-4 space-y-1.5 border-t pt-4 text-gray-500">
                                <div className="flex justify-between">
                                    <span>Payment</span>
                                    <span className="uppercase">{order.payment_method}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Status</span>
                                    <Badge className={cn('border-0 text-xs capitalize', order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                                        {order.payment_status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2 border-t pt-4">
                                <a href={invoiceUrl} target="_blank" rel="noreferrer" className="block">
                                    <Button variant="outline" className="w-full gap-2">
                                        <Download className="size-4" />
                                        Download Invoice
                                    </Button>
                                </a>
                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={handleReorder}
                                    disabled={reordering}
                                >
                                    <RotateCcw className="size-4" />
                                    {reordering ? 'Adding to Cart…' : 'Reorder'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
