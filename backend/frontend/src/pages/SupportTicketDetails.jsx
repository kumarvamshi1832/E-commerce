import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./SupportTicketDetails.css";

function SupportTicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);



  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `support/tickets/${ticketId}/`
      );

      setTicket(response.data.ticket);
    } catch (error) {
      setError(
        error.response?.data?.error ||
        "Unable to load support ticket."
      );
    } finally {
      setLoading(false);
    }
  };

    const handleSendMessage = async () => {
  if (!message.trim()) {
    return;
  }

  try {
    const response = await api.post(
      `support/tickets/${ticketId}/messages/`,
      {
        message: message.trim(),
      }
    );

    setMessage("");

    await fetchTicket();

  } catch (error) {
    setError(
      error.response?.data?.error ||
      "Unable to send message."
    );
  }
};

  if (loading) {
    return (
      <div className="support-details-page">
        <div className="support-details-loading">
          Loading ticket...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="support-details-page">
        <div className="support-details-error">
          {error}
        </div>

        <button
          className="back-support-button"
          onClick={() => navigate("/support")}
        >
          ← Back to Support
        </button>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <div className="support-details-page">

      {/* Header */}
      <div className="support-details-header">
        <button
          className="back-support-button"
          onClick={() => navigate("/support")}
        >
          ← Back to Support
        </button>

        <div className="ticket-heading">
          <div>
            <span className="ticket-number">
              Ticket #{ticket.id}
            </span>

            <h1>{ticket.subject}</h1>
          </div>

          <span
            className={`ticket-status status-${ticket.status
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            {ticket.status}
          </span>
        </div>
      </div>

      {/* Ticket Information */}
      <div className="ticket-details-card">

        <div className="ticket-meta">
          <div>
            <span>Category</span>
            <strong>{ticket.category}</strong>
          </div>

          {ticket.order_id && (
            <div>
              <span>Order</span>
              <strong>#{ticket.order_id}</strong>
            </div>
          )}

          <div>
            <span>Created</span>
            <strong>
              {new Date(
                ticket.created_at
              ).toLocaleString()}
            </strong>
          </div>

          <div>
            <span>Last Updated</span>
            <strong>
              {new Date(
                ticket.updated_at
              ).toLocaleString()}
            </strong>
          </div>
        </div>

      </div>

      {/* Conversation */}
      <div className="conversation-card">

        <div className="conversation-header">
          <h2>Support Conversation</h2>
          <p>
            Our support team will respond to your messages here.
          </p>
        </div>

        <div className="conversation-messages">

          {ticket.messages &&
          ticket.messages.length > 0 ? (
            ticket.messages.map((msg) => (
              <div
                key={msg.id}
                className={`conversation-message ${
                  msg.sender === "Customer"
                    ? "customer-message"
                    : "admin-message"
                }`}
              >
                <div className="message-sender">
                  {msg.sender === "Customer"
                    ? "You"
                    : "Support Team"}
                </div>

                <div className="message-text">
                  {msg.message}
                </div>

                <div className="message-time">
                  {new Date(
                    msg.created_at
                  ).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="no-messages">
              No messages yet.
            </div>
          )}

        </div>

        {/* Message Box */}
        {ticket.status !== "Closed" && (
          <div className="conversation-reply">

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              maxLength={5000}
            />

            <button
  onClick={handleSendMessage}
  disabled={!message.trim()}
>
  Send Message
</button>

          </div>
        )}

        {ticket.status === "Closed" && (
          <div className="ticket-closed-message">
            This support ticket is closed.
          </div>
        )}

      </div>

    </div>
  );
}

export default SupportTicketDetails;