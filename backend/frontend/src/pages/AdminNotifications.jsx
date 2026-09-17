import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminNotifications.css";

function AdminNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [customers, setCustomers] = useState([]);

    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [notificationType, setNotificationType] = useState("General");
    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchNotifications();
        fetchCustomers();
    }, []);

    const getHeaders = () => {
        const token = localStorage.getItem("token");

        return {
            headers: {
                Authorization: `Token ${token}`,
            },
        };
    };

    const fetchNotifications = async () => {
        try {
            const response = await api.get(
                "admin/notifications/",
                getHeaders()
            );

            setNotifications(response.data);
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.error ||
                "Unable to load notifications."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await api.get(
                "admin/notifications/customers/",
                getHeaders()
            );

            setCustomers(response.data);
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.error ||
                "Unable to load customers."
            );
        }
    };

    const sendNotification = async () => {
        if (!selectedCustomer) {
            alert("Please select a customer.");
            return;
        }

        if (!message.trim()) {
            alert("Message cannot be empty.");
            return;
        }

        setSending(true);

        try {
            const requestData = {
                message: message.trim(),
                notification_type: notificationType,
            };

            if (selectedCustomer === "all") {
                requestData.send_to = "all";
            } else {
                requestData.user_id = Number(selectedCustomer);
            }

            const response = await api.post(
                "admin/notifications/create/",
                requestData,
                getHeaders()
            );

            if (selectedCustomer === "all") {
                const newNotifications =
                    response.data.notifications.map(
                        (notification) => ({
                            id: notification.id,

                            customer: {
                                id: notification.user_id,
                                username: notification.username,
                                email: notification.email,
                            },

                            message: notification.message,

                            notification_type:
                                notification.notification_type,

                            is_read:
                                notification.is_read,

                            created_at:
                                notification.created_at,
                        })
                    );

                setNotifications((previous) => [
                    ...newNotifications,
                    ...previous,
                ]);

                alert(
                    `Notification sent to ${response.data.count} customers successfully.`
                );
            } else {
                const newNotification = {
                    id: response.data.notification.id,

                    customer: {
                        id: response.data.notification.user_id,
                        username:
                            response.data.notification.username,
                        email:
                            response.data.notification.email,
                    },

                    message:
                        response.data.notification.message,

                    notification_type:
                        response.data.notification
                            .notification_type,

                    is_read:
                        response.data.notification.is_read,

                    created_at:
                        response.data.notification.created_at,
                };

                setNotifications((previous) => [
                    newNotification,
                    ...previous,
                ]);

                alert(
                    "Notification sent successfully."
                );
            }

            setSelectedCustomer("");
            setNotificationType("General");
            setMessage("");

        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.error ||
                "Unable to send notification."
            );
        } finally {
            setSending(false);
        }
    };

    const getTypeClass = (type) => {
        if (type === "Order") {
            return "notification-order";
        }

        if (type === "Product") {
            return "notification-product";
        }

        if (type === "Support") {
            return "notification-support";
        }

        return "notification-general";
    };

    if (loading) {
        return (
            <div className="admin-notifications-page">
                <div className="notifications-loading">
                    Loading notifications...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-notifications-page">

            <div className="notifications-header">

                <div>
                    <h1>Notifications</h1>

                    <p>
                        Send and manage customer notifications.
                    </p>
                </div>

                <div className="notification-count">
                    {notifications.length} Notifications
                </div>

            </div>

            <div className="notification-layout">

                <div className="send-notification-card">

                    <div className="card-heading">
                        <h2>Send Notification</h2>

                        <p>
                            Send an in-app message to a customer.
                        </p>
                    </div>

                    <div className="notification-form">

                        <div className="form-group">

                            <label>
                                Send To
                            </label>

                            <select
                                value={selectedCustomer}
                                onChange={(event) =>
                                    setSelectedCustomer(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Select Customer
                                </option>

                                <option value="all">
                                    All Users
                                </option>

                                {customers.map((customer) => (
                                    <option
                                        key={customer.id}
                                        value={customer.id}
                                    >
                                        {customer.username} -{" "}
                                        {customer.email}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <div className="form-group">

                            <label>
                                Notification Type
                            </label>

                            <select
                                value={notificationType}
                                onChange={(event) =>
                                    setNotificationType(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="General">
                                    General
                                </option>

                                <option value="Order">
                                    Order
                                </option>

                                <option value="Product">
                                    Product
                                </option>

                                <option value="Support">
                                    Support
                                </option>

                            </select>

                        </div>

                        <div className="form-group">

                            <label>
                                Message
                            </label>

                            <textarea
                                rows="5"
                                value={message}
                                onChange={(event) =>
                                    setMessage(
                                        event.target.value
                                    )
                                }
                                placeholder="Write notification message..."
                            />

                        </div>

                        <button
                            className="send-notification-btn"
                            onClick={sendNotification}
                            disabled={sending}
                        >
                            {sending
                                ? "Sending..."
                                : "Send Notification"}
                        </button>

                    </div>

                </div>

                <div className="notification-history-card">

                    <div className="card-heading">

                        <div>
                            <h2>
                                Notification History
                            </h2>

                            <p>
                                Recently sent customer notifications.
                            </p>
                        </div>

                    </div>

                    {notifications.length === 0 ? (
                        <div className="no-notifications">
                            <h3>No Notifications</h3>

                            <p>
                                Sent notifications will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="notification-list">

                            {notifications.map(
                                (notification) => (

                                    <div
                                        className={`notification-item ${
                                            !notification.is_read
                                                ? "unread-notification"
                                                : ""
                                        }`}
                                        key={notification.id}
                                    >

                                        <div className="notification-icon">
                                            🔔
                                        </div>

                                        <div className="notification-main">

                                            <div className="notification-top">

                                                <div className="notification-customer">

                                                    <strong>
                                                        {
                                                            notification
                                                                .customer
                                                                .username
                                                        }
                                                    </strong>

                                                    <span className="notification-email">
                                                        {
                                                            notification
                                                                .customer
                                                                .email
                                                        }
                                                    </span>

                                                </div>

                                                <span
                                                    className={`notification-type ${getTypeClass(
                                                        notification
                                                            .notification_type
                                                    )}`}
                                                >
                                                    {
                                                        notification
                                                            .notification_type
                                                    }
                                                </span>

                                            </div>

                                            <p>
                                                {
                                                    notification.message
                                                }
                                            </p>

                                            <div className="notification-meta">

                                                <span>
                                                    {new Date(
                                                        notification.created_at
                                                    ).toLocaleDateString(
                                                        "en-IN"
                                                    )}
                                                </span>

                                                <span>
                                                    {new Date(
                                                        notification.created_at
                                                    ).toLocaleTimeString(
                                                        "en-IN",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </span>

                                                <span
                                                    className={
                                                        notification.is_read
                                                            ? "read-status"
                                                            : "unread-status"
                                                    }
                                                >
                                                    {
                                                        notification.is_read
                                                            ? "Read"
                                                            : "Unread"
                                                    }
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}

export default AdminNotifications;