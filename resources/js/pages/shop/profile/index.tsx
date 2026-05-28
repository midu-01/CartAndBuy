import { useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Camera, CheckCircle, Home, Lock, LogOut, MapPin, Package,
    Plus, RefreshCcw, RotateCcw, ShoppingBag, Star, Trash2,
    User, Edit2, Heart,
} from 'lucide-react';
import ShopLayout from '@/layouts/shop-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CustomerAddress {
    id: number;
    label: string;
    recipient_name: string;
    recipient_phone: string;
    address_line: string;
    city: string;
    area: string;
    postal_code: string;
    is_default: boolean;
}

interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    gender: 'male' | 'female' | 'other' | null;
    birthday: string | null;
    avatar_url: string | null;
    initials: string;
    email_verified_at: string | null;
    marketing_email: boolean;
    marketing_sms: boolean;
    addresses: CustomerAddress[];
}

interface Props { profile: UserProfile }

// ─── Avatar ──────────────────────────────────────────────────────────────────

function AvatarBlock({ profile }: { profile: UserProfile }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) { return; }

        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        const form = new FormData();
        form.append('avatar', file);

        router.post('/profile/avatar', form, {
            forceFormData: true,
            onError: () => setPreview(null),
        });
    }

    const src = preview ?? profile.avatar_url;

    return (
        <div className="flex flex-col items-center gap-3">
            <div
                className="relative group cursor-pointer size-24"
                onClick={() => fileRef.current?.click()}
            >
                {src ? (
                    <img
                        src={src}
                        alt={profile.name}
                        className="size-24 rounded-full object-cover ring-2 ring-[#e94560]/30"
                    />
                ) : (
                    <div className="size-24 rounded-full bg-gradient-to-br from-[#e94560] to-[#c73652] flex items-center justify-center ring-2 ring-[#e94560]/30">
                        <span className="text-2xl font-bold text-white">{profile.initials}</span>
                    </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="size-6 text-white" />
                </div>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
            <div className="text-center">
                <p className="font-semibold text-gray-900">{profile.name}</p>
                <p className="text-xs text-gray-500 truncate max-w-[160px]">{profile.email}</p>
                {profile.email_verified_at && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600">
                        <CheckCircle className="size-3" /> Verified
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Sidebar Nav ─────────────────────────────────────────────────────────────

type Tab = 'profile' | 'addresses' | 'security';

function SidebarNav({ active, setActive }: { active: Tab; setActive: (t: Tab) => void }) {
    const navBtn = (tab: Tab, icon: React.ReactNode, label: string, disabled = false) => (
        <button
            key={tab}
            onClick={() => !disabled && setActive(tab)}
            disabled={disabled}
            className={cn(
                'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-left',
                active === tab && !disabled
                    ? 'bg-[#e94560]/10 font-medium text-[#e94560]'
                    : disabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            )}
        >
            {icon}
            <span className="flex-1">{label}</span>
            {disabled && <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Soon</span>}
        </button>
    );

    return (
        <nav className="space-y-0.5">
            {navBtn('profile', <User className="size-4 shrink-0" />, 'My Profile')}
            {navBtn('addresses', <MapPin className="size-4 shrink-0" />, 'Address Book')}
            {navBtn('security', <Lock className="size-4 shrink-0" />, 'Security')}

            <Separator className="my-2" />

            <a href="/orders" className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <ShoppingBag className="size-4 shrink-0" />
                My Orders
            </a>
            <a href="/orders?status=return_requested" className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <RotateCcw className="size-4 shrink-0" />
                My Returns
            </a>
            <a href="/orders?status=cancelled" className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <RefreshCcw className="size-4 shrink-0" />
                My Cancellations
            </a>

            <Separator className="my-2" />

            <a href="/wishlist" className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <Heart className="size-4 shrink-0" />
                Wishlist
            </a>

            <Separator className="my-2" />

            <a
                href="/logout"
                onClick={(e) => { e.preventDefault(); router.post('/logout'); }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
                <LogOut className="size-4 shrink-0" />
                Logout
            </a>
        </nav>
    );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab({ profile }: { profile: UserProfile }) {
    const { data, setData, post, processing, errors } = useForm({
        name: profile.name,
        phone: profile.phone ?? '',
        gender: profile.gender ?? '',
        birthday: profile.birthday ?? '',
        marketing_email: profile.marketing_email,
        marketing_sms: profile.marketing_sms,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/profile/update');
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className={cn('w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none', errors.name && 'border-red-400')}
                        placeholder="Your full name"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Email Address</label>
                    <div className="flex gap-2">
                        <input
                            value={profile.email}
                            readOnly
                            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
                        />
                        {profile.email_verified_at && (
                            <span className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 text-xs font-medium text-green-700">
                                <CheckCircle className="size-3" /> Verified
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="+880 1XXX-XXXXXX"
                        className={cn('w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none', errors.phone && 'border-red-400')}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Gender</label>
                    <select
                        value={data.gender}
                        onChange={(e) => setData('gender', e.target.value)}
                        className={cn('w-full rounded-lg border px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#e94560] focus:outline-none', errors.gender && 'border-red-400')}
                    >
                        <option value="">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Birthday</label>
                    <input
                        type="date"
                        value={data.birthday}
                        onChange={(e) => setData('birthday', e.target.value)}
                        className={cn('w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none', errors.birthday && 'border-red-400')}
                    />
                    {errors.birthday && <p className="mt-1 text-xs text-red-500">{errors.birthday}</p>}
                </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-3 text-sm font-medium text-gray-900">Marketing Preferences</p>
                <div className="space-y-2">
                    {([
                        { key: 'marketing_email' as const, label: 'Email promotions & offers' },
                        { key: 'marketing_sms' as const, label: 'SMS updates & flash sales' },
                    ] as const).map(({ key, label }) => (
                        <label key={key} className="flex cursor-pointer items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data[key]}
                                onChange={(e) => setData(key, e.target.checked)}
                                className="size-4 rounded border-gray-300 text-[#e94560] accent-[#e94560]"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={processing} className="border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                    {processing ? 'Saving…' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}

// ─── Address Book Tab ─────────────────────────────────────────────────────────

type AddressFormData = {
    label: string;
    recipient_name: string;
    recipient_phone: string;
    address_line: string;
    city: string;
    area: string;
    postal_code: string;
};

const BLANK_ADDRESS: AddressFormData = {
    label: 'Home',
    recipient_name: '',
    recipient_phone: '',
    address_line: '',
    city: '',
    area: '',
    postal_code: '',
};

const LABEL_ICONS: Record<string, React.ReactNode> = {
    Home: <Home className="size-3.5" />,
    Work: <Package className="size-3.5" />,
    Other: <MapPin className="size-3.5" />,
};

const LABEL_COLORS: Record<string, string> = {
    Home: 'bg-blue-50 text-blue-700',
    Work: 'bg-purple-50 text-purple-700',
    Other: 'bg-gray-100 text-gray-600',
};

function AddressFormFields({
    data, setData, errors,
}: {
    data: AddressFormData;
    setData: <K extends keyof AddressFormData>(key: K, value: AddressFormData[K]) => void;
    errors: Partial<Record<keyof AddressFormData, string>>;
}) {
    const field = (key: keyof AddressFormData, label: string, placeholder = '', half = false) => (
        <div className={half ? '' : 'sm:col-span-2'}>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
            <input
                value={data[key]}
                onChange={(e) => setData(key, e.target.value)}
                placeholder={placeholder}
                className={cn('w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none', errors[key] && 'border-red-400')}
            />
            {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
        </div>
    );

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Label</label>
                <div className="flex gap-2">
                    {(['Home', 'Work', 'Other'] as const).map((l) => (
                        <button
                            key={l}
                            type="button"
                            onClick={() => setData('label', l)}
                            className={cn(
                                'flex items-center gap-1.5 rounded-lg border px-4 py-1.5 text-sm capitalize transition-colors',
                                data.label === l
                                    ? 'border-[#e94560] bg-[#e94560]/5 font-medium text-[#e94560]'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300',
                            )}
                        >
                            {LABEL_ICONS[l]} {l}
                        </button>
                    ))}
                </div>
            </div>
            {field('recipient_name', 'Recipient Name', 'Full name', true)}
            {field('recipient_phone', 'Phone Number', '+880 1XXX-XXXXXX', true)}
            {field('address_line', 'Address Line', 'Street, building, apartment…')}
            {field('city', 'City', 'e.g. Dhaka', true)}
            {field('area', 'Area / Upazilla', 'e.g. Gulshan', true)}
            {field('postal_code', 'Postal Code', 'e.g. 1212', true)}
        </div>
    );
}

function AddressBook({ addresses }: { addresses: CustomerAddress[] }) {
    const [addOpen, setAddOpen] = useState(false);
    const [editAddress, setEditAddress] = useState<CustomerAddress | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const addForm = useForm<AddressFormData>(BLANK_ADDRESS);
    const editForm = useForm<AddressFormData>(BLANK_ADDRESS);

    function openEdit(addr: CustomerAddress) {
        editForm.setData({
            label: addr.label,
            recipient_name: addr.recipient_name,
            recipient_phone: addr.recipient_phone,
            address_line: addr.address_line,
            city: addr.city,
            area: addr.area,
            postal_code: addr.postal_code,
        });
        setEditAddress(addr);
    }

    function submitAdd(e: React.FormEvent) {
        e.preventDefault();
        addForm.post('/profile/addresses', {
            onSuccess: () => { addForm.reset(); setAddOpen(false); },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editAddress) { return; }
        editForm.put(`/profile/addresses/${editAddress.id}`, {
            onSuccess: () => setEditAddress(null),
        });
    }

    function confirmDelete() {
        if (!deleteId) { return; }
        router.delete(`/profile/addresses/${deleteId}`, {
            onFinish: () => setDeleteId(null),
        });
    }

    function setDefault(id: number) {
        router.post(`/profile/addresses/${id}/default`);
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => setAddOpen(true)} className="gap-2 border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                    <Plus className="size-4" /> Add Address
                </Button>
            </div>

            {addresses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
                    <MapPin className="mx-auto mb-3 size-10 text-gray-200" />
                    <p className="font-medium text-gray-500">No saved addresses yet.</p>
                    <p className="mt-1 text-sm text-gray-400">Add an address to speed up checkout.</p>
                    <Button onClick={() => setAddOpen(true)} className="mt-5 gap-2 border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                        <Plus className="size-4" /> Add First Address
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className={cn(
                                'rounded-xl border p-4 relative transition-all',
                                addr.is_default ? 'border-[#e94560]/40 bg-[#e94560]/3' : 'border-gray-100 bg-white',
                            )}
                        >
                            {addr.is_default && (
                                <span className="absolute right-3 top-3 rounded-full bg-[#e94560] px-2 py-0.5 text-[10px] font-semibold text-white">
                                    Default
                                </span>
                            )}
                            <div className="mb-2 flex items-center gap-2">
                                <Badge className={cn('border-0 text-xs gap-1', LABEL_COLORS[addr.label] ?? 'bg-gray-100 text-gray-600')}>
                                    {LABEL_ICONS[addr.label]} {addr.label}
                                </Badge>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{addr.recipient_name}</p>
                            <p className="text-xs text-gray-500">{addr.recipient_phone}</p>
                            <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                                {addr.address_line}, {addr.area}, {addr.city} – {addr.postal_code}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {!addr.is_default && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDefault(addr.id)}
                                        className="h-7 px-2 text-xs"
                                    >
                                        <Star className="mr-1 size-3" /> Set Default
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEdit(addr)}
                                    className="h-7 px-2 text-xs"
                                >
                                    <Edit2 className="mr-1 size-3" /> Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteId(addr.id)}
                                    className="h-7 px-2 text-xs text-red-500 hover:border-red-200 hover:bg-red-50"
                                >
                                    <Trash2 className="mr-1 size-3" /> Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            <Dialog open={addOpen} onOpenChange={(v) => { if (!v) { addForm.reset(); } setAddOpen(v); }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitAdd}>
                        <AddressFormFields data={addForm.data} setData={addForm.setData} errors={addForm.errors} />
                        <DialogFooter className="mt-5">
                            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={addForm.processing} className="border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                                {addForm.processing ? 'Saving…' : 'Save Address'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={!!editAddress} onOpenChange={(v) => { if (!v) { setEditAddress(null); } }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Address</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit}>
                        <AddressFormFields data={editForm.data} setData={editForm.setData} errors={editForm.errors} />
                        <DialogFooter className="mt-5">
                            <Button type="button" variant="outline" onClick={() => setEditAddress(null)}>Cancel</Button>
                            <Button type="submit" disabled={editForm.processing} className="border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                                {editForm.processing ? 'Saving…' : 'Update Address'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!deleteId} onOpenChange={(v) => { if (!v) { setDeleteId(null); } }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Address?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button onClick={confirmDelete} className="border-0 bg-red-500 text-white hover:bg-red-600">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/profile/password', {
            onSuccess: () => reset(),
        });
    }

    return (
        <div className="max-w-md">
            <h3 className="mb-5 text-base font-semibold text-gray-900">Change Password</h3>

            {wasSuccessful && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    Password changed successfully.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {([
                    { key: 'current_password' as const, label: 'Current Password' },
                    { key: 'password' as const, label: 'New Password' },
                    { key: 'password_confirmation' as const, label: 'Confirm New Password' },
                ] as const).map(({ key, label }) => (
                    <div key={key}>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
                        <input
                            type="password"
                            value={data[key]}
                            onChange={(e) => setData(key, e.target.value)}
                            autoComplete={key === 'current_password' ? 'current-password' : 'new-password'}
                            className={cn('w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none', errors[key] && 'border-red-400')}
                        />
                        {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
                    </div>
                ))}

                <div className="pt-2">
                    <Button type="submit" disabled={processing} className="border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                        {processing ? 'Updating…' : 'Update Password'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage({ profile }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    const tabLabels: Record<Tab, string> = {
        profile: 'My Profile',
        addresses: 'Address Book',
        security: 'Security',
    };

    return (
        <ShopLayout>
            <Head title="My Profile — CartAndBuy" />

            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Sidebar */}
                    <aside className="shrink-0 lg:w-60">
                        <div className="sticky top-24 rounded-xl border border-gray-100 bg-white p-5">
                            <AvatarBlock profile={profile} />
                            <Separator className="my-4" />
                            <SidebarNav active={activeTab} setActive={setActiveTab} />
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="min-w-0 flex-1">
                        <div className="rounded-xl border border-gray-100 bg-white">
                            {/* Tab bar */}
                            <div className="flex border-b">
                                {(['profile', 'addresses', 'security'] as Tab[]).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={cn(
                                            'px-5 py-3.5 text-sm font-medium transition-colors',
                                            activeTab === tab
                                                ? 'border-b-2 border-[#e94560] text-[#e94560]'
                                                : 'text-gray-500 hover:text-gray-700',
                                        )}
                                    >
                                        {tabLabels[tab]}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6">
                                {activeTab === 'profile' && <ProfileTab profile={profile} />}
                                {activeTab === 'addresses' && <AddressBook addresses={profile.addresses} />}
                                {activeTab === 'security' && <SecurityTab />}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </ShopLayout>
    );
}
