import { Form, Head, router, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { Download } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

interface NotificationPrefs {
    order_updates: boolean;
    promotions: boolean;
    ticket_replies: boolean;
    newsletter: boolean;
}

type PageProps = {
    auth: Auth & { user: { notification_preferences?: NotificationPrefs } };
};

const NOTIF_ITEMS: { key: keyof NotificationPrefs; label: string; desc: string }[] = [
    { key: 'order_updates', label: 'Order Updates', desc: 'Shipping, delivery, and status changes' },
    { key: 'promotions', label: 'Promotions', desc: 'Sales, coupons, and limited-time offers' },
    { key: 'ticket_replies', label: 'Ticket Replies', desc: 'When our team replies to your support tickets' },
    { key: 'newsletter', label: 'Newsletter', desc: 'Product news and store updates' },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    const defaultPrefs: NotificationPrefs = {
        order_updates: true,
        promotions: true,
        ticket_replies: true,
        newsletter: false,
        ...((auth.user.notification_preferences ?? {}) as Partial<NotificationPrefs>),
    };

    const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
    const [savingPrefs, setSavingPrefs] = useState(false);

    function togglePref(key: keyof NotificationPrefs) {
        setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    function savePrefs() {
        setSavingPrefs(true);
        router.patch('/account/notifications', prefs, {
            preserveScroll: true,
            onFinish: () => setSavingPrefs(false),
        });
    }

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your name and email address"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to re-send the
                                                verification email.
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been
                                                sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    Save
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <Separator />

            {/* Notification Preferences */}
            <div className="space-y-4">
                <Heading
                    variant="small"
                    title="Notification Preferences"
                    description="Choose which emails you'd like to receive"
                />
                <div className="space-y-3">
                    {NOTIF_ITEMS.map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <p className="text-sm font-medium">{label}</p>
                                <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => togglePref(key)}
                                className={cn(
                                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                                    prefs[key] ? 'bg-primary' : 'bg-muted',
                                )}
                            >
                                <span className={cn(
                                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200',
                                    prefs[key] ? 'translate-x-4' : 'translate-x-0',
                                )} />
                            </button>
                        </div>
                    ))}
                </div>
                <Button onClick={savePrefs} disabled={savingPrefs} variant="outline">
                    {savingPrefs ? 'Saving…' : 'Save Preferences'}
                </Button>
            </div>

            <Separator />

            {/* Download Personal Data */}
            <div className="space-y-4">
                <Heading
                    variant="small"
                    title="Your Data"
                    description="Download a copy of all your account data"
                />
                <a href="/account/data/download">
                    <Button variant="outline" className="gap-2">
                        <Download className="size-4" />
                        Download My Data
                    </Button>
                </a>
            </div>

            <Separator />

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
