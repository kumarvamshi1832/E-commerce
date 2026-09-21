import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Support.css";

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

function Support() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
    order_id: "",
    description: "",
  });

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTickets();
    fetchOrders();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "support/my-tickets/"
      );

      setTickets(response.data.tickets || []);

    } catch (error) {
      setError(
        error.response?.data?.error ||
        "Unable to load support tickets."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get("my-orders/");

      setOrders(
        response.data.orders ||
        response.data ||
        []
      );

    } catch (error) {
      console.error(
        "Unable to load orders:",
        error
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please describe your issue.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setError("");

      const response = await api.post(
        "support/tickets/",
        {
          category: formData.category,
          order_id: formData.order_id || null,
          description:
            formData.description.trim(),
        }
      );

      setMessage(
        response.data.message ||
        "Support ticket created successfully."
      );

      setFormData({
        category: "",
        order_id: "",
        description: "",
      });

      await fetchTickets();

    } catch (error) {
      setError(
        error.response?.data?.error ||
        "Unable to create support ticket."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="support-page">

      <div className="floating-groceries">
        {vegetables.map((vegetable, index) => (
          <span
            key={index}
            className="floating-grocery"
          >
            {vegetable}
          </span>
        ))}
      </div>

      <div className="support-content">

        {/* =========================
            HEADER
        ========================= */}

        <section className="support-header">

          <div className="support-header-icon">
            💬
          </div>

          <div>
            <p className="support-label">
              CUSTOMER CARE
            </p>

            <h1>Help & Support</h1>

            <p>
              Need help? Create a support ticket and
              our team will assist you.
            </p>
          </div>

        </section>

        {/* =========================
            CREATE TICKET
        ========================= */}

        <section className="support-create-card">

          <div className="support-card-header">

            <div className="support-card-icon">
              🎫
            </div>

            <div>
              <h2>Create Support Ticket</h2>

              <p>
                Tell us how we can help you.
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="support-form-grid">

              <div className="support-form-group">

                <label htmlFor="category">
                  Category
                </label>

                <div className="support-input-wrapper">

                  <span>📂</span>

                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select a category
                    </option>

                    <option value="Order">
                      Order
                    </option>

                    <option value="Payment">
                      Payment
                    </option>

                    <option value="Delivery">
                      Delivery
                    </option>

                    <option value="Product">
                      Product
                    </option>

                    <option value="Refund">
                      Refund
                    </option>

                    <option value="Account">
                      Account
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>

                </div>

              </div>

              <div className="support-form-group">

                <label htmlFor="order_id">
                  Related Order
                  <span> (Optional)</span>
                </label>

                <div className="support-input-wrapper">

                  <span>📦</span>

                  <select
                    id="order_id"
                    name="order_id"
                    value={formData.order_id}
                    onChange={handleChange}
                  >
                    <option value="">
                      No specific order
                    </option>

                    {orders.map((order) => (
                      <option
                        key={order.id}
                        value={order.id}
                      >
                        Order #{order.id}
                      </option>
                    ))}
                  </select>

                </div>

              </div>

            </div>

            <div className="support-form-group">

              <label htmlFor="description">
                Describe your issue
              </label>

              <div className="support-textarea-wrapper">

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Please explain your issue in detail..."
                  maxLength={5000}
                />

              </div>

              <div className="support-character-count">
                {formData.description.length}/5000
              </div>

            </div>

            {error && (
              <div className="support-message support-error">
                <span>⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {message && (
              <div className="support-message support-success">
                <span>✓</span>
                <p>{message}</p>
              </div>
            )}

            <button
              type="submit"
              className="support-submit-button"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="support-spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  🎫 Submit Ticket
                </>
              )}
            </button>

          </form>

        </section>

        {/* =========================
            MY TICKETS
        ========================= */}

        <section className="support-tickets-section">

          <div className="support-section-heading">

            <div>
              <p className="support-label">
                YOUR REQUESTS
              </p>

              <h2>My Support Tickets</h2>

              <p>
                Track your previous support requests
                and responses.
              </p>
            </div>

            <div className="ticket-count">
              {tickets.length}
              <span>
                {tickets.length === 1
                  ? " Ticket"
                  : " Tickets"}
              </span>
            </div>

          </div>

          {loading ? (

            <div className="support-state">

              <div className="support-state-icon">
                🎫
              </div>

              <p>
                Loading tickets...
              </p>

            </div>

          ) : tickets.length === 0 ? (

            <div className="no-tickets">

              <div className="no-tickets-icon">
                🎫
              </div>

              <h3>
                No support tickets yet
              </h3>

              <p>
                If you need help, create a support
                ticket above.
              </p>

            </div>

          ) : (

            <div className="support-ticket-list">

              {tickets.map((ticket) => (

                <article
                  className="support-ticket-card"
                  key={ticket.id}
                >

                  <div className="ticket-top">

                    <div className="ticket-title-area">

                      <span className="ticket-id">
                        Ticket #{ticket.id}
                      </span>

                      <h3>
                        {ticket.subject}
                      </h3>

                    </div>

                    <span
                      className={`ticket-status status-${ticket.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {ticket.status}
                    </span>

                  </div>

                  <div className="ticket-info">

                    <span>
                      <strong>Category</strong>
                      {ticket.category}
                    </span>

                    {ticket.order_id && (
                      <span>
                        <strong>Order</strong>
                        #{ticket.order_id}
                      </span>
                    )}

                    <span>
                      <strong>Created</strong>
                      {new Date(
                        ticket.created_at
                      ).toLocaleDateString()}
                    </span>

                  </div>

                  <div className="ticket-content-block">

                    <div className="ticket-block-heading">
                      <span>📝</span>
                      <strong>Your Issue</strong>
                    </div>

                    <p>
                      {ticket.description}
                    </p>

                  </div>

                  <div className="ticket-reply">

                    <div className="ticket-block-heading">
                      <span>
                        {ticket.admin_reply
                          ? "💬"
                          : "⏳"}
                      </span>

                      <strong>
                        Admin Reply
                      </strong>
                    </div>

                    {ticket.admin_reply ? (

                      <p>
                        {ticket.admin_reply}
                      </p>

                    ) : (

                      <p className="waiting-reply">
                        Our support team has not
                        replied yet.
                      </p>

                    )}

                  </div>

                  <div className="ticket-footer">

                    <button
                      type="button"
                      className="view-ticket-button"
                      onClick={() =>
                        navigate(
                          `/support/tickets/${ticket.id}`
                        )
                      }
                    >
                      View Ticket
                      <span>→</span>
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}

export default Support;