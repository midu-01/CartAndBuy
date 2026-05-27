import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { ArrowUp, Loader2, Mic, MicOff, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import AiMessageBubble from './AiMessageBubble';
import type { AiApiResponse, AiProduct, ChatMessage, QuickAction } from './types';

const QUICK_ACTIONS: QuickAction[] = [
    { label: '🛍️ Best Sellers', action: 'quick', message: 'Show me best sellers' },
    { label: '🔍 All Products', action: 'quick', message: 'Show me all products' },
    { label: '🛒 My Cart', action: 'quick', message: 'Show my cart' },
    { label: '🚚 Delivery', action: 'quick', message: 'Tell me about delivery' },
    { label: '📦 My Orders', action: 'quick', message: 'Show my recent orders' },
    { label: '❤️ Wishlist', action: 'quick', message: 'Show my wishlist' },
    { label: '🎁 Coupons', action: 'quick', message: 'Do you have any coupons?' },
    { label: '📏 Size Guide', action: 'quick', message: 'Show me the size guide' },
];

function makeBotMessage(partial: Omit<ChatMessage, 'id' | 'timestamp' | 'role'>): ChatMessage {
    return { id: crypto.randomUUID(), role: 'assistant', timestamp: new Date(), ...partial };
}

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

interface Props {
    onClose: () => void;
}

export default function AiChatWindow({ onClose }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    const hasSpeechSupport =
        typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    useEffect(() => {
        setMessages([
            makeBotMessage({
                content:
                    "Hi! I'm your CartAndBuy AI assistant ✦\n\nI can help you find products, manage your cart, check orders, discover coupons, and more. How can I help you today?",
                type: 'text',
                actions: QUICK_ACTIONS,
            }),
        ]);
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        return () => recognitionRef.current?.abort();
    }, []);

    async function sendMessage(text: string) {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;

        setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: 'user', content: trimmed, type: 'text', timestamp: new Date() },
        ]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/ai-assistant/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ message: trimmed }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data: AiApiResponse = await res.json();

            setMessages((prev) => [
                ...prev,
                makeBotMessage({
                    content: data.message,
                    type: data.type,
                    products: data.products,
                    cart: data.cart,
                    actions: data.actions,
                }),
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                makeBotMessage({ content: 'Something went wrong. Please try again.', type: 'error' }),
            ]);
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }

    function handleAddToCart(product: AiProduct) {
        router.post(
            '/cart',
            { product_id: product.id, quantity: 1 },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setMessages((prev) => [
                        ...prev,
                        makeBotMessage({
                            content: `**${product.name}** added to your cart! 🛒`,
                            type: 'text',
                            actions: [
                                { label: 'View Cart', action: 'link', url: '/cart' },
                                { label: 'Checkout', action: 'link', url: '/checkout' },
                            ],
                        }),
                    ]);
                },
                onError: () => {
                    setMessages((prev) => [
                        ...prev,
                        makeBotMessage({ content: "Couldn't add to cart. Please try again.", type: 'error' }),
                    ]);
                },
            },
        );
    }

    function handleVoiceInput() {
        if (!hasSpeechSupport) return;

        if (isListening) {
            recognitionRef.current?.abort();
            setIsListening(false);
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new Recognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event: { results: { [x: string]: { [x: string]: { transcript: string } } } }) => {
            setInput(event.results[0][0].transcript);
            inputRef.current?.focus();
        };

        recognitionRef.current = recognition;
        recognition.start();
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Gradient accent bar */}
            <div className="h-0.5 flex-shrink-0 bg-gradient-to-r from-[#e94560] via-[#0f3460] to-[#e94560]" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-br from-[#1a1a2e] via-[#0f3460] to-[#16213e] flex-shrink-0 relative overflow-hidden">
                {/* Subtle grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }}
                />

                <div className="flex items-center gap-3 relative z-10">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e94560] to-[#c73652] flex items-center justify-center shadow-[0_4px_12px_rgba(233,69,96,0.4)]">
                            <Sparkles className="size-5 text-white" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0f3460] shadow-sm" />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-white leading-none tracking-wide">AI Assistant</p>
                        <p className="text-[11px] text-white/50 mt-0.5 font-medium">CartAndBuy · Online now</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    aria-label="Close chat"
                    className="relative z-10 p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                    <X className="size-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#f8faff]">
                {messages.map((msg) => (
                    <AiMessageBubble
                        key={msg.id}
                        message={msg}
                        onQuickAction={sendMessage}
                        onAddToCart={handleAddToCart}
                    />
                ))}

                {/* Typing indicator */}
                {isLoading && (
                    <div className="flex items-end gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e94560] to-[#c73652] flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Sparkles className="size-4 text-white" />
                        </div>
                        <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100/80">
                            <div className="flex gap-1.5 items-center h-4">
                                {[0, 160, 320].map((delay) => (
                                    <span
                                        key={delay}
                                        className="w-1.5 h-1.5 bg-[#0f3460]/40 rounded-full animate-bounce"
                                        style={{ animationDelay: `${delay}ms` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 bg-white border-t border-gray-100 p-3">
                <div
                    className={cn(
                        'flex items-end gap-2 bg-gray-50 border rounded-2xl px-3.5 py-2.5 transition-all duration-200',
                        isListening
                            ? 'border-[#e94560] ring-2 ring-[#e94560]/15'
                            : 'border-gray-200 focus-within:border-[#0f3460] focus-within:ring-2 focus-within:ring-[#0f3460]/10',
                    )}
                >
                    <textarea
                        ref={inputRef}
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isListening ? 'Listening…' : 'Ask me anything…'}
                        disabled={isLoading}
                        maxLength={500}
                        className="flex-1 text-sm bg-transparent resize-none focus:outline-none disabled:opacity-50 placeholder:text-gray-400 leading-relaxed max-h-24"
                        style={{ height: '24px', overflowY: 'hidden' }}
                        onInput={(e) => {
                            const el = e.currentTarget;
                            el.style.height = '24px';
                            el.style.height = Math.min(el.scrollHeight, 96) + 'px';
                        }}
                    />

                    <div className="flex items-center gap-1.5 flex-shrink-0 pb-0.5">
                        {hasSpeechSupport && (
                            <button
                                type="button"
                                onClick={handleVoiceInput}
                                aria-label={isListening ? 'Stop listening' : 'Voice input'}
                                className={cn(
                                    'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                                    isListening
                                        ? 'bg-[#e94560] text-white animate-pulse'
                                        : 'text-gray-400 hover:text-[#0f3460] hover:bg-gray-100',
                                )}
                            >
                                {isListening ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => sendMessage(input)}
                            disabled={isLoading || !input.trim()}
                            aria-label="Send message"
                            className={cn(
                                'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
                                input.trim() && !isLoading
                                    ? 'bg-gradient-to-br from-[#e94560] to-[#c73652] text-white shadow-[0_4px_12px_rgba(233,69,96,0.35)] hover:shadow-[0_6px_16px_rgba(233,69,96,0.5)] hover:scale-105'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <ArrowUp className="size-3.5" />
                            )}
                        </button>
                    </div>
                </div>

                <p className="text-[10px] text-gray-300 text-center mt-2 font-medium tracking-wide">
                    Powered by AI · CartAndBuy
                </p>
            </div>
        </div>
    );
}
