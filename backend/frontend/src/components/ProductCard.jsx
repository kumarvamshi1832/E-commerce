import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./ProductCard.css";

function ProductCard({ product }) {
  const {
    cart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const [isWishlisted, setIsWishlisted] = useState(false);

  const cartItem = cart.find(
    (item) => item.id === product.id
  );

  const quantity = cartItem ? cartItem.quantity : 0;

  // Check wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      const user = localStorage.getItem("user");

      if (!user) {
        setIsWishlisted(false);
        return;
      }

      try {
        const response = await api.get("wishlist/");

        const exists = response.data.some(
          (item) => item.id === product.id
        );

        setIsWishlisted(exists);
      } catch (error) {
        console.error("Wishlist check error:", error);
      }
    };

    checkWishlist();
  }, [product.id]);

  // Add to cart
  const handleAddToCart = () => {
    const user = localStorage.getItem("user");

    if (!user) {
      alert("Please login first to add items to cart.");
      return;
    }

    if (product.stock <= 0) {
      return;
    }

    addToCart(product);
  };

  // Add / Remove wishlist
  const handleWishlist = async () => {
    const user = localStorage.getItem("user");

    if (!user) {
      alert("Please login first to use wishlist.");
      return;
    }

    try {
      if (isWishlisted) {
        await api.delete(
          `wishlist/remove/${product.id}/`
        );

        setIsWishlisted(false);
      } else {
        await api.post(
          `wishlist/add/${product.id}/`
        );

        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Wishlist error:", error);

      if (error.response?.status === 401) {
        alert("Please login first.");
      }
    }
  };

  return (
    <article className="product-card">

      {/* PRODUCT IMAGE */}
      <div className="product-image-wrapper">

        <Link to={`/product/${product.id}`}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
          ) : (
            <div className="no-image">
              No Image
            </div>
          )}
        </Link>

        {/* WISHLIST HEART */}
        <button
          type="button"
          className={`product-wishlist ${
            isWishlisted ? "wishlisted" : ""
          }`}
          onClick={handleWishlist}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          {isWishlisted ? "♥" : "♡"}
        </button>

      </div>

      {/* PRODUCT DETAILS */}
      <div className="product-details">

        <p className="product-category">
          {product.category}
        </p>

        <Link
          to={`/product/${product.id}`}
          className="product-title-link"
        >
          <h3>{product.name}</h3>
        </Link>

        <p className="product-description">
          {product.description}
        </p>

        <div className="product-bottom">

          <div>
            <strong className="price">
              ₹{Number(product.price).toFixed(2)}
            </strong>

            <span className="price-unit">
              /kg
            </span>

            <br />

            {product.stock > 0 ? (
              <span className="stock">
                In Stock
              </span>
            ) : (
              <span className="out-stock">
                Out of Stock
              </span>
            )}
          </div>

          {/* CART */}
          {quantity === 0 ? (
            <button
              className="add-cart"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              🛒
            </button>
          ) : (
            <div className="quantity-control">

              <button
                type="button"
                onClick={() =>
                  decreaseQuantity(product.id)
                }
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                disabled={quantity >= product.stock}
                onClick={() =>
                  increaseQuantity(product.id)
                }
              >
                +
              </button>

            </div>
          )}

        </div>
      </div>
    </article>
  );
}

export default ProductCard;
