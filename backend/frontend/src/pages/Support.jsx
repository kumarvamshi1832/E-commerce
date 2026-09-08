import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Support.css";

function Support() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
    order_id: "",
    // subject: "",
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

  // =========================
  // FETCH MY SUPPORT TICKETS
  // =========================

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const response = await api.get("support/my-tickets/");

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

  // =========================
  // FETCH MY ORDERS
  // =========================

  const fetchOrders = async () => {
    try {
      const response = await api.get("my-orders/");

      setOrders(response.data.orders || response.data || []);

    } catch (error) {
      console.error("Unable to load orders:", error);
    }
  };

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // =========================
  // SUBMIT TICKET
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    // if (!formData.subject.trim()) {
    //   setError("Please enter a subject.");
    //   return;
    // }

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
        //   subject: formData.subject.trim(),
          description: formData.description.trim(),
        }
      );

      setMessage(
        response.data.message ||
        "Support ticket created successfully."
      );

      setFormData({
        category: "",
        order_id: "",
        // subject: "",
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
    <div className="support-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="support-header">
        <h1>Help & Support</h1>
        <p>
          Need help? Create a support ticket and our team
          will assist you.
        </p>
      </div>

      {/* =========================
          CREATE TICKET
      ========================= */}

      <div className="support-create-card">

        <h2>Create Support Ticket</h2>

        <form onSubmit={handleSubmit}>

          <div className="support-form-group">
            <label htmlFor="category">
              Category
            </label>

            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">
                Select a category
              </option>

              <option value="Order">Order</option>
              <option value="Payment">Payment</option>
              <option value="Delivery">Delivery</option>
              <option value="Product">Product</option>
              <option value="Refund">Refund</option>
              <option value="Account">Account</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="support-form-group">
            <label htmlFor="order_id">
              Related Order
              <span> (Optional)</span>
            </label>

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

          {/* <div className="support-form-group">
            <label htmlFor="subject">
              Subject
            </label>

            <input
              id="subject"
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Example: Payment deducted but order not created"
              maxLength={200}
            />
          </div> */}

          <div className="support-form-group">
            <label htmlFor="description">
              Describe your issue
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please explain your issue in detail..."
              maxLength={5000}
            />
          </div>

          {error && (
            <p className="support-error">
              {error}
            </p>
          )}

          {message && (
            <p className="support-success">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="support-submit-button"
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Submit Ticket"}
          </button>

        </form>
      </div>

      {/* =========================
          MY TICKETS
      ========================= */}

      <div className="support-tickets-section">

        <h2>My Support Tickets</h2>

        {loading ? (
          <p className="support-loading">
            Loading tickets...
          </p>
        ) : tickets.length === 0 ? (
          <div className="no-tickets">
            <div className="no-tickets-icon">
              🎫
            </div>

            <h3>No support tickets yet</h3>

            <p>
              If you need help, create a support ticket
              above.
            </p>
          </div>
        ) : (
          <div className="support-ticket-list">

            {tickets.map((ticket) => (
              <div
                className="support-ticket-card"
                key={ticket.id}
              >

                <div className="ticket-top">

                  <div>
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
                    Category: {ticket.category}
                  </span>

                  {ticket.order_id && (
                    <span>
                      Order: #{ticket.order_id}
                    </span>
                  )}

                  <span>
                    Created:{" "}
                    {new Date(
                      ticket.created_at
                    ).toLocaleDateString()}
                  </span>

                </div>

                <div className="ticket-description">
                  <strong>Your Issue</strong>

                  <p>
                    {ticket.description}
                  </p>
                </div>

                <div className="ticket-reply">

                  <strong>
                    Admin Reply
                  </strong>

                  {ticket.admin_reply ? (
                    <p>
                      {ticket.admin_reply}
                    </p>
                  ) : (
                    <p className="waiting-reply">
                      Our support team has not replied
                      yet.
                    </p>
                  )}

                </div>

                <button
  className="view-ticket-button"
  onClick={() =>
    navigate(`/support/tickets/${ticket.id}`)
  }
>
  View Ticket →
</button>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Support;