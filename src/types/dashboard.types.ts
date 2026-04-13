export interface NavItem {
    label: string;
    href: string;
    icon: string;
    badge?: string;
}

export interface NavSection {
    title: string;
    items: NavItem[];
}