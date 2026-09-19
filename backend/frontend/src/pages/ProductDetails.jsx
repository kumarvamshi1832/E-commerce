import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import "./ProductDetails.css";

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

  // Load product
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

  // Load reviews
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

  // Product loading
  if (loading) {
    return (
      <main className="product-details-page">
        <div className="product-details-loading">
          Loading product...
        </div>
      </main>
    );
  }

  // Product error
  if (error || !product) {
    return (
      <main className="product-details-page">
        <div className="product-details-error">
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

  // Find product in cart
  const cartItem = cartItems?.find(
    (item) => item.id === product.id
  );

  const quantity = cartItem ? cartItem.quantity : 0;

  // Stock status
  const isOutOfStock = product.stock <= 0;

  const isLowStock =
    product.stock > 0 && product.stock <= 5;

  // Add product to cart
  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product);
    }
  };

  return (
    <main className="product-details-page">
      <div className="product-details-container">

        {/* Back */}
        <Link
          to="/products"
          className="product-back-link"
        >
          ← Back to Products
        </Link>

        <div className="product-details-card">

          {/* =========================
              PRODUCT IMAGE
          ========================= */}
          <div className="product-details-image-section">
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
          </div>

          {/* =========================
              PRODUCT INFORMATION
          ========================= */}
          <div className="product-details-info">

            {/* Category */}
            <span className="product-details-category">
              {product.category}
            </span>

            {/* Product name */}
            <h1>{product.name}</h1>

            {/* =========================
                PRODUCT RATING
            ========================= */}
            <div className="product-details-rating">
              {product.rating_count > 0 ? (
                <>
                  <span className="details-rating-stars">
                    {"★".repeat(
                      Math.round(product.average_rating)
                    )}
                  </span>

                  <span className="details-rating-value">
                    {product.average_rating}
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

            {/* Price */}
            <div className="product-details-price">
              ₹{Number(product.price).toFixed(2)}
            </div>

            {/* Description */}
            <p className="product-details-description">
              {product.description}
            </p>

            {/* =========================
                STOCK
            ========================= */}
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

            {/* =========================
                CART CONTROLS
            ========================= */}
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
                {isOutOfStock
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>
            )}

            {/* =========================
                REVIEWS MODAL
            ========================= */}
            {showReviews && (
              <div className="reviews-modal-overlay">

                <div className="reviews-modal">

                  {/* Close button */}
                  <button
                    type="button"
                    className="reviews-modal-close"
                    onClick={() => setShowReviews(false)}
                  >
                    ×
                  </button>

                  <h2>Customer Reviews</h2>

                  {/* Loading */}
                  {reviewsLoading ? (
                    <p>Loading reviews...</p>
                  ) : reviews.length === 0 ? (

                    /* No reviews */
                    <p className="no-reviews-message">
                      No reviews yet.
                    </p>

                  ) : (

                    /* Reviews list */
                    <div className="reviews-list">

                      {reviews.map((item) => (
                        <div
                          className="review-item"
                          key={item.id}
                        >

                          <div className="review-header">

                            <strong>
                              {item.username}
                            </strong>

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

            {/* =========================
                PRODUCT FEATURES
            ========================= */}
            <div className="product-details-features">

              <div>
                🚚
                <span>
                  <strong>Fast Delivery</strong>
                  <small>
                    Delivered to your door
                  </small>
                </span>
              </div>

              <div>
                ✓
                <span>
                  <strong>Quality Guaranteed</strong>
                  <small>
                    Fresh and carefully selected
                  </small>
                </span>
              </div>

              <div>
                🔒
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
    </main>
  );
}

export default ProductDetails;