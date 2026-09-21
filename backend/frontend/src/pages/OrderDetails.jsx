import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import InvoiceActions from "../components/InvoiceActions";
import "./OrderDetails.css";

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

function FloatingGroceries() {
  return (
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
  );
}

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [feedbacks, setFeedbacks] = useState({});
  const [feedbackText, setFeedbackText] = useState({});
  const [feedbackLoading, setFeedbackLoading] = useState({});
  const [feedbackSubmitting, setFeedbackSubmitting] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState({});

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`orders/${id}/`);

      setOrder(response.data);
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Unable to load order."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async (orderItemId) => {
    try {
      setFeedbackLoading((prev) => ({
        ...prev,
        [orderItemId]: true,
      }));

      const response = await api.get(
        `order-items/${orderItemId}/feedback/list/`
      );

      setFeedbacks((prev) => ({
        ...prev,
        [orderItemId]: response.data.feedbacks || [],
      }));
    } catch (error) {
      console.log(
        "Feedback error:",
        error.response?.data
      );
    } finally {
      setFeedbackLoading((prev) => ({
        ...prev,
        [orderItemId]: false,
      }));
    }
  };

  const handleSubmitFeedback = async (orderItemId) => {
    const text = feedbackText[orderItemId]?.trim();

    if (!text) {
      setFeedbackMessage((prev) => ({
        ...prev,
        [orderItemId]:
          "Please enter your feedback.",
      }));
      return;
    }

    try {
      setFeedbackSubmitting((prev) => ({
        ...prev,
        [orderItemId]: true,
      }));

      setFeedbackMessage((prev) => ({
        ...prev,
        [orderItemId]: "",
      }));

      const response = await api.post(
        `order-items/${orderItemId}/feedback/`,
        {
          feedback: text,
        }
      );

      setFeedbackText((prev) => ({
        ...prev,
        [orderItemId]: "",
      }));

      setFeedbackMessage((prev) => ({
        ...prev,
        [orderItemId]:
          response.data.message,
      }));

      await fetchFeedback(orderItemId);
    } catch (error) {
      setFeedbackMessage((prev) => ({
        ...prev,
        [orderItemId]:
          error.response?.data?.error ||
          "Unable to submit feedback.",
      }));
    } finally {
      setFeedbackSubmitting((prev) => ({
        ...prev,
        [orderItemId]: false,
      }));
    }
  };

  if (loading) {
    return (
      <main className="order-details-page">
        <FloatingGroceries />

        <div className="order-status-card">
          <div className="order-loading-spinner"></div>

          <p className="order-status-eyebrow">
            MY ORDER
          </p>

          <h2>Loading your order...</h2>

          <p>
            Please wait while we fetch your order
            details.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="order-details-page">
        <FloatingGroceries />

        <div className="order-status-card error-card">
          <div className="order-status-icon">
            ⚠️
          </div>

          <p className="order-status-eyebrow">
            ORDER UNAVAILABLE
          </p>

          <h2>Unable to load order</h2>

          <p>{error}</p>

          <Link
            to="/my-orders"
            className="back-orders-button"
          >
            ← Back to My Orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="order-details-page">
      <FloatingGroceries />

      <div className="order-details-container">

        <div className="order-details-header">

          <div className="order-heading-content">

            <Link
              to="/my-orders"
              className="back-orders-link"
            >
              ← Back to My Orders
            </Link>

            <p className="order-details-eyebrow">
              ORDER DETAILS
            </p>

            <h1>
              Order #{order.id}
            </h1>

            <p className="order-date">
              Placed on{" "}
              {new Date(
                order.created_at
              ).toLocaleDateString()}
            </p>

          </div>

          <span
            className={`order-detail-status ${
              order.status
                ?.toLowerCase()
                .replace(" ", "-")
            }`}
          >
            <span className="status-dot"></span>
            {order.status}
          </span>

        </div>

        <section className="order-products">

          <div className="section-heading">

            <div>
              <p className="section-eyebrow">
                YOUR PURCHASE
              </p>

              <h2>Products</h2>
            </div>

            <span className="items-count">
              {order.items.length}{" "}
              {order.items.length === 1
                ? "item"
                : "items"}
            </span>

          </div>

          <div className="order-items-list">

            {order.items.map((item) => (
              <article
                className="order-item"
                key={item.id}
              >

                <div className="order-item-main">

                  <div className="order-item-image">

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.product_name}
                      />
                    ) : (
                      <span>📦</span>
                    )}

                  </div>

                  <div className="order-item-info">

                    <span className="order-item-label">
                      PRODUCT
                    </span>

                    <h3>
                      {item.product_name}
                    </h3>

                    <div className="order-item-meta">

                      <span>
                        Qty: {item.quantity}
                      </span>

                      <span>
                        ₹
                        {Number(
                          item.price
                        ).toFixed(2)}{" "}
                        each
                      </span>

                    </div>

                  </div>

                </div>

                <strong className="order-item-total">
                  ₹
                  {Number(
                    item.item_total
                  ).toFixed(2)}
                </strong>

                {order.status === "Delivered" && (
                  <div className="order-item-feedback">

                    <button
                      type="button"
                      className="feedback-button"
                      onClick={() =>
                        fetchFeedback(item.id)
                      }
                    >
                      <span>💬</span>
                      Feedback
                    </button>

                    {feedbackLoading[item.id] && (
                      <div className="feedback-loading">
                        <div className="small-spinner"></div>
                        Loading feedback...
                      </div>
                    )}

                    {feedbacks[item.id] && (
                      <div className="feedback-history">

                        {feedbacks[item.id].length ===
                        0 ? (
                          <p className="no-feedback">
                            No feedback submitted yet.
                          </p>
                        ) : (
                          feedbacks[item.id].map(
                            (feedback) => (
                              <div
                                className="feedback-card"
                                key={feedback.id}
                              >

                                <p className="feedback-label">
                                  YOUR FEEDBACK
                                </p>

                                <p className="feedback-text">
                                  {
                                    feedback.feedback
                                  }
                                </p>

                                <span
                                  className={`feedback-status ${feedback.status
                                    ?.toLowerCase()
                                    .replace(
                                      " ",
                                      "-"
                                    )}`}
                                >
                                  Status:{" "}
                                  {feedback.status}
                                </span>

                                {feedback.admin_reply ? (
                                  <div className="admin-reply">

                                    <p className="admin-reply-label">
                                      ADMIN REPLY
                                    </p>

                                    <p>
                                      {
                                        feedback.admin_reply
                                      }
                                    </p>

                                    {feedback.replied_at && (
                                      <small>
                                        Replied on{" "}
                                        {new Date(
                                          feedback.replied_at
                                        ).toLocaleDateString()}
                                      </small>
                                    )}

                                  </div>
                                ) : (
                                  <p className="no-admin-reply">
                                    No reply yet.
                                  </p>
                                )}

                              </div>
                            )
                          )
                        )}

                        <div className="new-feedback">

                          <p className="new-feedback-label">
                            SHARE YOUR EXPERIENCE
                          </p>

                          <textarea
                            value={
                              feedbackText[
                                item.id
                              ] || ""
                            }
                            onChange={(e) =>
                              setFeedbackText(
                                (prev) => ({
                                  ...prev,
                                  [item.id]:
                                    e.target.value,
                                })
                              )
                            }
                            placeholder="Tell us about your experience with this product..."
                            maxLength={2000}
                          />

                          <div className="feedback-submit-row">

                            <span>
                              {
                                (
                                  feedbackText[
                                    item.id
                                  ] || ""
                                ).length
                              }
                              /2000
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleSubmitFeedback(
                                  item.id
                                )
                              }
                              disabled={
                                feedbackSubmitting[
                                  item.id
                                ]
                              }
                            >
                              {feedbackSubmitting[
                                item.id
                              ]
                                ? "Submitting..."
                                : "Submit Feedback"}
                            </button>

                          </div>

                          {feedbackMessage[
                            item.id
                          ] && (
                            <p className="feedback-message">
                              {
                                feedbackMessage[
                                  item.id
                                ]
                              }
                            </p>
                          )}

                        </div>

                      </div>
                    )}

                  </div>
                )}

              </article>
            ))}

          </div>

        </section>

        <section className="order-summary">

          <div className="summary-heading">

            <div>
              <p className="section-eyebrow">
                PAYMENT BREAKDOWN
              </p>

              <h2>Order Summary</h2>
            </div>

            <span className="summary-icon">
              🧾
            </span>

          </div>

          <div className="order-summary-row">
            <span>Subtotal</span>

            <strong>
              ₹
              {Number(
                order.subtotal
              ).toFixed(2)}
            </strong>
          </div>

          {Number(order.discount) > 0 && (
            <div className="order-summary-row discount-row">

              <span>
                Discount
                {order.coupon_code && (
                  <> ({order.coupon_code})</>
                )}
              </span>

              <strong>
                -₹
                {Number(
                  order.discount
                ).toFixed(2)}
              </strong>

            </div>
          )}

          <div className="order-summary-row">

            <span>Delivery</span>

            <strong>
              ₹
              {Number(
                order.delivery_charge
              ).toFixed(2)}
            </strong>

          </div>

          <div className="order-summary-divider"></div>

          <div className="order-summary-total">

            <span>Total</span>

            <strong>
              ₹
              {Number(
                order.total_amount
              ).toFixed(2)}
            </strong>

          </div>

        </section>

        <div className="order-details-actions">

          <InvoiceActions order={order} />

          <Link
            to="/products"
            className="continue-shopping-button"
          >
            🛍️ Continue Shopping
          </Link>

          <Link
            to="/my-orders"
            className="back-orders-button"
          >
            ← My Orders
          </Link>

        </div>

      </div>
    </main>
  );
}

export default OrderDetails;