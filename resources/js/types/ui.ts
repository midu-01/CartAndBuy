import type { ReactNode } from 'react';
import type { Auth } from '@/types/auth';
import type { Team } from '@/types/teams';
import type { BreadcrumbItem } from '@/types/navigation';

export type AppLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export type AppVariant = 'header' | 'sidebar';

export type FlashToast = {
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
};

export type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
};

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    currentTeam: Team | null;
    teams: Team[];
    [key: string]: unknown;
};
