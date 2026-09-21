import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./SupportTicketDetails.css";

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

function SupportTicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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
      setSending(true);
      setError("");

      await api.post(
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
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="support-details-page">

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

        <div className="support-details-state">
          <div className="support-details-state-icon">
            🎫
          </div>

          <h2>Loading ticket...</h2>

          <p>
            Please wait while we load your support
            conversation.
          </p>
        </div>

      </main>
    );
  }

  if (error && !ticket) {
    return (
      <main className="support-details-page">

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

        <div className="support-details-state support-details-error-state">

          <div className="support-details-state-icon">
            ⚠️
          </div>

          <h2>Unable to load ticket</h2>

          <p>{error}</p>

          <button
            type="button"
            className="back-support-button"
            onClick={() => navigate("/support")}
          >
            ← Back to Support
          </button>

        </div>

      </main>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <main className="support-details-page">

      {/* =========================
          FLOATING GROCERIES
      ========================= */}

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

      <div className="support-details-content">

        {/* =========================
            HEADER
        ========================= */}

        <section className="support-details-header">

          <button
            type="button"
            className="back-support-button"
            onClick={() => navigate("/support")}
          >
            ← Back to Support
          </button>

          <div className="ticket-heading">

            <div className="ticket-heading-main">

              <div className="ticket-heading-icon">
                🎫
              </div>

              <div>

                <p className="ticket-number">
                  SUPPORT TICKET #{ticket.id}
                </p>

                <h1>{ticket.subject}</h1>

              </div>

            </div>

            <span
              className={`ticket-status status-${ticket.status
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              {ticket.status}
            </span>

          </div>

        </section>

        {/* =========================
            TICKET INFORMATION
        ========================= */}

        <section className="ticket-details-card">

          <div className="ticket-details-card-header">

            <div>
              <p className="support-label">
                TICKET INFORMATION
              </p>

              <h2>Ticket Details</h2>
            </div>

            <div className="ticket-id-badge">
              #{ticket.id}
            </div>

          </div>

          <div className="ticket-meta">

            <div className="ticket-meta-item">
              <span className="ticket-meta-icon">
                📂
              </span>

              <div>
                <span>Category</span>
                <strong>
                  {ticket.category}
                </strong>
              </div>
            </div>

            {ticket.order_id && (
              <div className="ticket-meta-item">

                <span className="ticket-meta-icon">
                  📦
                </span>

                <div>
                  <span>Order</span>

                  <strong>
                    #{ticket.order_id}
                  </strong>
                </div>

              </div>
            )}

            <div className="ticket-meta-item">

              <span className="ticket-meta-icon">
                📅
              </span>

              <div>
                <span>Created</span>

                <strong>
                  {new Date(
                    ticket.created_at
                  ).toLocaleString()}
                </strong>
              </div>

            </div>

            <div className="ticket-meta-item">

              <span className="ticket-meta-icon">
                🔄
              </span>

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

        </section>

        {/* =========================
            ERROR AFTER LOADING
        ========================= */}

        {error && (
          <div className="support-details-inline-error">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* =========================
            CONVERSATION
        ========================= */}

        <section className="conversation-card">

          <div className="conversation-header">

            <div className="conversation-title">

              <div className="conversation-icon">
                💬
              </div>

              <div>
                <h2>Support Conversation</h2>

                <p>
                  Our support team will respond to
                  your messages here.
                </p>
              </div>

            </div>

            <div className="conversation-status">
              {ticket.status === "Closed"
                ? "🔒 Closed"
                : "● Active"}
            </div>

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

                  <div className="message-avatar">
                    {msg.sender === "Customer"
                      ? "👤"
                      : "💬"}
                  </div>

                  <div className="message-content">

                    <div className="message-top">

                      <span className="message-sender">
                        {msg.sender === "Customer"
                          ? "You"
                          : "Support Team"}
                      </span>

                      <span className="message-time">
                        {new Date(
                          msg.created_at
                        ).toLocaleString()}
                      </span>

                    </div>

                    <div className="message-text">
                      {msg.message}
                    </div>

                  </div>

                </div>

              ))

            ) : (

              <div className="no-messages">

                <div className="no-messages-icon">
                  💬
                </div>

                <h3>No messages yet</h3>

                <p>
                  Start the conversation by sending
                  a message below.
                </p>

              </div>

            )}

          </div>

          {/* =========================
              REPLY
          ========================= */}

          {ticket.status !== "Closed" ? (

            <div className="conversation-reply">

              <div className="reply-label">
                <span>✏️</span>
                <strong>Write a message</strong>
              </div>

              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setError("");
                }}
                placeholder="Type your message here..."
                maxLength={5000}
                disabled={sending}
              />

              <div className="reply-footer">

                <span className="message-character-count">
                  {message.length}/5000
                </span>

                <button
                  type="button"
                  className="send-message-button"
                  onClick={handleSendMessage}
                  disabled={
                    !message.trim() ||
                    sending
                  }
                >
                  {sending ? (
                    <>
                      <span className="message-spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <span>→</span>
                    </>
                  )}
                </button>

              </div>

            </div>

          ) : (

            <div className="ticket-closed-message">

              <div className="closed-icon">
                🔒
              </div>

              <div>
                <strong>
                  This support ticket is closed.
                </strong>

                <p>
                  You can no longer send messages to
                  this ticket.
                </p>
              </div>

            </div>

          )}

        </section>

      </div>

    </main>
  );
}

export default SupportTicketDetails;