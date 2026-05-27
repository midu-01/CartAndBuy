import { Head, Link } from '@inertiajs/react';
import { BookOpen, ChevronDown, ChevronRight, CreditCard, Package, RotateCcw, Search, ShieldCheck, Truck, User } from 'lucide-react';
import { useState } from 'react';
import ShopLayout from '@/layouts/shop-layout';

const categories = [
    { icon: Package, label: 'Orders', color: 'bg-blue-50 text-blue-600' },
    { icon: Truck, label: 'Shipping', color: 'bg-green-50 text-green-600' },
    { icon: RotateCcw, label: 'Returns', color: 'bg-orange-50 text-orange-600' },
    { icon: CreditCard, label: 'Payments', color: 'bg-purple-50 text-purple-600' },
    { icon: User, label: 'Account', color: 'bg-pink-50 text-pink-600' },
    { icon: ShieldCheck, label: 'Security', color: 'bg-teal-50 text-teal-600' },
];

const faqs: { category: string; q: string; a: string }[] = [
    {
        category: 'Orders',
        q: 'How do I track my order?',
        a: 'Once your order is shipped, you will receive an email with a tracking number. You can also visit your Order History page under your account to see the current status of any order.',
    },
    {
        category: 'Orders',
        q: 'Can I modify or cancel an order after placing it?',
        a: 'You can cancel a pending order from your Order History page before it moves to "Processing". Once processing begins, cancellations are no longer possible — please contact our support team immediately if you need help.',
    },
    {
        category: 'Shipping',
        q: 'How long does standard delivery take?',
        a: 'Standard delivery takes 3–7 business days depending on your location. Express shipping (1–2 business days) is available at checkout for an additional fee.',
    },
    {
        category: 'Shipping',
        q: 'Is free shipping available?',
        a: 'Yes! Orders over ৳2,000 qualify for free standard shipping. The discount is applied automatically at checkout — no coupon code needed.',
    },
    {
        category: 'Returns',
        q: 'What is your return policy?',
        a: 'We offer a 7-day return window from the date of delivery. Items must be unused, in original packaging, and accompanied by the original receipt. Visit our Returns page for full details and to start a return.',
    },
    {
        category: 'Returns',
        q: 'How long does a refund take?',
        a: 'Once we receive and inspect the returned item, refunds are processed within 3–5 business days. It may take an additional 5–10 days for the funds to appear in your account, depending on your bank.',
    },
    {
        category: 'Payments',
        q: 'What payment methods are accepted?',
        a: 'We accept major debit/credit cards (Visa, Mastercard), mobile banking (bKash, Nagad, Rocket), and cash on delivery for eligible orders.',
    },
    {
        category: 'Payments',
        q: 'Is my payment information secure?',
        a: 'Absolutely. All transactions are encrypted with SSL/TLS. We never store your full card details on our servers — payments are processed through certified, PCI-DSS-compliant gateways.',
    },
    {
        category: 'Account',
        q: 'How do I reset my password?',
        a: 'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a reset link within a few minutes. Check your spam folder if it doesn\'t arrive.',
    },
    {
        category: 'Account',
        q: 'How do I update my shipping address?',
        a: 'You can update your shipping address at checkout for each individual order. We don\'t store a fixed default address — just enter your preferred address when you check out.',
    },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
            >
                <span className="font-medium text-gray-900">{q}</span>
                <ChevronDown
                    className={`size-4 text-gray-400 flex-shrink-0 ml-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && (
                <div className="px-5 pb-4 pt-1 bg-white border-t border-gray-100">
                    <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
                </div>
            )}
        </div>
    );
}

export default function HelpCenterPage() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filtered = faqs.filter((faq) => {
        const matchesSearch =
            !search ||
            faq.q.toLowerCase().includes(search.toLowerCase()) ||
            faq.a.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !activeCategory || faq.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <ShopLayout>
            <Head title="Help Center — CartAndBuy" />

            {/* Hero */}
            <section className="bg-gradient-to-br from-[#1a1a2e] via-[#0f3460] to-[#1a1a2e] text-white py-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-1.5 rounded-full mb-4">
                        <BookOpen className="size-4" />
                        Help Center
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">How can we help you?</h1>
                    <p className="text-white/60 text-lg mb-8">Search our knowledge base or browse by category below.</p>
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for answers…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e94560] shadow-lg text-sm"
                        />
                    </div>
                </div>
            </section>

            {/* Category pills */}
            <section className="bg-gray-50 border-b">
                <div className="max-w-5xl mx-auto px-4 py-6">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {categories.map(({ icon: Icon, label, color }) => (
                            <button
                                key={label}
                                onClick={() => setActiveCategory(activeCategory === label ? null : label)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                                    activeCategory === label
                                        ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560]'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-[#e94560] hover:text-[#e94560]'
                                }`}
                            >
                                <span className={`p-1 rounded-lg ${color}`}>
                                    <Icon className="size-3.5" />
                                </span>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto px-4 py-14">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    {activeCategory ? `${activeCategory} Questions` : 'Frequently Asked Questions'}
                    {search && <span className="font-normal text-gray-400 text-base ml-2">for "{search}"</span>}
                </h2>

                {filtered.length > 0 ? (
                    <div className="space-y-3">
                        {filtered.map((faq) => (
                            <AccordionItem key={faq.q} q={faq.q} a={faq.a} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg mb-2">No results found.</p>
                        <p className="text-gray-400 text-sm">Try a different search term or browse by category.</p>
                    </div>
                )}
            </section>

            {/* Still need help? */}
            <section className="bg-[#0f3460] text-white py-14 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-3">Still need help?</h2>
                    <p className="text-white/60 mb-6">Our support team is ready to assist you with any question.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 bg-[#e94560] hover:bg-[#c73652] text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
                        >
                            Contact Support <ChevronRight className="size-4" />
                        </Link>
                        <Link
                            href="/returns"
                            className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
                        >
                            Return Policy
                        </Link>
                    </div>
                </div>
            </section>
        </ShopLayout>
    );
}
