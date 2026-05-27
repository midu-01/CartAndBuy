import { Head } from '@inertiajs/react';
import { CheckCircle2, Clock, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import ShopLayout from '@/layouts/shop-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const contactCards = [
    {
        icon: Phone,
        title: 'Call Us',
        detail: '+880 1234-567890',
        sub: 'Mon–Sat, 9 AM – 6 PM',
        color: 'bg-blue-50 text-blue-600',
    },
    {
        icon: Mail,
        title: 'Email Us',
        detail: 'support@cartandbuy.com',
        sub: 'We reply within 24 hours',
        color: 'bg-[#e94560]/10 text-[#e94560]',
    },
    {
        icon: MapPin,
        title: 'Visit Us',
        detail: 'Dhaka, Bangladesh',
        sub: 'Gulshan-2, Road 11',
        color: 'bg-green-50 text-green-600',
    },
];

const topics = [
    'Order Issue',
    'Shipping & Delivery',
    'Return & Refund',
    'Payment Problem',
    'Account Help',
    'Product Question',
    'Other',
];

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitted(true);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    return (
        <ShopLayout>
            <Head title="Contact Us — CartAndBuy" />

            {/* Hero */}
            <section className="bg-gradient-to-br from-[#1a1a2e] via-[#0f3460] to-[#1a1a2e] text-white py-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-1.5 rounded-full mb-4">
                        <MessageSquare className="size-4" />
                        Contact Us
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">We're here to help</h1>
                    <p className="text-white/60 text-lg">
                        Reach out through any channel below — our team will get back to you quickly.
                    </p>
                </div>
            </section>

            {/* Contact cards */}
            <section className="bg-gray-50 border-b">
                <div className="max-w-5xl mx-auto px-4 py-10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {contactCards.map(({ icon: Icon, title, detail, sub, color }) => (
                            <div
                                key={title}
                                className="bg-white rounded-2xl border border-gray-100 p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className={`p-3 rounded-xl ${color}`}>
                                    <Icon className="size-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{title}</p>
                                    <p className="font-semibold text-gray-900 text-sm">{detail}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Form + Hours */}
            <section className="max-w-5xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Form */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Send us a message</h2>
                    <p className="text-gray-500 text-sm mb-6">Fill out the form and we'll get back to you within 24 hours.</p>

                    {submitted ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center bg-green-50 rounded-2xl border border-green-100">
                            <CheckCircle2 className="size-12 text-green-500" />
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Message sent!</h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    Thanks, {form.name}. We'll reply to <strong>{form.email}</strong> shortly.
                                </p>
                            </div>
                            <button
                                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', topic: '', message: '' }); }}
                                className="text-sm text-[#e94560] hover:underline"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        placeholder="Your name"
                                        value={form.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="topic">Topic</Label>
                                <select
                                    id="topic"
                                    name="topic"
                                    required
                                    value={form.topic}
                                    onChange={handleChange}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-gray-900"
                                >
                                    <option value="" disabled>Select a topic…</option>
                                    {topics.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="message">Message</Label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={5}
                                    placeholder="Describe your issue or question in detail…"
                                    value={form.message}
                                    onChange={handleChange}
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                />
                            </div>

                            <Button type="submit" className="bg-[#e94560] hover:bg-[#c73652] border-0 text-white px-8">
                                <Send className="size-4 mr-2" />
                                Send Message
                            </Button>
                        </form>
                    )}
                </div>

                {/* Hours sidebar */}
                <div className="space-y-6">
                    <div className="bg-[#1a1a2e] text-white rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="size-5 text-[#e94560]" />
                            <h3 className="font-semibold">Support Hours</h3>
                        </div>
                        <ul className="space-y-2 text-sm">
                            {[
                                { day: 'Monday – Friday', hrs: '9:00 AM – 6:00 PM' },
                                { day: 'Saturday', hrs: '10:00 AM – 4:00 PM' },
                                { day: 'Sunday', hrs: 'Closed' },
                            ].map(({ day, hrs }) => (
                                <li key={day} className="flex justify-between">
                                    <span className="text-white/60">{day}</span>
                                    <span className={hrs === 'Closed' ? 'text-[#e94560]' : 'text-white'}>{hrs}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Quick links</h3>
                        <ul className="space-y-2 text-sm">
                            {[
                                { label: 'Track my order', href: '/orders' },
                                { label: 'Start a return', href: '/returns' },
                                { label: 'Help Center', href: '/help-center' },
                                { label: 'My account', href: '/settings/profile' },
                            ].map(({ label, href }) => (
                                <li key={label}>
                                    <a
                                        href={href}
                                        className="flex items-center gap-1.5 text-[#e94560] hover:underline"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-[#e94560]" />
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
        </ShopLayout>
    );
}
