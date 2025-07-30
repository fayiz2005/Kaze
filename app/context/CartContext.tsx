'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type CartItem = {
  id: string;            // product id
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image: string;
  variantId?: string;    // optional variant id
  sizeValue?: string;    // optional variant size string
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, variantId?: string) => void;
  increaseQuantity: (id: string, variantId?: string) => void;
  decreaseQuantity: (id: string, variantId?: string) => void;
  clearCart: () => void;
  category: string;
  setCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
};

const CART_STORAGE_KEY = 'cart_with_expiry';
const EXPIRY_TIME_MS = 60 * 60 * 1000;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const clearCart = () => setCart([]);

  useEffect(() => {
    const storedData = localStorage.getItem(CART_STORAGE_KEY);
    if (storedData) {
      try {
        const { cart: savedCart, timestamp } = JSON.parse(storedData);
        if (Date.now() - timestamp < EXPIRY_TIME_MS) {
          setCart(savedCart);
        } else {
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const data = { cart, timestamp: Date.now() };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
  }, [cart]);

const addToCart = (productToAdd: CartItem) => {
  setCart((prev) => {
    const existing = prev.find(
      (item) =>
        item.id === productToAdd.id &&
        item.variantId === productToAdd.variantId // compare variant too
    );
    if (existing) {
      return prev.map((item) =>
        item.id === productToAdd.id && item.variantId === productToAdd.variantId
          ? {
              ...item,
              quantity: Math.min(item.quantity + productToAdd.quantity, item.stock),
            }
          : item
      );
    }
    return [...prev, productToAdd];
  });
};


const removeFromCart = (id: string, variantId?: string) => {
  setCart((prev) =>
    prev.filter((item) =>
      variantId ? !(item.id === id && item.variantId === variantId) : item.id !== id
    )
  );
};

const increaseQuantity = (id: string, variantId?: string) => {
  setCart((prev) =>
    prev.map((item) =>
      item.id === id && item.variantId === variantId
        ? { ...item, quantity: Math.min(item.quantity + 1, item.stock, 10) }
        : item
    )
  );
};


const decreaseQuantity = (id: string, variantId?: string) => {
  setCart((prev) =>
    prev.map((item) =>
      item.id === id && item.variantId === variantId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    )
  );
};



  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        category,
        setCategory,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
