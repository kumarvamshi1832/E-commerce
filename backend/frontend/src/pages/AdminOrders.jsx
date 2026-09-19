import { useEffect, useState } from "react";
import api from "../services/api";
import AdminExportActions from "../components/AdminExportActions";
import "./AdminOrders.css";

function AdminOrders() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchOrders = async () => {

        const token = localStorage.getItem("token");

        try {

            const response = await api.get(
                "admin/orders/",
                {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                }
            );

            setOrders(response.data);

        } catch (error) {

            console.log(error);

        }

        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="admin-orders-page">
                <h2>Loading orders...</h2>
            </div>
        );
    }

    const viewOrder = async (orderId) => {

        const token = localStorage.getItem("token");

        try {

            const response = await api.get(
                `admin/orders/${orderId}/`,
                {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                }
            );

            setSelectedOrder(response.data);

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.error ||
                "Unable to load order details."
            );
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {

        const token = localStorage.getItem("token");

        setUpdatingStatus(true);

        try {

            const response = await api.patch(
                `admin/orders/${orderId}/status/`,
                {
                    status: newStatus
                },
                {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                }
            );

            setSelectedOrder((previousOrder) => ({
                ...previousOrder,
                status: response.data.status
            }));

            setOrders((previousOrders) =>
                previousOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            status: response.data.status
                        }
                        : order
                )
            );

            alert("Order status updated successfully.");

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.error ||
                "Unable to update order status."
            );

        } finally {

            setUpdatingStatus(false);

        }
    };

    const exportColumns = [
        {
            label: "Order ID",
            key: "id"
        },
        {
            label: "Customer",
            key: "customer"
        },
        {
            label: "Email",
            key: "email"
        },
        {
            label: "Date",
            key: "date"
        },
        {
            label: "Amount",
            key: "amount"
        },
        {
            label: "Status",
            key: "status"
        }
    ];

    const exportData = orders.map((order) => ({
        id: `#${order.id}`,
        customer: order.user.username,
        email: order.user.email,
        date: new Date(
            order.created_at
        ).toLocaleDateString("en-IN"),
        amount: `₹${Number(
            order.total_amount
        ).toLocaleString("en-IN")}`,
        status: order.status
    }));

    return (
        <div className="admin-orders-page">

            <div className="admin-orders-header">

                <div>
                    <h1>Orders</h1>
                    <p>Manage customer orders and order status</p>
                </div>

                <AdminExportActions
                    title="Orders"
                    columns={exportColumns}
                    data={exportData}
                    filename="mystore-orders"
                />

            </div>

            <div className="orders-table-container">

                <table className="orders-table">

                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Email</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {orders.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="7"
                                    className="no-orders"
                                >
                                    No orders found.
                                </td>
                            </tr>

                        ) : (

                            orders.map((order) => (

                                <tr key={order.id}>

                                    <td>
                                        <strong>
                                            #{order.id}
                                        </strong>
                                    </td>

                                    <td>
                                        {order.user.username}
                                    </td>

                                    <td>
                                        {order.user.email}
                                    </td>

                                    <td>
                                        {new Date(
                                            order.created_at
                                        ).toLocaleDateString("en-IN")}
                                    </td>

                                    <td className="order-amount">
                                        ₹
                                        {Number(
                                            order.total_amount
                                        ).toLocaleString("en-IN")}
                                    </td>

                                    <td>
                                        <span
                                            className={`order-status ${order.status.toLowerCase()}`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>

                                    <td>

                                        <button
                                            className="view-order-btn"
                                            onClick={() =>
                                                viewOrder(order.id)
                                            }
                                        >
                                            View
                                        </button>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

                {selectedOrder && (
                    <div className="order-details-overlay">

                        <div className="order-details-modal">

                            <div className="order-details-header">

                                <div>
                                    <h2>
                                        Order #{selectedOrder.id}
                                    </h2>

                                    <p>
                                        {new Date(
                                            selectedOrder.created_at
                                        ).toLocaleString("en-IN")}
                                    </p>
                                </div>

                                <button
                                    className="close-order-btn"
                                    onClick={() =>
                                        setSelectedOrder(null)
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            <div className="customer-details">

                                <h3>Customer</h3>

                                <p>
                                    <strong>Name:</strong>{" "}
                                    {selectedOrder.user.username}
                                </p>

                                <p>
                                    <strong>Email:</strong>{" "}
                                    {selectedOrder.user.email}
                                </p>

                            </div>

                            <div className="order-items">

                                <h3>Products</h3>

                                {selectedOrder.items.map((item) => (

                                    <div
                                        className="order-item"
                                        key={item.id}
                                    >

                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.product_name}
                                            />
                                        ) : (
                                            <div className="order-item-no-image">
                                                No Image
                                            </div>
                                        )}

                                        <div className="order-item-info">

                                            <strong>
                                                {item.product_name}
                                            </strong>

                                            <span>
                                                ₹
                                                {Number(
                                                    item.price
                                                ).toLocaleString("en-IN")}
                                                {" × "}
                                                {item.quantity}
                                            </span>

                                        </div>

                                        <strong>
                                            ₹
                                            {Number(
                                                item.subtotal
                                            ).toLocaleString("en-IN")}
                                        </strong>

                                    </div>

                                ))}

                            </div>

                            <div className="order-total">

                                <span>Total</span>

                                <strong>
                                    ₹
                                    {Number(
                                        selectedOrder.total_amount
                                    ).toLocaleString("en-IN")}
                                </strong>

                            </div>

                            <div className="current-order-status">

                                <span>Status</span>

                                <select
                                    className="order-status-select"
                                    value={selectedOrder.status}
                                    onChange={(event) =>
                                        updateOrderStatus(
                                            selectedOrder.id,
                                            event.target.value
                                        )
                                    }
                                    disabled={updatingStatus}
                                >

                                    <option value="Pending">
                                        Pending
                                    </option>

                                    <option value="Confirmed">
                                        Confirmed
                                    </option>

                                    <option value="Shipped">
                                        Shipped
                                    </option>

                                    <option value="Delivered">
                                        Delivered
                                    </option>

                                    <option value="Cancelled">
                                        Cancelled
                                    </option>

                                </select>

                            </div>

                            <button
                                className="close-order-bottom-btn"
                                onClick={() =>
                                    setSelectedOrder(null)
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}

export default AdminOrders;
