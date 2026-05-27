import { ShoppingBag } from 'lucide-react';
import type { AiCart } from './types';

interface Props {
    cart: AiCart;
}

export default function AiCartSummary({ cart }: Props) {
    if (cart.is_empty) {
        return (
            <div className="text-center py-5 text-gray-300">
                <ShoppingBag className="size-9 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium text-gray-400">Your cart is empty</p>
            </div>
        );
    }

    const progress = Math.min(100, (cart.total / cart.free_shipping_threshold) * 100);

    return (
        <div className="space-y-3">
            {/* Items */}
            {cart.items.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                        <img
                            src={item.image ?? 'https://placehold.co/80x80/f1f5f9/94a3b8?text=?'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                            {item.quantity} × ৳{item.price.toFixed(0)}
                        </p>
                    </div>
                    <p className="text-xs font-bold text-gray-800 flex-shrink-0">৳{item.subtotal.toFixed(0)}</p>
                </div>
            ))}

            {cart.items.length > 4 && (
                <p className="text-[10px] text-gray-400 text-center font-medium">
                    +{cart.items.length - 4} more item{cart.items.length - 4 > 1 ? 's' : ''}
                </p>
            )}

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-700">Total</span>
                <span className="text-sm font-bold text-[#e94560]">{cart.formatted_total}</span>
            </div>

            {/* Free shipping progress */}
            <div
                className={`rounded-xl p-3 ${cart.has_free_shipping ? 'bg-emerald-50 border border-emerald-100' : 'bg-[#f0f4ff] border border-[#0f3460]/10'}`}
            >
                {cart.has_free_shipping ? (
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🆓</span>
                        <p className="text-[11px] font-semibold text-emerald-700">
                            You qualify for <strong>free shipping</strong>!
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-[11px] text-[#0f3460]/70 mb-2">
                            Add{' '}
                            <span className="font-bold text-[#0f3460]">৳{cart.amount_to_free_shipping.toFixed(0)}</span>{' '}
                            more for{' '}
                            <span className="font-bold text-[#e94560]">free shipping</span>
                        </p>
                        <div className="h-1.5 w-full bg-[#0f3460]/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#0f3460] to-[#e94560] rounded-full transition-all duration-700"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-[9px] text-[#0f3460]/40 mt-1 text-right font-medium">
                            {Math.round(progress)}% to free shipping
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
