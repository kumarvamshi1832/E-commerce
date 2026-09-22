import { createContext, useContext, useEffect, useState } from "react";
import { getWishlist } from "../services/api";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistCount, setWishlistCount] = useState(0);

  const loadWishlistCount = async () => {
    const user = localStorage.getItem("user");

    if (!user) {
      setWishlistCount(0);
      return;
    }

    try {
      const response = await getWishlist();

      setWishlistCount(response.data.length);
    } catch (error) {
      console.log("Wishlist count error:", error);
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    loadWishlistCount();
  }, []);

  const increaseWishlistCount = () => {
    setWishlistCount((count) => count + 1);
  };

  const decreaseWishlistCount = () => {
    setWishlistCount((count) => (count > 0 ? count - 1 : 0));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistCount,
        loadWishlistCount,
        increaseWishlistCount,
        decreaseWishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}