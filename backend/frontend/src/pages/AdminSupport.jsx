import { useEffect, useState } from "react";
import api from "../services/api";
import AdminExportActions from "../components/AdminExportActions";
import "./AdminSupport.css";

function AdminSupport() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [reply, setReply] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        const token = localStorage.getItem("token");

        try {
            const response = await api.get(
                "admin/support/",
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            setFeedbacks(response.data);
        } catch (error) {
            console.log(error);
            alert(
                error.response?.data?.error ||
                "Unable to load support tickets."
            );
        } finally {
            setLoading(false);
        }
    };

    const openFeedback = async (feedbackId) => {
        const token = localStorage.getItem("token");

        try {
            const response = await api.get(
                `admin/support/${feedbackId}/`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            setSelectedFeedback(response.data);
            setReply(response.data.admin_reply || "");
            setNewStatus(response.data.status);

        } catch (error) {
            console.log(error);
            alert(
                error.response?.data?.error ||
                "Unable to load support details."
            );
        }
    };

    const sendReply = async () => {
        if (!reply.trim()) {
            alert("Reply cannot be empty.");
            return;
        }

        const token = localStorage.getItem("token");

        setUpdating(true);

        try {
            const response = await api.patch(
                `admin/support/${selectedFeedback.id}/reply/`,
                {
                    admin_reply: reply,
                },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            setSelectedFeedback((previous) => ({
                ...previous,
                admin_reply: response.data.admin_reply,
                status: response.data.status,
                replied_at: response.data.replied_at,
            }));

            setFeedbacks((previous) =>
                previous.map((feedback) =>
                    feedback.id === selectedFeedback.id
                        ? {
                            ...feedback,
                            admin_reply: response.data.admin_reply,
                            status: response.data.status,
                            replied_at: response.data.replied_at,
                        }
                        : feedback
                )
            );

            setNewStatus(response.data.status);

            alert("Reply sent successfully.");

        } catch (error) {
            console.log(error);
            alert(
                error.response?.data?.error ||
                "Unable to send reply."
            );
        } finally {
            setUpdating(false);
        }
    };

    const updateStatus = async () => {
        if (!newStatus) {
            return;
        }

        const token = localStorage.getItem("token");

        setUpdating(true);

        try {
            const response = await api.patch(
                `admin/support/${selectedFeedback.id}/status/`,
                {
                    status: newStatus,
                },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            setSelectedFeedback((previous) => ({
                ...previous,
                status: response.data.status,
            }));

            setFeedbacks((previous) =>
                previous.map((feedback) =>
                    feedback.id === selectedFeedback.id
                        ? {
                            ...feedback,
                            status: response.data.status,
                        }
                        : feedback
                )
            );

            alert("Status updated successfully.");

        } catch (error) {
            console.log(error);
            alert(
                error.response?.data?.error ||
                "Unable to update status."
            );
        } finally {
            setUpdating(false);
        }
    };

    const getStatusClass = (status) => {
        if (status === "Pending") {
            return "status-pending";
        }

        if (status === "Replied") {
            return "status-replied";
        }

        if (status === "Closed") {
            return "status-closed";
        }

        return "";
    };

    const exportColumns = [
    {
        label: "Customer",
        key: "customer"
    },
    {
        label: "Email",
        key: "email"
    },
    {
        label: "Product",
        key: "product"
    },
    {
        label: "Feedback",
        key: "feedback"
    },
    {
        label: "Status",
        key: "status"
    },
    {
        label: "Date",
        key: "date"
    }
];

const exportData = feedbacks.map((feedback) => ({
    customer: feedback.customer.username,
    email: feedback.customer.email,
    product: feedback.product.name,
    feedback: feedback.feedback,
    status: feedback.status,
    date: new Date(
        feedback.created_at
    ).toLocaleDateString("en-IN")
}));

    if (loading) {
        return (
            <div className="admin-support-page">
                <div className="support-loading">
                    Loading support tickets...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-support-page">

            <div className="support-header">

    <div>
        <h1>Support</h1>

        <p>
            Manage customer feedback and support requests.
        </p>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        <AdminExportActions
            title="Support"
            columns={exportColumns}
            data={exportData}
            filename="mystore-support"
        />

        <div className="ticket-count">
            {feedbacks.length} Tickets
        </div>

    </div>

</div>
            <div className="support-table-card">

                {feedbacks.length === 0 ? (
                    <div className="no-support">
                        <h3>No Support Tickets</h3>
                        <p>
                            Customer support requests will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="support-table-wrapper">

                        <table className="support-table">

                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Feedback</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {feedbacks.map((feedback) => (
                                    <tr key={feedback.id}>

                                        <td>
                                            <div className="support-customer">
                                                <strong>
                                                    {feedback.customer.username}
                                                </strong>

                                                <span>
                                                    {feedback.customer.email}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="support-product">

                                                {feedback.product.image ? (
                                                    <img
                                                        src={feedback.product.image}
                                                        alt={feedback.product.name}
                                                    />
                                                ) : (
                                                    <div className="support-no-image">
                                                        No Image
                                                    </div>
                                                )}

                                                <span>
                                                    {feedback.product.name}
                                                </span>

                                            </div>
                                        </td>

                                        <td>
                                            <div className="feedback-preview">
                                                {feedback.feedback}
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={`support-status ${getStatusClass(
                                                    feedback.status
                                                )}`}
                                            >
                                                {feedback.status}
                                            </span>
                                        </td>

                                        <td>
                                            {new Date(
                                                feedback.created_at
                                            ).toLocaleDateString("en-IN")}
                                        </td>

                                        <td>
                                            <button
                                                className="view-ticket-btn"
                                                onClick={() =>
                                                    openFeedback(feedback.id)
                                                }
                                            >
                                                View
                                            </button>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {selectedFeedback && (
                <div className="support-modal-overlay">

                    <div className="support-modal">

                        <div className="support-modal-header">

                            <div>
                                <h2>Support Ticket</h2>
                                <p>
                                    Customer support request
                                </p>
                            </div>

                            <button
                                className="close-support-btn"
                                onClick={() => {
                                    setSelectedFeedback(null);
                                    setReply("");
                                }}
                            >
                                ×
                            </button>

                        </div>

                        <div className="support-modal-content">

                            <div className="support-info-grid">

                                <div className="support-info-box">
                                    <span>Customer</span>
                                    <strong>
                                        {selectedFeedback.customer.username}
                                    </strong>
                                </div>

                                <div className="support-info-box">
                                    <span>Email</span>
                                    <strong>
                                        {selectedFeedback.customer.email}
                                    </strong>
                                </div>

                                <div className="support-info-box">
                                    <span>Product</span>
                                    <strong>
                                        {selectedFeedback.product.name}
                                    </strong>
                                </div>

                                <div className="support-info-box">
                                    <span>Created</span>
                                    <strong>
                                        {new Date(
                                            selectedFeedback.created_at
                                        ).toLocaleDateString("en-IN")}
                                    </strong>
                                </div>

                            </div>

                            <div className="support-message-section">

                                <label>
                                    Customer Feedback
                                </label>

                                <div className="customer-feedback">
                                    {selectedFeedback.feedback}
                                </div>

                            </div>

                            <div className="support-message-section">

                                <label>
                                    Admin Reply
                                </label>

                                <textarea
                                    value={reply}
                                    onChange={(event) =>
                                        setReply(event.target.value)
                                    }
                                    placeholder="Write a reply to the customer..."
                                    rows="5"
                                />

                            </div>

                            <div className="support-status-section">

                                <div>
                                    <label>
                                        Status
                                    </label>

                                    <select
                                        value={newStatus}
                                        onChange={(event) =>
                                            setNewStatus(event.target.value)
                                        }
                                    >
                                        <option value="Pending">
                                            Pending
                                        </option>

                                        <option value="Replied">
                                            Replied
                                        </option>

                                        <option value="Closed">
                                            Closed
                                        </option>
                                    </select>
                                </div>

                                <button
                                    className="update-status-btn"
                                    onClick={updateStatus}
                                    disabled={updating}
                                >
                                    Update Status
                                </button>

                            </div>

                            {selectedFeedback.admin_reply && (
                                <div className="previous-reply">

                                    <span>
                                        Current Reply
                                    </span>

                                    <p>
                                        {selectedFeedback.admin_reply}
                                    </p>

                                    {selectedFeedback.replied_at && (
                                        <small>
                                            Replied on{" "}
                                            {new Date(
                                                selectedFeedback.replied_at
                                            ).toLocaleDateString("en-IN")}
                                        </small>
                                    )}

                                </div>
                            )}

                        </div>

                        <div className="support-modal-footer">

                            <button
                                className="cancel-support-btn"
                                onClick={() => {
                                    setSelectedFeedback(null);
                                    setReply("");
                                }}
                            >
                                Close
                            </button>

                            <button
                                className="send-reply-btn"
                                onClick={sendReply}
                                disabled={updating}
                            >
                                {updating
                                    ? "Sending..."
                                    : "Send Reply"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default AdminSupport;