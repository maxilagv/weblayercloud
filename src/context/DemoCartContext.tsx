import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { TenantProduct } from '../hooks/useTenantProducts';

export interface CartItem {
  product: TenantProduct;
  quantity: number;
}

type CartAction =
  | { type: 'ADD'; product: TenantProduct; quantity?: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR' };

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  addToCart: (product: TenantProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function cartReducer(
  state: { items: CartItem[] },
  action: CartAction,
): { items: CartItem[] } {
  switch (action.type) {
    case 'ADD': {
      const qty = action.quantity ?? 1;
      const max = action.product.stockActual || 99;
      const existing = state.items.find(i => i.product.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map(i =>
            i.product.id === action.product.id
              ? { ...i, quantity: Math.min(i.quantity + qty, max) }
              : i,
          ),
        };
      }
      return {
        items: [...state.items, { product: action.product, quantity: Math.min(qty, max) }],
      };
    }
    case 'REMOVE':
      return { items: state.items.filter(i => i.product.id !== action.productId) };
    case 'UPDATE_QTY':
      if (action.quantity <= 0) {
        return { items: state.items.filter(i => i.product.id !== action.productId) };
      }
      return {
        items: state.items.map(i =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i,
        ),
      };
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

export function DemoCartProvider({
  tenantId,
  children,
}: {
  tenantId: string;
  children: ReactNode;
}) {
  const storageKey = `demo_cart_${tenantId}`;

  const [state, dispatch] = useReducer(cartReducer, { items: [] }, () => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : { items: [] };
    } catch {
      return { items: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const total     = state.items.reduce((sum, i) => sum + i.product.precio * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        total,
        addToCart:      (p, q) => dispatch({ type: 'ADD', product: p, quantity: q }),
        removeFromCart: id     => dispatch({ type: 'REMOVE', productId: id }),
        updateQty:      (id, q) => dispatch({ type: 'UPDATE_QTY', productId: id, quantity: q }),
        clearCart:      ()     => dispatch({ type: 'CLEAR' }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside <DemoCartProvider>');
  return ctx;
}
