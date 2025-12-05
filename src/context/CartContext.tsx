'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
  stock: number;
  talla?: string | null;
  color?: string | null;
  varianteId?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string, talla?: string | null, color?: string | null) => void;
  updateQuantity: (id: string, cantidad: number, talla?: string | null, color?: string | null) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = async (item: CartItem) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        i => i.id === item.id && i.talla === item.talla && i.color === item.color
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        
        // Verificar stock
        if (existingItem.cantidad + item.cantidad > existingItem.stock) {
          throw new Error(`Solo quedan ${existingItem.stock} unidades disponibles`);
        }
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          cantidad: existingItem.cantidad + item.cantidad,
        };
        return updatedItems;
      } else {
        // Verificar stock para nuevo item
        if (item.cantidad > item.stock) {
          throw new Error(`Solo quedan ${item.stock} unidades disponibles`);
        }
        
        return [...prevItems, item];
      }
    });
  };

  const removeFromCart = (id: string, talla?: string | null, color?: string | null) => {
    setItems(prevItems =>
      prevItems.filter(
        item => !(item.id === id && item.talla === talla && item.color === color)
      )
    );
  };

  const updateQuantity = (id: string, cantidad: number, talla?: string | null, color?: string | null) => {
    if (cantidad <= 0) {
      removeFromCart(id, talla, color);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id && item.talla === talla && item.color === color) {
          if (cantidad > item.stock) {
            throw new Error(`Solo quedan ${item.stock} unidades disponibles`);
          }
          return { ...item, cantidad };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + item.precio * item.cantidad, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.cantidad, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}