import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react';
import ShopLayout from '@/layouts/shop-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Address {
    id: number;
    type: string;
    first_name: string;
    last_name: string | null;
    phone: string;
    address: string;
    city: string;
    state: string;
    upazilla: string | null;
    village: string | null;
    zip: string | null;
    country: string;
    is_default: boolean;
}

interface Props {
    addresses: Address[];
}

type AddressForm = {
    type: string;
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    upazilla: string;
    village: string;
    zip: string;
    country: string;
    is_default: boolean;
};

const emptyForm: AddressForm = {
    type: 'shipping',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    upazilla: '',
    village: '',
    zip: '',
    country: 'Bangladesh',
    is_default: false,
};

function Field({
    label,
    name,
    type = 'text',
    placeholder,
    required = false,
    data,
    setData,
    errors,
}: {
    label: string;
    name: keyof AddressForm;
    type?: string;
    placeholder?: string;
    required?: boolean;
    data: AddressForm;
    setData: (key: keyof AddressForm, value: string | boolean) => void;
    errors: Partial<Record<keyof AddressForm, string>>;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
                {!required && <span className="ml-1 text-xs font-normal text-gray-400">(Optional)</span>}
            </label>
            <input
                type={type}
                value={data[name] as string}
                onChange={(e) => setData(name, e.target.value)}
                placeholder={placeholder}
                className={cn(
                    'w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none',
                    errors[name] && 'border-red-400',
                )}
            />
            {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
        </div>
    );
}

function AddressFormModal({
    open,
    onClose,
    editAddress,
}: {
    open: boolean;
    onClose: () => void;
    editAddress: Address | null;
}) {
    const { data, setData, post, put, processing, errors, reset } = useForm<AddressForm>(
        editAddress
            ? {
                  type: editAddress.type,
                  first_name: editAddress.first_name,
                  last_name: editAddress.last_name ?? '',
                  phone: editAddress.phone,
                  address: editAddress.address,
                  city: editAddress.city,
                  state: editAddress.state,
                  upazilla: editAddress.upazilla ?? '',
                  village: editAddress.village ?? '',
                  zip: editAddress.zip ?? '',
                  country: editAddress.country,
                  is_default: editAddress.is_default,
              }
            : emptyForm,
    );

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (editAddress) {
            put(`/addresses/${editAddress.id}`, {
                onSuccess: () => { reset(); onClose(); },
            });
        } else {
            post('/addresses', {
                onSuccess: () => { reset(); onClose(); },
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Address Type</label>
                        <div className="flex gap-3">
                            {(['shipping', 'billing'] as const).map((t) => (
                                <label
                                    key={t}
                                    className={cn(
                                        'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
                                        data.type === t
                                            ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560] font-medium'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300',
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="type"
                                        value={t}
                                        checked={data.type === t}
                                        onChange={() => setData('type', t)}
                                        className="hidden"
                                    />
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="First Name" name="first_name" required placeholder="e.g. Rahim" data={data} setData={setData} errors={errors} />
                        <Field label="Last Name" name="last_name" placeholder="e.g. Hossain" data={data} setData={setData} errors={errors} />
                    </div>

                    <Field label="Phone" name="phone" type="tel" required placeholder="e.g. 01700000000" data={data} setData={setData} errors={errors} />

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Division" name="state" required placeholder="e.g. Dhaka" data={data} setData={setData} errors={errors} />
                        <Field label="District" name="city" required placeholder="e.g. Gazipur" data={data} setData={setData} errors={errors} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Upazilla" name="upazilla" placeholder="e.g. Savar" data={data} setData={setData} errors={errors} />
                        <Field label="Village / Area" name="village" placeholder="e.g. Mirpur" data={data} setData={setData} errors={errors} />
                    </div>

                    <Field label="Full Address" name="address" required placeholder="House, Road, Block..." data={data} setData={setData} errors={errors} />

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="ZIP / Postal Code" name="zip" placeholder="e.g. 1216" data={data} setData={setData} errors={errors} />
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Country</label>
                            <input
                                type="text"
                                value="Bangladesh"
                                readOnly
                                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                            />
                        </div>
                    </div>

                    <label className="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={data.is_default}
                            onChange={(e) => setData('is_default', e.target.checked)}
                            className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560]"
                        />
                        <span className="text-sm text-gray-700">Set as default address</span>
                    </label>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={processing}>Cancel</Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="border-0 bg-[#e94560] text-white hover:bg-[#c73652]"
                        >
                            {processing ? 'Saving…' : editAddress ? 'Update Address' : 'Save Address'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function AddressesPage({ addresses }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editAddress, setEditAddress] = useState<Address | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    function openAdd() {
        setEditAddress(null);
        setModalOpen(true);
    }

    function openEdit(addr: Address) {
        setEditAddress(addr);
        setModalOpen(true);
    }

    function handleDelete(addr: Address) {
        if (!confirm(`Delete this ${addr.type} address?`)) return;
        setDeletingId(addr.id);
        router.delete(`/addresses/${addr.id}`, {
            onFinish: () => setDeletingId(null),
        });
    }

    return (
        <ShopLayout>
            <Head title="Saved Addresses — CartAndBuy" />
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage your delivery and billing addresses.</p>
                    </div>
                    <Button onClick={openAdd} className="gap-2 border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                        <Plus className="size-4" />
                        Add Address
                    </Button>
                </div>

                {addresses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 py-20 text-center">
                        <MapPin className="mx-auto mb-4 size-12 text-gray-200" />
                        <p className="font-medium text-gray-500">No addresses saved yet.</p>
                        <p className="mt-1 text-sm text-gray-400">Add your first address to speed up checkout.</p>
                        <Button onClick={openAdd} className="mt-6 gap-2 border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                            <Plus className="size-4" />
                            Add Address
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.map((addr) => (
                            <div
                                key={addr.id}
                                className={cn(
                                    'relative rounded-xl border bg-white p-5 transition-shadow hover:shadow-sm',
                                    addr.is_default ? 'border-[#e94560]' : 'border-gray-100',
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className={cn('mt-0.5 rounded-lg p-2', addr.is_default ? 'bg-[#e94560]/10 text-[#e94560]' : 'bg-gray-100 text-gray-500')}>
                                            <MapPin className="size-4" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-gray-900">
                                                    {addr.first_name} {addr.last_name}
                                                </p>
                                                <Badge className={cn('border-0 text-xs capitalize', addr.type === 'shipping' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700')}>
                                                    {addr.type}
                                                </Badge>
                                                {addr.is_default && (
                                                    <Badge className="border-0 bg-[#e94560]/10 text-[#e94560] text-xs gap-1">
                                                        <Star className="size-3 fill-current" />
                                                        Default
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">{addr.phone}</p>
                                            <p className="mt-0.5 text-sm text-gray-600">{addr.address}</p>
                                            <p className="text-sm text-gray-500">
                                                {[addr.upazilla, addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}
                                            </p>
                                            <p className="text-sm text-gray-500">{addr.country}</p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEdit(addr)}
                                            className="gap-1.5 text-gray-600"
                                        >
                                            <Pencil className="size-3.5" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(addr)}
                                            disabled={deletingId === addr.id}
                                            className="gap-1.5 text-red-500 hover:border-red-200 hover:bg-red-50"
                                        >
                                            <Trash2 className="size-3.5" />
                                            {deletingId === addr.id ? '…' : 'Delete'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AddressFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                editAddress={editAddress}
            />
        </ShopLayout>
    );
}
