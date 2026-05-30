export interface AiProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    image: string | null;
    category: string | null;
    rating: number | null;
    review_count: number;
    in_stock: boolean;
    stock_qty: number;
    description: string | null;
    is_featured: boolean;
}

export interface AiCartItem {
    id: number;
    product_id: number;
    name: string;
    slug: string;
    image: string | null;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface AiCart {
    items: AiCartItem[];
    total: number;
    formatted_total: string;
    item_count: number;
    is_empty: boolean;
    free_shipping_threshold: number;
    amount_to_free_shipping: number;
    has_free_shipping: boolean;
}

export interface QuickAction {
    label: string;
    action: 'link' | 'quick';
    url?: string;
    message?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    type: 'text' | 'products' | 'cart' | 'coupons' | 'error';
    products?: AiProduct[];
    cart?: AiCart;
    coupons?: AiCoupon[];
    actions?: QuickAction[];
    timestamp: Date;
}

export interface AiCoupon {
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    discount_label: string;
    min_order: number | null;
    max_discount: number | null;
    expires_at: string | null;
}

export interface AiApiResponse {
    message: string;
    type: 'text' | 'products' | 'cart' | 'coupons' | 'error';
    products?: AiProduct[];
    cart?: AiCart;
    coupons?: AiCoupon[];
    actions?: QuickAction[];
    search_params?: Record<string, unknown>;
}
