import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [carts, setCarts] = useState([]);
    const [cartItemCount, setCartItemCount] = useState(0);

    const addToCart = (item) => {
        setCarts([...carts, item]);
        setCartItemCount(cartItemCount + 1);
    };

    const updateCartItemQuantity = (cartItemId, quantity) => {
        setCarts(current => current.map(cartItem =>
        cartItem.id === cartItemId ? { ...cartItem, quantity: quantity } : cartItem
    ));
    };

    const deleteCartItem = (cartItemId) => {
        setCarts(current => current.filter(cartItem => cartItem.id !== cartItemId));
        setCartItemCount(cartItemCount - 1);
    };

    return (
        <CartContext.Provider value={{ carts, cartItemCount, addToCart, updateCartItemQuantity, deleteCartItem, setCarts }}>
        {children}
        </CartContext.Provider>
    );
};
