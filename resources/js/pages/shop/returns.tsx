import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    BadgeCheck,
    ChevronRight,
    Clock,
    Package,
    PackageCheck,
    RotateCcw,
    Truck,
    XCircle,
} from 'lucide-react';
import ShopLayout from '@/layouts/shop-layout';

const steps = [
    {
        number: '01',
        icon: Package,
        title: 'Initiate the Return',
        description:
            'Go to My Orders in your account and find the order you want to return. Click "Request Return" and select the items and reason.',
    },
    {
        number: '02',
        icon: PackageCheck,
        title: 'Pack Your Item',
        description:
            'Securely re-pack the item in its original packaging if possible. Include all accessories, manuals, and tags. Damaged or incomplete returns may be refused.',
    },
    {
        number: '03',
        icon: Truck,
        title: 'Ship It Back',
        description:
            'Drop the package at any courier point within 3 days of return approval. Use the pre-paid return label we email you — it\'s free for defective items.',
    },
    {
        number: '04',
        icon: RotateCcw,
        title: 'Refund Processed',
        description:
            'Once we receive and inspect the item (1–2 business days), we will issue your refund. Funds appear in your account within 3–10 business days.',
    },
];

const eligibleItems = [
    'Unused items in original, undamaged packaging',
    'Defective or damaged products received',
    'Wrong item received vs. order',
    'Items returned within the 7-day window',
];

const ineligibleItems = [
    'Opened perishable goods or hygiene products',
    'Digital downloads and gift cards',
    'Customised / personalised products',
    'Items damaged due to misuse or negligence',
    'Products returned after 7 days of delivery',
];

const faqs = [
    {
        q: 'How long do I have to return an item?',
        a: '7 days from the date of delivery, no exceptions.',
    },
    {
        q: 'Do I pay for return shipping?',
        a: 'Return shipping is free for defective or wrong items. For change-of-mind returns, a flat ৳100 shipping fee is deducted from your refund.',
    },
    {
        q: 'Can I exchange instead of refund?',
        a: 'Yes! During the return request, choose "Exchange" and select the replacement item. Exchanges ship within 1–2 business days after we receive your return.',
    },
    {
        q: 'What if my refund hasn\'t arrived?',
        a: 'Refunds take 3–10 business days depending on your bank. If it\'s been more than 10 days after we processed it, contact your bank first, then reach out to us.',
    },
];

export default function ReturnsPage() {
    return (
        <ShopLayout>
            <Head title="Returns & Refunds — CartAndBuy" />

            {/* Hero */}
            <section className="bg-gradient-to-br from-[#1a1a2e] via-[#0f3460] to-[#1a1a2e] text-white py-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-1.5 rounded-full mb-4">
                        <RotateCcw className="size-4" />
                        Returns &amp; Refunds
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Hassle-free returns</h1>
                    <p className="text-white/60 text-lg mb-8">
                        Changed your mind? No problem. Our 7-day return policy keeps shopping risk-free.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/orders"
                            className="inline-flex items-center justify-center gap-2 bg-[#e94560] hover:bg-[#c73652] text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
                        >
                            Start a Return <ChevronRight className="size-4" />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </section>

            {/* Key policy badges */}
            <section className="bg-gray-50 border-b">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { icon: Clock, label: '7-Day Window', desc: 'From date of delivery' },
                            { icon: BadgeCheck, label: 'Free Returns', desc: 'For defective items' },
                            { icon: RotateCcw, label: 'Fast Refund', desc: '3–10 business days' },
                        ].map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                <div className="p-3 bg-[#e94560]/10 rounded-xl">
                                    <Icon className="size-5 text-[#e94560]" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{label}</p>
                                    <p className="text-xs text-gray-500">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Steps */}
            <section className="max-w-5xl mx-auto px-4 py-14">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">How to return an item</h2>
                <p className="text-gray-500 text-sm text-center mb-10">4 simple steps — takes less than 5 minutes to initiate.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map(({ number, icon: Icon, title, description }, i) => (
                        <div key={number} className="relative flex flex-col">
                            {i < steps.length - 1 && (
                                <ArrowRight className="hidden lg:block absolute -right-3 top-8 size-5 text-gray-300 z-10" />
                            )}
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex-1 flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-xs font-bold text-[#e94560] bg-[#e94560]/10 px-2 py-0.5 rounded-md">
                                        {number}
                                    </span>
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <Icon className="size-5 text-gray-700" />
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Eligible / Not eligible */}
            <section className="bg-gray-50 border-y">
                <div className="max-w-5xl mx-auto px-4 py-14">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What can be returned?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <BadgeCheck className="size-5 text-green-600" />
                                <h3 className="font-semibold text-gray-900">Eligible for return</h3>
                            </div>
                            <ul className="space-y-3">
                                {eligibleItems.map((item) => (
                                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                                        <span className="mt-0.5 size-2 rounded-full bg-green-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <XCircle className="size-5 text-[#e94560]" />
                                <h3 className="font-semibold text-gray-900">Not eligible</h3>
                            </div>
                            <ul className="space-y-3">
                                {ineligibleItems.map((item) => (
                                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                                        <span className="mt-0.5 size-2 rounded-full bg-[#e94560] flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto px-4 py-14">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Common return questions</h2>
                <div className="space-y-4">
                    {faqs.map(({ q, a }) => (
                        <div key={q} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="size-4 text-[#e94560] flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm mb-1">{q}</p>
                                    <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[#0f3460] text-white py-14 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-3">Ready to return something?</h2>
                    <p className="text-white/60 mb-6">Head to your orders page to begin the return process.</p>
                    <Link
                        href="/orders"
                        className="inline-flex items-center gap-2 bg-[#e94560] hover:bg-[#c73652] text-white px-8 py-2.5 rounded-lg font-medium text-sm transition-colors"
                    >
                        Go to My Orders <ArrowRight className="size-4" />
                    </Link>
                </div>
            </section>
        </ShopLayout>
    );
}
