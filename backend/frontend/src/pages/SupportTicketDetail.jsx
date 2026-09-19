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

    // =========================
    // FETCH TICKET
    // =========================

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

    // =========================
    // SEND REPLY
    // =========================

    const handleReply = async (e) => {
        e.preventDefault();

        if (!reply.trim()) {
            setError("Please enter a reply.");
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

            setStatus(
                response.data.ticket_status
            );

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

    // =========================
    // UPDATE STATUS
    // =========================

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

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="support-ticket-detail">
                <p className="ticket-loading">
                    Loading ticket...
                </p>
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (error && !ticket) {
        return (
            <div className="support-ticket-detail">

                <button
                    className="back-ticket-button"
                    onClick={() =>
                        navigate("/support-dashboard")
                    }
                >
                    ← Back to Dashboard
                </button>

                <p className="ticket-error">
                    {error}
                </p>

            </div>
        );
    }

    return (
        <div className="support-ticket-detail">

            {/* =========================
                BACK BUTTON
            ========================= */}

            <button
                className="back-ticket-button"
                onClick={() =>
                    navigate("/support-dashboard")
                }
            >
                ← Back to Dashboard
            </button>

            {/* =========================
                HEADER
            ========================= */}

            <div className="ticket-detail-header">

                <div>
                    <span className="detail-ticket-id">
                        Ticket #{ticket.id}
                    </span>

                    <h1>
                        {ticket.subject}
                    </h1>
                </div>

                <span
                    className={
                        `detail-ticket-status status-${ticket.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`
                    }
                >
                    {ticket.status}
                </span>

            </div>

            {/* =========================
                MESSAGES
            ========================= */}

            <div className="ticket-detail-content">

                <div className="ticket-conversation">

                    <h2>
                        Conversation
                    </h2>

                    <div className="message-list">

                        {messages.length === 0 ? (

                            <p className="no-messages">
                                No messages yet.
                            </p>

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

                                    <div className="message-header">

                                        <strong>
                                            {message.sender === "Admin"
                                                ? "Support"
                                                : ticket.customer_username}
                                        </strong>

                                        <span>
                                            {new Date(
                                                message.created_at
                                            ).toLocaleString()}
                                        </span>

                                    </div>

                                    <p>
                                        {message.message}
                                    </p>

                                </div>

                            ))

                        )}

                    </div>

                </div>

                {/* =========================
                    TICKET INFORMATION
                ========================= */}

                <div className="ticket-information">

                    <h2>
                        Ticket Information
                    </h2>

                    <div className="information-item">
                        <span>Customer</span>
                        <strong>
                            {ticket.customer_username}
                        </strong>
                    </div>

                    <div className="information-item">
                        <span>Email</span>
                        <strong>
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

                    {/* =========================
                        STATUS
                    ========================= */}

                    <div className="status-control">

                        <label>
                            Update Status
                        </label>

                        <select
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

                    </div>

                </div>

            </div>

            {/* =========================
                REPLY SECTION
            ========================= */}

            {ticket.status !== "Closed" && (

                <div className="ticket-reply-section">

                    <h2>
                        Reply to Customer
                    </h2>

                    {error && (
                        <p className="ticket-error">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="ticket-success">
                            {success}
                        </p>
                    )}

                    <form onSubmit={handleReply}>

                        <textarea
                            value={reply}
                            onChange={(e) =>
                                setReply(e.target.value)
                            }
                            placeholder="Type your reply to the customer..."
                            rows="5"
                        />

                        <button
                            type="submit"
                            disabled={replyLoading}
                        >
                            {replyLoading
                                ? "Sending..."
                                : "Send Reply"}
                        </button>

                    </form>

                </div>

            )}

            {ticket.status === "Closed" && (

                <div className="closed-ticket-message">

                    <strong>
                        This ticket is closed.
                    </strong>

                    <p>
                        No further replies can be sent.
                    </p>

                </div>

            )}

        </div>
    );
}

export default SupportTicketDetail;