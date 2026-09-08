import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "./OrderDetails.css";

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

    console.log("FEEDBACK RESPONSE:", response.data);

    setFeedbacks((prev) => ({
      ...prev,
      [orderItemId]: response.data.feedbacks || [],
    }));

  } catch (error) {
    console.log("FULL FEEDBACK ERROR:", error.response);
    console.log("FEEDBACK ERROR DATA:", error.response?.data);
    console.log("FEEDBACK ERROR STATUS:", error.response?.status);

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
      [orderItemId]: "Please enter your feedback.",
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
      [orderItemId]: response.data.message,
    }));

    // Refresh feedback history
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
        <div className="order-details-loading">
          Loading order...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="order-details-page">
        <div className="order-details-error">
          ⚠️ {error}

          <br />

          <Link to="/my-orders">
            ← Back to My Orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="order-details-page">

      <div className="order-details-container">

        {/* HEADER */}

        <div className="order-details-header">

          <div>

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
            {order.status}
          </span>

        </div>

               {/* PRODUCTS */}

        <section className="order-products">

          <h2>Products</h2>

          <div className="order-items-list">

            {order.items.map((item) => (

              <article
                className="order-item"
                key={item.id}
              >

                {/* IMAGE */}

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

                {/* PRODUCT INFO */}

                <div className="order-item-info">

                  <h3>
                    {item.product_name}
                  </h3>

                  <p>
                    Quantity: {item.quantity}
                  </p>

                  <p>
                    ₹{Number(
                      item.price
                    ).toFixed(2)} each
                  </p>

                </div>

                {/* FEEDBACK */}

{order.status === "Delivered" && (

  <div className="order-item-feedback">

    <button
      type="button"
      className="feedback-button"
      onClick={() => fetchFeedback(item.id)}
    >
      💬 Feedback
    </button>

    {feedbackLoading[item.id] && (
      <p>Loading feedback...</p>
    )}

    {feedbacks[item.id] && (

      <div className="feedback-history">

        {feedbacks[item.id].length === 0 ? (

          <p className="no-feedback">
            No feedback submitted yet.
          </p>

        ) : (

          feedbacks[item.id].map((feedback) => (

            <div
              className="feedback-card"
              key={feedback.id}
            >

              <p className="feedback-label">
                Your Feedback
              </p>

              <p className="feedback-text">
                {feedback.feedback}
              </p>

              <p className="feedback-status">
                Status: {feedback.status}
              </p>

              {feedback.admin_reply ? (

                <div className="admin-reply">

                  <p className="admin-reply-label">
                    Admin Reply
                  </p>

                  <p>
                    {feedback.admin_reply}
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

          ))

        )}

        {/* NEW FEEDBACK */}

        <div className="new-feedback">

          <textarea
            value={feedbackText[item.id] || ""}
            onChange={(e) =>
              setFeedbackText((prev) => ({
                ...prev,
                [item.id]: e.target.value,
              }))
            }
            placeholder="Write your feedback..."
            maxLength={2000}
          />

          <button
            type="button"
            onClick={() =>
              handleSubmitFeedback(item.id)
            }
            disabled={feedbackSubmitting[item.id]}
          >
            {feedbackSubmitting[item.id]
              ? "Submitting..."
              : "Submit Feedback"}
          </button>

          {feedbackMessage[item.id] && (
            <p>
              {feedbackMessage[item.id]}
            </p>
          )}

        </div>

      </div>

    )}

  </div>

)}  

                {/* ITEM TOTAL */}

                <strong className="order-item-total">
                  ₹{Number(
                    item.item_total
                  ).toFixed(2)}
                </strong>

              </article>

            ))}

          </div>

        </section>
        
        {/* SUMMARY */}

        <section className="order-summary">

          <h2>Order Summary</h2>

          <div className="order-summary-row">

            <span>
              Subtotal
            </span>

            <strong>
              ₹{Number(
                order.subtotal
              ).toFixed(2)}
            </strong>

          </div>

          <div className="order-summary-row">

            <span>
              Delivery
            </span>

            <strong>
              ₹{Number(
                order.delivery
              ).toFixed(2)}
            </strong>

          </div>

          <div className="order-summary-divider" />

          <div className="order-summary-total">

            <span>
              Total
            </span>

            <strong>
              ₹{Number(
                order.total_amount
              ).toFixed(2)}
            </strong>

          </div>

        </section>

        {/* ACTION */}

        <div className="order-details-actions">

          <Link
            to="/products"
            className="continue-shopping-button"
          >
            Continue Shopping
          </Link>

          <Link
            to="/my-orders"
            className="back-orders-button"
          >
            My Orders
          </Link>

        </div>

      </div>

    </main>
  );
}

export default OrderDetails;