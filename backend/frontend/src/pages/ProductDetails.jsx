import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import "./ProductDetails.css";

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
  "🌽", "🍆", "🧅", "🥔", "🍎",
];

function ProductDetails() {
  const { id } = useParams();

  const {
    addToCart,
    cartItems,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");

    api
      .get(`products/${id}/`)
      .then((response) => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading product:", error);
        setError("Unable to load this product.");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    setReviewsLoading(true);

    api
      .get(`products/${id}/reviews/`)
      .then((response) => {
        setReviews(response.data.reviews || []);
      })
      .catch((error) => {
        console.error("Error loading reviews:", error);
        setReviews([]);
      })
      .finally(() => {
        setReviewsLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main className="product-details-page">
        <div className="floating-groceries">
          {vegetables.map((vegetable, index) => (
            <span
              key={index}
              className="floating-grocery"
              style={{
                left: `${(index * 17) % 96}%`,
                top: `${(index * 23) % 94}%`,
                animationDelay: `${-(index * 0.9)}s`,
                animationDuration: `${32 + (index % 8) * 2}s`,
              }}
            >
              {vegetable}
            </span>
          ))}
        </div>

        <div className="product-details-status-card">
          <div className="loading-spinner"></div>
          <p>Loading fresh product...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-details-page">
        <div className="floating-groceries">
          {vegetables.map((vegetable, index) => (
            <span
              key={index}
              className="floating-grocery"
              style={{
                left: `${(index * 17) % 96}%`,
                top: `${(index * 23) % 94}%`,
                animationDelay: `${-(index * 0.9)}s`,
                animationDuration: `${32 + (index % 8) * 2}s`,
              }}
            >
              {vegetable}
            </span>
          ))}
        </div>

        <div className="product-details-status-card error-card">
          <div className="status-icon">🥕</div>
          <p className="status-eyebrow">PRODUCT UNAVAILABLE</p>
          <h2>Product not found</h2>
          <p>{error}</p>

          <Link
            to="/products"
            className="back-products-button"
          >
            ← Back to Products
          </Link>
        </div>
      </main>
    );
  }

  const cartItem = cartItems?.find(
    (item) => item.id === product.id
  );

  const quantity = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = product.stock <= 0;

  const isLowStock =
    product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product);
    }
  };

  return (
    <main className="product-details-page">

      <div className="floating-groceries">
        {vegetables.map((vegetable, index) => (
          <span
            key={index}
            className="floating-grocery"
            style={{
              left: `${(index * 17) % 96}%`,
              top: `${(index * 23) % 94}%`,
              animationDelay: `${-(index * 0.9)}s`,
              animationDuration: `${32 + (index % 8) * 2}s`,
            }}
          >
            {vegetable}
          </span>
        ))}
      </div>

      <div className="product-details-container">

        <Link
          to="/products"
          className="product-back-link"
        >
          ← Back to Products
        </Link>

        <div className="product-details-card">

          <div className="product-details-image-section">

            <div className="image-badge">
              FRESH PICK
            </div>

            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="product-details-image"
              />
            ) : (
              <div className="product-details-image-placeholder">
                🛒
              </div>
            )}

            {isOutOfStock && (
              <span className="details-stock-badge">
                OUT OF STOCK
              </span>
            )}

          </div>

          <div className="product-details-info">

            <div className="details-top-label">
              FRESH • LOCAL • QUALITY
            </div>

            <span className="product-details-category">
              {product.category}
            </span>

            <h1>{product.name}</h1>

            <div className="product-details-rating">

              {product.rating_count > 0 ? (
                <>
                  <span className="details-rating-stars">
                    {"★".repeat(
                      Math.round(product.average_rating)
                    )}
                  </span>

                  <span className="details-rating-value">
                    {Number(product.average_rating).toFixed(1)}
                  </span>

                  <button
                    type="button"
                    className="details-reviews-button"
                    onClick={() => setShowReviews(true)}
                  >
                    ({product.rating_count}) Reviews
                  </button>
                </>
              ) : (
                <span className="details-no-rating">
                  No ratings yet
                </span>
              )}

            </div>

            <div className="product-details-price-row">
              <div className="product-details-price">
                ₹{Number(product.price).toFixed(2)}
              </div>

              <span className="details-price-unit">
                / kg
              </span>
            </div>

            <p className="product-details-description">
              {product.description}
            </p>

            <div className="product-stock">

              {isOutOfStock ? (
                <span className="out-stock">
                  ● Out of stock
                </span>
              ) : isLowStock ? (
                <span className="low-stock">
                  ● Only {product.stock} left
                </span>
              ) : (
                <span className="in-stock">
                  ● In stock
                </span>
              )}

            </div>

            <div className="details-purchase-section">

              {quantity > 0 ? (
                <div className="details-cart-control">

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
                    onClick={() => {
                      if (quantity < product.stock) {
                        increaseQuantity(product.id);
                      }
                    }}
                  >
                    +
                  </button>

                </div>
              ) : (
                <button
                  type="button"
                  className="details-add-cart"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  <span>🛒</span>

                  {isOutOfStock
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>
              )}

            </div>

            <div className="product-details-features">

              <div className="details-feature">

                <div className="feature-icon">
                  🚚
                </div>

                <span>
                  <strong>Fast Delivery</strong>
                  <small>
                    Delivered to your door
                  </small>
                </span>

              </div>

              <div className="details-feature">

                <div className="feature-icon">
                  ✓
                </div>

                <span>
                  <strong>Quality Guaranteed</strong>
                  <small>
                    Fresh and carefully selected
                  </small>
                </span>

              </div>

              <div className="details-feature">

                <div className="feature-icon">
                  🔒
                </div>

                <span>
                  <strong>Secure Shopping</strong>
                  <small>
                    Your information is protected
                  </small>
                </span>

              </div>

            </div>

          </div>
        </div>
      </div>

      {showReviews && (
        <div
          className="reviews-modal-overlay"
          onClick={() => setShowReviews(false)}
        >

          <div
            className="reviews-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="reviews-modal-close"
              onClick={() => setShowReviews(false)}
            >
              ×
            </button>

            <p className="reviews-modal-eyebrow">
              CUSTOMER FEEDBACK
            </p>

            <h2>Customer Reviews</h2>

            {reviewsLoading ? (
              <div className="reviews-loading">
                <div className="loading-spinner"></div>
                <p>Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (

              <div className="no-reviews-message">
                <span>💬</span>
                <p>No reviews yet.</p>
                <small>
                  Be the first customer to review this product.
                </small>
              </div>

            ) : (

              <div className="reviews-list">

                {reviews.map((item) => (
                  <div
                    className="review-item"
                    key={item.id}
                  >

                    <div className="review-header">

                      <div className="review-user">
                        <div className="review-avatar">
                          {item.username
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <strong>
                          {item.username}
                        </strong>
                      </div>

                      <span className="review-item-stars">
                        {"★".repeat(
                          Number(item.rating)
                        )}
                      </span>

                    </div>

                    <p className="review-text">
                      {item.review}
                    </p>

                    <small className="review-date">
                      {new Date(
                        item.created_at
                      ).toLocaleDateString()}
                    </small>

                  </div>
                ))}

              </div>
            )}

          </div>
        </div>
      )}

    </main>
  );
}

export default ProductDetails;