import { createContext, useContext, useRef, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState("");

  const toastTimer = useRef(null);

  // =========================
  // SHOW TOAST
  // =========================

  const showToast = (message) => {
    setToast(message);

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    toastTimer.current = setTimeout(() => {
      setToast("");
    }, 2000);
  };

  // =========================
  // ADD TO CART
  // =========================

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.id === product.id
      );

      // Product already exists
      if (existingProduct) {

        // Stock limit
        if (existingProduct.quantity >= product.stock) {
          showToast(
            `⚠️ Stock limit reached! Only ${product.stock} available.`
          );

          return currentCart;
        }

        // Increase quantity
        showToast(
          `🛒 ${product.name} added to cart`
        );

        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      // Out of stock
      if (product.stock <= 0) {
        showToast(
          `⚠️ ${product.name} is out of stock`
        );

        return currentCart;
      }

      // Add new product
      showToast(
        `🛒 ${product.name} added to cart`
      );

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  // =========================
  // BUY NOW
  // =========================

  const buyNow = (product) => {

    // Out of stock
    if (product.stock <= 0) {
      showToast(
        `⚠️ ${product.name} is out of stock`
      );

      return;
    }

    // Replace entire cart
    // with only this product
    setCart([
      {
        ...product,
        quantity: 1,
      },
    ]);

    showToast(
      `⚡ Buying ${product.name} now`
    );
  };

  // =========================
  // INCREASE QUANTITY
  // =========================

  const increaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart.map((item) => {

        if (item.id !== productId) {
          return item;
        }

        // Stock limit
        if (item.quantity >= item.stock) {
          showToast(
            `⚠️ Stock limit reached! Only ${item.stock} available.`
          );

          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  };

  // =========================
  // DECREASE QUANTITY
  // =========================

  const decreaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  };

  // =========================
  // CLEAR CART
  // =========================

  const clearCart = () => {
    setCart([]);
  };

  // =========================
  // CART COUNT
  // =========================

  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  // =========================
  // PROVIDER
  // =========================

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        buyNow,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        cartCount,
      }}
    >
      {children}

      {/* =========================
          TOAST MESSAGE
      ========================= */}

      {toast && (
        <div className="cart-toast">
          {toast}
        </div>
      )}
    </CartContext.Provider>
  );
}

// =========================
// USE CART
// =========================

export function useCart() {
  return useContext(CartContext);
}