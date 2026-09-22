import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import api from "../services/api";
import "./Wishlist.css";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart, buyNow, cart } = useCart();

  const {
    decreaseWishlistCount,
  } = useWishlist();

  const navigate = useNavigate();

  const vegetables = [
    "🥕", "🥦", "🍅", "🥬", "🫑",
    "🥒", "🌽", "🍆", "🧅", "🥔",
    "🍎", "🍏", "🍋", "🍊", "🥝",
    "🍐", "🍓", "🍇", "🍉", "🍌",
    "🥕", "🥦", "🍅", "🥬", "🫑",
    "🥒", "🌽", "🍆", "🧅", "🥔",
    "🍎", "🍋", "🍊", "🥝", "🍐",
    "🍓", "🍇", "🍉", "🍌", "🥕",
    "🥦", "🍅", "🥬", "🫑", "🥒",
    "🌽", "🍆", "🧅", "🥔", "🍎"
  ];

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "wishlist/"
      );

      setWishlist(response.data);
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (
    productId
  ) => {
    try {
      await api.delete(
        `wishlist/remove/${productId}/`
      );

      setWishlist((currentWishlist) =>
        currentWishlist.filter(
          (item) => item.id !== productId
        )
      );

      decreaseWishlistCount();
    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error
      );
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleBuyNow = (product) => {
    buyNow(product);
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="wishlist-page">

        <div className="floating-groceries">
          {vegetables.map(
            (vegetable, index) => (
              <span
                key={index}
                className="floating-grocery"
              >
                {vegetable}
              </span>
            )
          )}
        </div>

        <div className="wishlist-loading">

          <div className="wishlist-loading-icon">
            ❤️
          </div>

          <h2>
            Loading wishlist...
          </h2>

          <p>
            Getting your favourite products ready
          </p>

        </div>

      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">

        <div className="floating-groceries">
          {vegetables.map(
            (vegetable, index) => (
              <span
                key={index}
                className="floating-grocery"
              >
                {vegetable}
              </span>
            )
          )}
        </div>

        <div className="wishlist-empty">

          <div className="wishlist-empty-icon">
            ❤️
          </div>

          <p className="wishlist-eyebrow">
            YOUR FAVOURITES
          </p>

          <h1>
            Your wishlist is empty
          </h1>

          <p>
            Add some products you love and
            keep them here for later.
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

  return (
    <div className="wishlist-page">

      <div className="floating-groceries">
        {vegetables.map(
          (vegetable, index) => (
            <span
              key={index}
              className="floating-grocery"
            >
              {vegetable}
            </span>
          )
        )}
      </div>

      <div className="wishlist-container">

        <div className="wishlist-header">

          <div>

            <p className="wishlist-eyebrow">
              YOUR FAVOURITES
            </p>

            <h1>
              ❤️ Wishlist
            </h1>

            <p className="wishlist-count">
              {wishlist.length} item
              {wishlist.length !== 1
                ? "s"
                : ""}{" "}
              saved for later
            </p>

          </div>

          <button
            className="wishlist-shop-button"
            onClick={() =>
              navigate("/products")
            }
          >
            Continue Shopping →
          </button>

        </div>

        <div className="wishlist-grid">

          {wishlist.map((product) => {

            const cartItem = cart.find(
              (item) =>
                item.id === product.id
            );

            return (
              <div
                className="wishlist-card"
                key={product.id}
              >

                <div className="wishlist-image">

                  <div className="wishlist-heart-badge">
                    ❤️
                  </div>

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

                <div className="wishlist-details">

                  <div className="wishlist-product-category">
                    FRESH PICK
                  </div>

                  <h2>
                    {product.name}
                  </h2>

                  <p className="wishlist-price">
                    ₹
                    {Number(
                      product.price
                    ).toFixed(2)}
                  </p>

                  <p className="wishlist-description">
                    {product.description}
                  </p>

                  <p className="wishlist-stock">

                    {product.stock > 0
                      ? `✓ In stock: ${product.stock}`
                      : "✕ Out of stock"}

                  </p>

                  <div className="wishlist-actions">

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