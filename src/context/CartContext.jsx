import { createContext, useState, useEffect, useContext } from "react";
import AuthContext from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get user-specific storage key
  const getCartKey = () => {
    if (user && user.id) {
      return `biteful_cart_${user.id}`;
    }
    return "biteful_cart_guest";
  };

  // Load cart items when user changes
  useEffect(() => {
    const key = getCartKey();
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filter out invalid items (like those with string IDs if we expect numbers)
        const validItems = parsed.filter(item => typeof item.id === 'number');
        setCartItems(validItems);
      } catch (e) {
        console.error("Error parsing cart from localStorage:", e);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
    setIsInitialized(true);
  }, [user?.id]);

  // Save cart items when they change
  useEffect(() => {
    if (isInitialized) {
      const key = getCartKey();
      localStorage.setItem(key, JSON.stringify(cartItems));
    }
  }, [cartItems, user?.id, isInitialized]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const extraCharges = {
    gst: 7,
    serviceCharge: 8,
    total: 15
  };

  const total = subtotal > 0 ? subtotal + extraCharges.total : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        extraCharges,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
