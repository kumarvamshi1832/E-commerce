import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./MyOrders.css";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);

  const [reviewItem, setReviewItem] = useState(null);
const [rating, setRating] = useState(0);
const [reviewText, setReviewText] = useState("");
const [submittingReview, setSubmittingReview] = useState(false);

  // Stores which orders are expanded
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("my-orders/");

      console.log("My Orders:", response.data);

      setOrders(response.data);
    } catch (error) {
      setError(
        error.response?.data?.error ||
        "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SHOW / HIDE PRODUCTS
  // =========================

  const toggleProducts = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // =========================
  // CANCEL ORDER
  // =========================

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(orderId);
      setError("");
   
      const response = await api.post(
        `orders/${orderId}/cancel/`,
        {}
      );

      alert(`✅ ${response.data.message}`);

      await fetchOrders();

    } catch (error) {
      alert(
        error.response?.data?.error ||
        "Unable to cancel order."
      );
    } finally {
      setCancelling(null);
    }
  };

  // =========================
// SUBMIT PRODUCT REVIEW
// =========================

const handleSubmitReview = async () => {

  if (rating === 0) {
    alert("Please select a rating.");
    return;
  }

  if (!reviewText.trim()) {
    alert("Please write a review.");
    return;
  }

  try {

    setSubmittingReview(true);

    const response = await api.post(
      `products/${reviewItem.product_id}/reviews/${reviewItem.id}/`,
      {
        rating: rating,
        review: reviewText.trim(),
      }
    );

    alert(response.data.message);

    setReviewItem(null);
    setRating(0);
    setReviewText("");

  } catch (error) {

    alert(
      error.response?.data?.error ||
      "Unable to submit review."
    );

  } finally {

    setSubmittingReview(false);

  }
};

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="orders-page">
        <div className="orders-loading">
          Loading your orders...
        </div>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <main className="orders-page">
        <div className="orders-error">
          ⚠️ {error}
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">

      <div className="orders-container">

        {/* =========================
            HEADER
        ========================= */}

        <div className="orders-header">

          <p className="orders-eyebrow">
            YOUR ACCOUNT
          </p>

          <h1>
            My Orders
          </h1>

          <p>
            View your previous orders and their status.
          </p>

        </div>

        {/* =========================
            NO ORDERS
        ========================= */}

        {orders.length === 0 ? (

          <div className="orders-empty">

            <div className="orders-empty-icon">
              📦
            </div>

            <h2>
              No orders yet
            </h2>

            <p>
              You haven't placed any orders yet.
            </p>

            <Link
              to="/products"
              className="shop-now-button"
            >
              Start Shopping
            </Link>

          </div>

        ) : (

          <div className="orders-list">

            {orders.map((order) => {

              /*
               * Make sure items is always an array.
               */
              const items = Array.isArray(order.items)
                ? order.items
                : [];

              /*
               * Check whether this order is expanded.
               */
              const isExpanded =
                expandedOrders[order.id] || false;

              /*
               * Show only first 3 products
               * when the order is collapsed.
               */
              const visibleItems = isExpanded
                ? items
                : items.slice(0, 3);

              /*
               * Number of products remaining.
               */
              const remainingCount =
                items.length - 3;

              return (

                <article
                  className="order-card"
                  key={order.id}
                >

                  {/* =========================
                      LEFT SIDE
                  ========================= */}

                  <div className="order-card-left">

                    <p className="order-number">
                      ORDER #{order.id}
                    </p>

                    <h2>
                      ₹
                      {Number(
                        order.total_amount
                      ).toFixed(2)}
                    </h2>

                    <p className="order-date">
                      {new Date(
                        order.created_at
                      ).toLocaleDateString()}
                    </p>

                    {/* =========================
                        PRODUCT PREVIEW
                    ========================= */}
                    {items.length > 0 && (

                      <div className="mo-products">

                        {visibleItems.map((item, index) => (

                          <div
                            className="mo-product-wrapper"
                            key={
                              item.id ||
                              item.product_id ||
                              index
                            }
                          >

                            <div
                              className="mo-product"
                              title={`${item.name || "Product"} × ${item.quantity || 1}`}
                            >

                              {item.image ? (

                                <img
                                  src={item.image}
                                  alt={
                                    item.name ||
                                    "Product"
                                  }
                                />

                              ) : (

                                <div className="mo-product-placeholder">
                                  🛒
                                </div>

                              )}

                            </div>

                            {item.quantity > 1 && (

                              <span className="mo-product-qty">
                                ×{item.quantity}
                              </span>

                            )}

                          </div>

                        ))}

                        {!isExpanded &&
                          remainingCount > 0 && (

                            <button
                              type="button"
                              className="mo-more-products"
                              onClick={() =>
                                toggleProducts(order.id)
                              }
                              aria-label={`Show ${remainingCount} more products`}
                            >
                              +{remainingCount}
                            </button>

                          )}

                        {isExpanded &&
                          items.length > 3 && (

                            <button
                              type="button"
                              className="mo-more-products mo-show-less"
                              onClick={() =>
                                toggleProducts(order.id)
                              }
                              aria-label="Show fewer products"
                            >
                              −
                            </button>

                          )}

                      </div>

                    )}

                  </div>

                  {/* =========================
                      RIGHT SIDE
                  ========================= */}

                  <div className="order-card-right">

                    {/* STATUS */}

                    <span
                      className={`order-status ${
                        order.status
                          ?.toLowerCase()
                          .replace(/\s+/g, "-")
                      }`}
                    >
                      {order.status}
                    </span>

                    {/* VIEW ORDER */}

                    <Link
                      to={`/orders/${order.id}`}
                      className="view-order-button"
                    >
                      View Order →
                    </Link>


                    {/* RATE & REVIEW */}

{order.status === "Delivered" && items.length > 0 && (

  <div className="order-review-buttons">

    {items.map((item) => (

      <button
        key={item.id}
        type="button"
        className="rate-review-button"
        onClick={() => {
          setReviewItem(item);
          setRating(0);
          setReviewText("");
        }}
      >
        ⭐ Rate {item.name}
      </button>

    ))}

  </div>

)}

                    {/* CANCEL */}

                    {order.status === "Pending" && (

                      <button
                        type="button"
                        className="cancel-order-button"
                        onClick={() =>
                          handleCancelOrder(order.id)
                        }
                        disabled={
                          cancelling === order.id
                        }
                      >
                        {cancelling === order.id
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>

                    )}

                  </div>

                </article>

              );
            })}

          </div>

        )}

      </div>
{/* =========================
    REVIEW MODAL
========================= */}

{reviewItem && (

  <div className="review-modal-overlay">

    <div className="review-modal">

      <button
        type="button"
        className="review-modal-close"
        onClick={() => {
          setReviewItem(null);
          setRating(0);
          setReviewText("");
        }}
      >
        ×
      </button>

      <h2>
        Rate {reviewItem.name}
      </h2>

      <p>
        How was this product?
      </p>

      {/* STARS */}

      <div className="review-stars">

        {[1, 2, 3, 4, 5].map((star) => (

          <button
            key={star}
            type="button"
            className={
              star <= rating
                ? "review-star active"
                : "review-star"
            }
            onClick={() => setRating(star)}
          >
            ★
          </button>

        ))}

      </div>

      <textarea
        value={reviewText}
        onChange={(e) =>
          setReviewText(e.target.value)
        }
        placeholder="Write your review..."
        rows="5"
      />

      <button
        type="button"
        className="submit-review-button"
        onClick={handleSubmitReview}
        disabled={submittingReview}
      >
        {submittingReview
          ? "Submitting..."
          : "Submit Review"}
      </button>

    </div>

  </div>

)}
    </main>
  );
}

export default MyOrders;