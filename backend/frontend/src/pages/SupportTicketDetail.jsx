import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./SupportTicketDetail.css";

function SupportTicketDetail() {
    const { ticketId } = useParams();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);

    const [reply, setReply] = useState("");
    const [status, setStatus] = useState("");

    const [loading, setLoading] = useState(true);
    const [replyLoading, setReplyLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchTicket = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `support/dashboard/tickets/${ticketId}/`
            );

            setTicket(response.data.ticket);
            setMessages(response.data.messages || []);
            setStatus(response.data.ticket.status);
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Unable to load ticket."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [ticketId]);

    const handleReply = async (e) => {
        e.preventDefault();

        if (!reply.trim()) {
            setError("Please enter a reply.");
            setSuccess("");
            return;
        }

        try {
            setReplyLoading(true);
            setError("");
            setSuccess("");

            const response = await api.post(
                `support/dashboard/tickets/${ticketId}/reply/`,
                {
                    message: reply.trim(),
                }
            );

            setSuccess("Reply sent successfully.");
            setReply("");

            setStatus(response.data.ticket_status);

            await fetchTicket();
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Unable to send reply."
            );
        } finally {
            setReplyLoading(false);
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;

        try {
            setStatusLoading(true);
            setError("");
            setSuccess("");

            const response = await api.patch(
                `support/dashboard/tickets/${ticketId}/status/`,
                {
                    status: newStatus,
                }
            );

            setStatus(response.data.status);

            setTicket((previousTicket) => ({
                ...previousTicket,
                status: response.data.status,
                resolved_at: response.data.resolved_at,
            }));

            setSuccess(
                "Ticket status updated successfully."
            );
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Unable to update ticket status."
            );
        } finally {
            setStatusLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="support-ticket-detail">
                <div className="ticket-page-state">
                    <div className="ticket-state-icon">
                        🎫
                    </div>

                    <h2>Loading ticket...</h2>

                    <p>
                        Please wait while we load the support
                        conversation.
                    </p>
                </div>
            </div>
        );
    }

    if (error && !ticket) {
        return (
            <div className="support-ticket-detail">
                <div className="ticket-page-top">
                    <button
                        type="button"
                        className="back-ticket-button"
                        onClick={() =>
                            navigate("/support-dashboard")
                        }
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                <div className="ticket-page-state ticket-error-state">
                    <div className="ticket-state-icon">
                        ⚠️
                    </div>

                    <h2>Unable to load ticket</h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        className="state-back-button"
                        onClick={() =>
                            navigate("/support-dashboard")
                        }
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="support-ticket-detail">

            <div className="ticket-detail-container">

                {/* =========================
                    TOP
                ========================= */}

                <div className="ticket-page-top">

                    <button
                        type="button"
                        className="back-ticket-button"
                        onClick={() =>
                            navigate("/support-dashboard")
                        }
                    >
                        ← Back to Dashboard
                    </button>

                    <span className="ticket-page-label">
                        SUPPORT MANAGEMENT
                    </span>

                </div>

                {/* =========================
                    HEADER
                ========================= */}

                <div className="ticket-detail-header">

                    <div className="ticket-header-left">

                        <div className="ticket-header-icon">
                            💬
                        </div>

                        <div>
                            <span className="detail-ticket-id">
                                TICKET #{ticket.id}
                            </span>

                            <h1>
                                {ticket.subject}
                            </h1>

                            <p>
                                Manage customer conversation
                                and ticket status
                            </p>
                        </div>

                    </div>

                    <span
                        className={
                            `detail-ticket-status status-${ticket.status
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`
                        }
                    >
                        <span className="status-dot"></span>
                        {ticket.status}
                    </span>

                </div>

                {/* =========================
                    MAIN CONTENT
                ========================= */}

                <div className="ticket-detail-content">

                    {/* =========================
                        CONVERSATION
                    ========================= */}

                    <div className="ticket-conversation">

                        <div className="section-heading">

                            <div className="section-heading-icon">
                                💬
                            </div>

                            <div>
                                <h2>
                                    Conversation
                                </h2>

                                <p>
                                    Customer and support
                                    communication
                                </p>
                            </div>

                        </div>

                        <div className="message-list">

                            {messages.length === 0 ? (

                                <div className="no-messages">

                                    <div className="no-messages-icon">
                                        💬
                                    </div>

                                    <h3>
                                        No messages yet
                                    </h3>

                                    <p>
                                        There are no messages in
                                        this ticket yet.
                                    </p>

                                </div>

                            ) : (

                                messages.map((message) => (

                                    <div
                                        key={message.id}
                                        className={
                                            message.sender === "Admin"
                                                ? "message admin-message"
                                                : "message customer-message"
                                        }
                                    >

                                        <div className="message-avatar">
                                            {message.sender === "Admin"
                                                ? "🛡️"
                                                : "👤"}
                                        </div>

                                        <div className="message-body">

                                            <div className="message-header">

                                                <div>
                                                    <strong>
                                                        {message.sender === "Admin"
                                                            ? "Support Team"
                                                            : ticket.customer_username}
                                                    </strong>

                                                    <span
                                                        className={
                                                            message.sender === "Admin"
                                                                ? "sender-role admin-role"
                                                                : "sender-role customer-role"
                                                        }
                                                    >
                                                        {message.sender === "Admin"
                                                            ? "Support"
                                                            : "Customer"}
                                                    </span>
                                                </div>

                                                <span>
                                                    {new Date(
                                                        message.created_at
                                                    ).toLocaleString()}
                                                </span>

                                            </div>

                                            <div className="message-bubble">
                                                {message.message}
                                            </div>

                                        </div>

                                    </div>

                                ))

                            )}

                        </div>

                    </div>

                    {/* =========================
                        INFORMATION
                    ========================= */}

                    <aside className="ticket-information">

                        <div className="information-header">

                            <div className="information-header-icon">
                                📋
                            </div>

                            <div>
                                <h2>
                                    Ticket Information
                                </h2>

                                <p>
                                    Customer and ticket details
                                </p>
                            </div>

                        </div>

                        <div className="information-list">

                            <div className="information-item">
                                <span>Customer</span>

                                <strong>
                                    {ticket.customer_username}
                                </strong>
                            </div>

                            <div className="information-item">
                                <span>Email</span>

                                <strong className="email-value">
                                    {ticket.customer_email}
                                </strong>
                            </div>

                            <div className="information-item">
                                <span>Category</span>

                                <strong>
                                    {ticket.category}
                                </strong>
                            </div>

                            <div className="information-item">
                                <span>Order</span>

                                <strong>
                                    {ticket.order_id
                                        ? `#${ticket.order_id}`
                                        : "No order"}
                                </strong>
                            </div>

                            <div className="information-item">
                                <span>Created</span>

                                <strong>
                                    {new Date(
                                        ticket.created_at
                                    ).toLocaleString()}
                                </strong>
                            </div>

                        </div>

                        {/* STATUS */}

                        <div className="status-control">

                            <label htmlFor="ticket-status">
                                Update Status
                            </label>

                            <select
                                id="ticket-status"
                                value={status}
                                onChange={handleStatusChange}
                                disabled={statusLoading}
                            >
                                <option value="Open">
                                    Open
                                </option>

                                <option value="In Progress">
                                    In Progress
                                </option>

                                <option value="Resolved">
                                    Resolved
                                </option>

                                <option value="Closed">
                                    Closed
                                </option>
                            </select>

                            {statusLoading && (
                                <span className="status-saving">
                                    Updating status...
                                </span>
                            )}

                        </div>

                    </aside>

                </div>

                {/* =========================
                    REPLY
                ========================= */}

                {ticket.status !== "Closed" && (

                    <div className="ticket-reply-section">

                        <div className="reply-section-header">

                            <div className="reply-title">

                                <div className="reply-icon">
                                    ✍️
                                </div>

                                <div>
                                    <h2>
                                        Reply to Customer
                                    </h2>

                                    <p>
                                        Send a message directly
                                        to the customer
                                    </p>
                                </div>

                            </div>

                        </div>

                        {error && (
                            <div className="ticket-alert ticket-alert-error">
                                <span>⚠️</span>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="ticket-alert ticket-alert-success">
                                <span>✓</span>
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleReply}>

                            <textarea
                                value={reply}
                                onChange={(e) => {
                                    setReply(e.target.value);
                                    setError("");
                                    setSuccess("");
                                }}
                                placeholder="Type your reply to the customer..."
                                rows="5"
                                maxLength="5000"
                                disabled={replyLoading}
                            />

                            <div className="reply-footer">

                                <span className="reply-character-count">
                                    {reply.length}/5000
                                </span>

                                <button
                                    type="submit"
                                    className="send-reply-button"
                                    disabled={replyLoading}
                                >
                                    {replyLoading ? (
                                        <>
                                            <span className="reply-spinner"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Reply
                                            <span>→</span>
                                        </>
                                    )}
                                </button>

                            </div>

                        </form>

                    </div>

                )}

                {/* =========================
                    CLOSED
                ========================= */}

                {ticket.status === "Closed" && (

                    <div className="closed-ticket-message">

                        <div className="closed-ticket-icon">
                            🔒
                        </div>

                        <div>
                            <strong>
                                This ticket is closed.
                            </strong>

                            <p>
                                No further replies can be sent
                                to this customer.
                            </p>
                        </div>

                    </div>

                )}

            </div>
        </div>
    );
}

export default SupportTicketDetail;