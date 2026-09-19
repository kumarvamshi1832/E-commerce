import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import "./Wishlist.css";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart, buyNow, cart } = useCart();
  const navigate = useNavigate();

  // =========================
  // GET WISHLIST
  // =========================

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const response = await api.get("wishlist/");

      setWishlist(response.data);

    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // =========================
  // REMOVE FROM WISHLIST
  // =========================

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(
        `wishlist/remove/${productId}/`
      );

      // Remove immediately from UI
      setWishlist((currentWishlist) =>
        currentWishlist.filter(
          (item) => item.id !== productId
        )
      );

    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error
      );
    }
  };

  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  // =========================
  // BUY NOW
  // =========================

  const handleBuyNow = (product) => {
  buyNow(product);
  navigate("/checkout");
};
  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="wishlist-page">
        <h2>Loading wishlist...</h2>
      </div>
    );
  }

  // =========================
  // EMPTY WISHLIST
  // =========================

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">

        <h1>❤️ Wishlist</h1>

        <div className="wishlist-empty">

          <h2>
            Your wishlist is empty
          </h2>

          <p>
            Add some products you love!
          </p>

          <button
            onClick={() =>
              navigate("/products")
            }
          >
            Continue Shopping
          </button>

        </div>

      </div>
    );
  }

  // =========================
  // WISHLIST UI
  // =========================

  return (
    <div className="wishlist-page">

      <div className="wishlist-container">

        <h1>
          ❤️ Wishlist
        </h1>

        <p className="wishlist-count">
          {wishlist.length} item
          {wishlist.length !== 1
            ? "s"
            : ""}{" "}
          in your wishlist
        </p>

        <div className="wishlist-grid">

          {wishlist.map((product) => {

            const cartItem = cart.find(
              (item) => item.id === product.id
            );

            return (
              <div
                className="wishlist-card"
                key={product.id}
              >

                {/* IMAGE */}

                <div className="wishlist-image">

                  {product.image ? (

                    <img
                      src={product.image}
                      alt={product.name}
                    />

                  ) : (

                    <span>
                      🛍️
                    </span>

                  )}

                </div>

                {/* DETAILS */}

                <div className="wishlist-details">

                  <h2>
                    {product.name}
                  </h2>

                  <p className="wishlist-price">
                    ₹
                    {Number(
                      product.price
                    ).toFixed(2)}
                  </p>

                  <p>
                    {product.description}
                  </p>

                  <p className="wishlist-stock">

                    {product.stock > 0
                      ? `In stock: ${product.stock}`
                      : "Out of stock"}

                  </p>

                  {/* BUTTONS */}

                  <div className="wishlist-actions">

                    {/* ADD TO CART */}

                    <button
                      onClick={() =>
                        handleAddToCart(
                          product
                        )
                      }
                      disabled={
                        product.stock <= 0
                      }
                      className="add-cart-btn"
                    >
                      {cartItem
                        ? "Add Again"
                        : "Add to Cart"}
                    </button>

                    {/* REMOVE */}

                    <button
                      onClick={() =>
                        removeFromWishlist(
                          product.id
                        )
                      }
                      className="remove-btn"
                    >
                      Remove
                    </button>

                    {/* BUY NOW */}

                    <button
                      onClick={() =>
                        handleBuyNow(
                          product
                        )
                      }
                      disabled={
                        product.stock <= 0
                      }
                      className="buy-now-btn"
                    >
                      Buy Now
                    </button>

                  </div>

                </div>

              </div>
            );

          })}

        </div>

      </div>

    </div>
  );
}

export default Wishlist;