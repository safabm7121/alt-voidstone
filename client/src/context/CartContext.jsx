import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const getInitialState = () => {
  try {
    const saved = localStorage.getItem('cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.items && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch (e) {}
  return { items: [] };
};

const cartReducer = (state, action) => {
  if (!state || !state.items) return { items: [] };

  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find(i => i._id === action.payload._id);
      if (existing) {
        return {
          items: state.items.map(i =>
            i._id === action.payload._id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        };
      }
      return { items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE':
      return { items: state.items.filter(i => i._id !== action.payload) };
    case 'UPDATE_QTY':
      return {
        items: state.items.map(i =>
          i._id === action.payload._id
            ? { ...i, quantity: action.payload.quantity }
            : i
        )
      };
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, null, getInitialState);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const items = Array.isArray(state?.items) ? state.items : [];
  const cartTotal = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0);
  const cartCount = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

  const addToCart = (product) => dispatch({ type: 'ADD', payload: product });
  const removeFromCart = (id) => dispatch({ type: 'REMOVE', payload: id });
  const updateQuantity = (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { _id: id, quantity: qty } });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  return (
    <CartContext.Provider value={{
      cart: items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};