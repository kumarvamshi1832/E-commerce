import { useEffect, useState } from "react";
import api from "../services/api";
import AdminExportActions from "../components/AdminExportActions";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const getHeaders = () => {
        const token = localStorage.getItem("token");

        return {
            headers: {
                Authorization: `Token ${token}`,
            },
        };
    };

    const fetchDashboard = async () => {
        try {
            const response = await api.get(
                "admin/dashboard/",
                getHeaders()
            );

            setDashboard(response.data);
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.error ||
                "Unable to load dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-dashboard-page">
                <div className="dashboard-loading">
                    Loading dashboard...
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="admin-dashboard-page">
                <div className="dashboard-empty">
                    Unable to load dashboard data.
                </div>
            </div>
        );
    }

    const summary = dashboard.summary;

    const exportColumns = [
        {
            label: "Order",
            key: "id",
        },
        {
            label: "Customer",
            key: "customer",
        },
        {
            label: "Email",
            key: "email",
        },
        {
            label: "Amount",
            key: "total_amount",
        },
        {
            label: "Status",
            key: "status",
        },
        {
            label: "Date",
            key: "created_at",
        },
    ];

    const exportData = dashboard.recent_orders.map((order) => ({
        ...order,
        id: `#${order.id}`,
        total_amount: `₹${order.total_amount.toLocaleString("en-IN")}`,
        created_at: new Date(
            order.created_at
        ).toLocaleDateString("en-IN"),
    }));

    return (
        <div className="admin-dashboard-page">

            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>

                    <p>
                        Overview of your e-commerce store.
                    </p>
                </div>
            </div>

            <div className="dashboard-cards">

                <div className="dashboard-card">
                    <div className="dashboard-card-icon">
                        📦
                    </div>

                    <div>
                        <span>Total Products</span>

                        <strong>
                            {summary.total_products}
                        </strong>
                        
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="dashboard-card-icon">
                        🛒
                    </div>

                    <div>
                        <span>Total Orders</span>

                        <strong>
                            {summary.total_orders}
                        </strong>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="dashboard-card-icon">
                        👥
                    </div>

                    <div>
                        <span>Total Customers</span>

                        <strong>
                            {summary.total_customers}
                        </strong>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="dashboard-card-icon">
                        💰
                    </div>

                    <div>
                        <span>Total Revenue</span>

                        <strong>
                            ₹
                            {summary.total_revenue.toLocaleString(
                                "en-IN"
                            )}
                        </strong>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="dashboard-card-icon">
                        ⏳
                    </div>

                    <div>
                        <span>Pending Orders</span>

                        <strong>
                            {summary.pending_orders}
                        </strong>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="dashboard-card-icon">
                        ⚠️
                    </div>

                    <div>
                        <span>Low Stock</span>

                        <strong>
                            {summary.low_stock_products}
                        </strong>
                    </div>
                </div>

            </div>

            <div className="dashboard-content">

                <div className="dashboard-section">

                    <div className="dashboard-section-header">

                        <div>
                            <h2>Recent Orders</h2>

                            <p>
                                Latest orders placed by customers.
                            </p>
                        </div>

                        <AdminExportActions
                            title="Recent Orders"
                            columns={exportColumns}
                            data={exportData}
                            filename="mystore-recent-orders"
                        />

                    </div>

                    {dashboard.recent_orders.length === 0 ? (
                        <div className="dashboard-no-data">
                            No orders found.
                        </div>
                    ) : (
                        <div className="dashboard-table-wrapper">

                            <table className="dashboard-table">

                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {dashboard.recent_orders.map(
                                        (order) => (
                                            <tr key={order.id}>

                                                <td>
                                                    <strong>
                                                        #{order.id}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <div className="dashboard-customer">
                                                        <strong>
                                                            {order.customer}
                                                        </strong>

                                                        <span>
                                                            {order.email}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    ₹
                                                    {order.total_amount.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`dashboard-order-status ${order.status
                                                            .toLowerCase()
                                                            .replace(
                                                                " ",
                                                                "-"
                                                            )}`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>

                                                <td>
                                                    {new Date(
                                                        order.created_at
                                                    ).toLocaleDateString(
                                                        "en-IN"
                                                    )}
                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>

                <div className="dashboard-section">

                    <div className="dashboard-section-header">

                        <div>
                            <h2>Inventory Alerts</h2>

                            <p>
                                Products that need stock attention.
                            </p>
                        </div>

                    </div>

                    {dashboard.low_stock.length === 0 ? (
                        <div className="dashboard-no-data">
                            No stock alerts.
                        </div>
                    ) : (
                        <div className="inventory-alert-list">

                            {dashboard.low_stock.map(
                                (product) => (
                                    <div
                                        className="inventory-alert-item"
                                        key={product.id}
                                    >

                                        <div>
                                            <strong>
                                                {product.name}
                                            </strong>

                                            <span>
                                                {product.is_active
                                                    ? "Active Product"
                                                    : "Inactive Product"}
                                            </span>
                                        </div>

                                        <span
                                            className={
                                                product.stock === 0
                                                    ? "stock-alert out"
                                                    : "stock-alert low"
                                            }
                                        >
                                            {product.stock === 0
                                                ? "Out of Stock"
                                                : `${product.stock} left`}
                                        </span>

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

export default AdminDashboard;