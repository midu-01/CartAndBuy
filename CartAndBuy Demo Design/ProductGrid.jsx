import React from 'react';
import { useCart } from '../context/CartContext';

export default function ProductGrid({ products }) {
    const { dispatch } = useCart();

    const handleAddToCart = (product) => {
        dispatch({ type: 'ADD_ITEM', payload: { ...product, quantity: 1 } });
    };

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 p-6 mx-auto max-w-7xl">
            {products.map((product) => (
                <div 
                    key={product.id} 
                    className="group flex flex-col bg-white overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 ease-out"
                >
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                        {/* Using lazy loading for performance */}
                        <img 
                            src={product.image_url || '/placeholder.png'} 
                            alt={product.name} 
                            loading="lazy"
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-in-out" 
                        />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-lg font-medium text-gray-900 font-serif">{product.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                        <div className="mt-auto pt-4 flex items-center justify-between">
                            <span className="text-lg font-semibold tracking-tight text-gray-900">
                                ${product.sale_price ?? product.price}
                            </span>
                            <button onClick={() => handleAddToCart(product)} className="px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-black">
                                Add to Bag
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}