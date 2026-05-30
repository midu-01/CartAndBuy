import { Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import AiCartSummary from './AiCartSummary';
import AiCouponCard from './AiCouponCard';
import AiProductCard from './AiProductCard';
import type { AiProduct, ChatMessage, QuickAction } from './types';

interface Props {
    message: ChatMessage;
    onQuickAction: (message: string) => void;
    onAddToCart: (product: AiProduct) => void;
}

export default function AiMessageBubble({ message, onQuickAction, onAddToCart }: Props) {
    const isUser = message.role === 'user';

    return (
        <div className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
            {/* Avatar */}
            {isUser ? (
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-[#e94560] to-[#c73652] flex items-center justify-center shadow-sm mt-0.5">
                    <User className="size-3.5 text-white" />
                </div>
            ) : (
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-[#e94560] to-[#c73652] flex items-center justify-center shadow-sm mt-0.5">
                    <Sparkles className="size-3.5 text-white" />
                </div>
            )}

            {/* Bubble + attachments */}
            <div className={cn('flex flex-col gap-2 min-w-0', isUser ? 'items-end max-w-[82%]' : 'items-start max-w-[88%]')}>
                {/* Text bubble */}
                <div
                    className={cn(
                        'px-4 py-2.5 text-sm leading-relaxed break-words',
                        isUser
                            ? 'bg-gradient-to-br from-[#e94560] to-[#c73652] text-white rounded-2xl rounded-tr-sm shadow-[0_4px_16px_rgba(233,69,96,0.3)]'
                            : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100/80',
                    )}
                >
                    <FormattedText content={message.content} isUser={isUser} />
                </div>

                {/* Product cards */}
                {message.products && message.products.length > 0 && (
                    <div className="w-full space-y-2">
                        {message.products.map((product) => (
                            <AiProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
                        ))}
                    </div>
                )}

                {/* Cart summary */}
                {message.cart && !message.cart.is_empty && (
                    <div className="w-full bg-white rounded-2xl border border-gray-100/80 shadow-sm p-4">
                        <AiCartSummary cart={message.cart} />
                    </div>
                )}

                {/* Coupon cards */}
                {message.coupons && message.coupons.length > 0 && (
                    <div className="w-full space-y-2">
                        {message.coupons.map((coupon) => (
                            <AiCouponCard key={coupon.code} coupon={coupon} />
                        ))}
                    </div>
                )}

                {/* Action chips */}
                {message.actions && message.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {message.actions.map((action, i) => (
                            <ActionChip key={i} action={action} onQuickAction={onQuickAction} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function FormattedText({ content, isUser }: { content: string; isUser: boolean }) {
    const segments = content.split(/(\*\*[^*]+\*\*)/g);

    return (
        <>
            {segments.map((seg, i) => {
                if (seg.startsWith('**') && seg.endsWith('**')) {
                    return (
                        <strong key={i} className={isUser ? 'text-white' : 'text-gray-900'}>
                            {seg.slice(2, -2)}
                        </strong>
                    );
                }

                return seg.split('\n').map((line, j) => (
                    <span key={`${i}-${j}`}>
                        {j > 0 && <br />}
                        {line}
                    </span>
                ));
            })}
        </>
    );
}

function ActionChip({ action, onQuickAction }: { action: QuickAction; onQuickAction: (msg: string) => void }) {
    const cls = cn(
        'inline-flex items-center text-[11px] font-medium px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer',
        'bg-white border border-[#0f3460]/12 text-[#0f3460] shadow-sm',
        'hover:bg-gradient-to-r hover:from-[#0f3460] hover:to-[#e94560] hover:text-white hover:border-transparent hover:shadow-[0_4px_12px_rgba(15,52,96,0.25)]',
    );

    if (action.action === 'link' && action.url) {
        return (
            <a href={action.url} className={cls}>
                {action.label}
            </a>
        );
    }

    return (
        <button onClick={() => onQuickAction(action.message ?? action.label)} className={cls}>
            {action.label}
        </button>
    );
}
