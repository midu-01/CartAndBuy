import { useState } from 'react';
import { Check, Copy, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AiCoupon } from './types';

interface Props {
    coupon: AiCoupon;
}

export default function AiCouponCard({ coupon }: Props) {
    const [copied, setCopied] = useState(false);

    function copyCode() {
        navigator.clipboard.writeText(coupon.code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <div className="bg-white rounded-2xl border border-dashed border-[#e94560]/40 shadow-sm overflow-hidden hover:border-[#e94560]/70 hover:shadow-md transition-all duration-200">
            <div className="flex">
                {/* Left accent strip */}
                <div className="w-1.5 flex-shrink-0 bg-gradient-to-b from-[#e94560] to-[#c73652]" />

                <div className="flex-1 p-3 flex items-center gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#e94560]/10 to-[#e94560]/5 flex items-center justify-center border border-[#e94560]/15">
                        <Tag className="size-4 text-[#e94560]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-[#e94560] tracking-widest uppercase leading-none mb-1">
                            {coupon.discount_label}
                        </p>
                        {coupon.min_order && (
                            <p className="text-[10px] text-gray-400 leading-none">
                                Min. order ৳{coupon.min_order.toLocaleString()}
                            </p>
                        )}
                        {coupon.max_discount && coupon.type === 'percent' && (
                            <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                                Max. discount ৳{coupon.max_discount.toLocaleString()}
                            </p>
                        )}
                        {coupon.expires_at && (
                            <p className="text-[10px] text-amber-500 leading-none mt-0.5">
                                Expires {new Date(coupon.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </p>
                        )}
                    </div>

                    {/* Code + copy */}
                    <button
                        onClick={copyCode}
                        className={cn(
                            'flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-200 group',
                            copied
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                : 'bg-gray-50 border-gray-200 hover:bg-[#e94560]/5 hover:border-[#e94560]/30 text-gray-700 hover:text-[#e94560]',
                        )}
                        title="Copy code"
                    >
                        <span className="text-[11px] font-bold tracking-wider font-mono">{coupon.code}</span>
                        {copied ? (
                            <Check className="size-3 text-emerald-600 flex-shrink-0" />
                        ) : (
                            <Copy className="size-3 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
