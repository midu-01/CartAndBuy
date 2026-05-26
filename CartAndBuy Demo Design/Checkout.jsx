import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Checkout() {
    const { cart, total, dispatch } = useCart();
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Format payload mapping cart context to backend schema
        const payload = {
            items: cart.items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
            shipping_address: address,
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    // Note: Ensure token is retrieved from your Auth context/state
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}` 
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to complete checkout.');
            }

            setSuccess(true);
            dispatch({ type: 'CLEAR_CART' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return <div className="p-12 text-center text-2xl font-serif text-green-700">Order Confirmed! Thank you for your purchase.</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-lg shadow">
            <h1 className="text-3xl font-serif mb-6 border-b pb-4">Secure Checkout</h1>
            
            {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded">{error}</div>}

            <div className="mb-6">
                <h2 className="text-lg font-medium mb-3">Order Summary</h2>
                <ul className="divide-y text-sm text-gray-600">
                    {cart.items.map(item => (
                        <li key={item.id} className="py-2 flex justify-between">
                            <span>{item.name} × {item.quantity}</span>
                            <span>${((item.sale_price ?? item.price) * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 text-right text-lg font-bold border-t pt-4">Total: ${total.toFixed(2)}</div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                    <textarea required rows="3" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-black focus:ring-black" placeholder="123 Main St..." />
                </div>
                <button type="submit" disabled={loading || cart.items.length === 0} className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-opacity">
                    {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                </button>
            </form>
        </div>
    );
}