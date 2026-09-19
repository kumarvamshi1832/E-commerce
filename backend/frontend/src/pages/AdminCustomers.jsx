import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminCustomers.css";
import AdminExportActions from "../components/AdminExportActions";

function AdminCustomers() {

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const fetchCustomers = async () => {

        const token = localStorage.getItem("token");

        try {

            const response = await api.get(
                "admin/customers/",
                {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                }
            );

            setCustomers(response.data);

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.error ||
                "Unable to load customers."
            );

        }

        setLoading(false);
    };

const viewCustomer = async (customerId) => {

    const token = localStorage.getItem("token");

    try {

        const response = await api.get(
            `admin/customers/${customerId}/`,
            {
                headers: {
                    Authorization: `Token ${token}`
                }
            }
        );

        setSelectedCustomer(response.data);

    } catch (error) {

        console.log(error);

        alert(
            error.response?.data?.error ||
            "Unable to load customer details."
        );
    }
};

    useEffect(() => {
        fetchCustomers();
    }, []);

    if (loading) {
        return (
            <div className="admin-customers-page">
                <h2>Loading customers...</h2>
            </div>
        );
    }

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
        label: "Joined",
        key: "joined"
    },
    {
        label: "Orders",
        key: "orders"
    },
    {
        label: "Status",
        key: "status"
    }
];

const exportData = customers.map((customer) => ({
    customer: customer.username,
    email: customer.email || "—",
    joined: new Date(
        customer.date_joined
    ).toLocaleDateString("en-IN"),
    orders: customer.order_count,
    status: customer.is_active
        ? "Active"
        : "Inactive"
}));

    return (
        <div className="admin-customers-page">

            <div className="admin-customers-header">

    <div>
        <h1>Customers</h1>

        <p>
            Manage registered customers and their orders
        </p>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        <AdminExportActions
            title="Customers"
            columns={exportColumns}
            data={exportData}
            filename="mystore-customers"
        />

        <div className="customer-count">
            {customers.length} Customers
        </div>

    </div>

</div>
            <div className="customers-table-container">

                <table className="customers-table">

                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Email</th>
                            <th>Joined</th>
                            <th>Orders</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        {customers.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="6"
                                    className="no-customers"
                                >
                                    No customers found.
                                </td>
                            </tr>

                        ) : (

                            customers.map((customer) => (

                                <tr key={customer.id}>

                                    <td>

                                        <div className="customer-info">

                                            <div className="customer-avatar">
                                                {customer.username
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div>
                                                <strong>
                                                    {customer.username}
                                                </strong>

                                                {(customer.first_name ||
                                                    customer.last_name) && (
                                                    <span>
                                                        {customer.first_name}{" "}
                                                        {customer.last_name}
                                                    </span>
                                                )}
                                            </div>

                                        </div>

                                    </td>

                                    <td>
                                        {customer.email || "—"}
                                    </td>

                                    <td>
                                        {new Date(
                                            customer.date_joined
                                        ).toLocaleDateString("en-IN")}
                                    </td>

                                    <td>
                                        <span className="customer-orders">
                                            {customer.order_count}
                                        </span>
                                    </td>

                                    <td>

                                        <span
                                            className={`customer-status ${
                                                customer.is_active
                                                    ? "active"
                                                    : "inactive"
                                            }`}
                                        >
                                            {customer.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>

                                    </td>

                                    <td>

                                        <button
    className="view-customer-btn"
    onClick={() => viewCustomer(customer.id)}
>
    View
</button>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

                {selectedCustomer && (

    <div className="customer-details-overlay">

        <div className="customer-details-modal">

            <div className="customer-details-header">

                <div>
                    <h2>
                        Customer Details
                    </h2>

                    <p>
                        Customer ID #{selectedCustomer.id}
                    </p>
                </div>

                <button
                    className="close-customer-btn"
                    onClick={() => setSelectedCustomer(null)}
                >
                    ×
                </button>

            </div>


            <div className="customer-profile">

                <div className="large-customer-avatar">
                    {selectedCustomer.username
                        .charAt(0)
                        .toUpperCase()}
                </div>

                <div>

                    <h3>
                        {selectedCustomer.username}
                    </h3>

                    <p>
                        {selectedCustomer.email || "No email"}
                    </p>

                </div>

            </div>


            <div className="customer-summary">

                <div className="customer-summary-card">

                    <span>Total Orders</span>

                    <strong>
                        {selectedCustomer.order_count}
                    </strong>

                </div>


                <div className="customer-summary-card">

                    <span>Total Spent</span>

                    <strong>
                        ₹
                        {Number(
                            selectedCustomer.total_spent
                        ).toLocaleString("en-IN")}
                    </strong>

                </div>


                <div className="customer-summary-card">

                    <span>Status</span>

                    <strong>
                        {selectedCustomer.is_active
                            ? "Active"
                            : "Inactive"}
                    </strong>

                </div>

            </div>


            <div className="customer-account-info">

                <h3>
                    Account Information
                </h3>

                <p>
                    <strong>Email:</strong>{" "}
                    {selectedCustomer.email || "—"}
                </p>

                <p>
                    <strong>Joined:</strong>{" "}
                    {new Date(
                        selectedCustomer.date_joined
                    ).toLocaleDateString("en-IN")}
                </p>

            </div>


            <div className="customer-order-history">

                <h3>
                    Order History
                </h3>

                {selectedCustomer.orders.length === 0 ? (

                    <p className="no-customer-orders">
                        This customer has not placed any orders yet.
                    </p>

                ) : (

                    <div className="customer-orders-list">

                        {selectedCustomer.orders.map((order) => (

                            <div
                                className="customer-order-row"
                                key={order.id}
                            >

                                <div>

                                    <strong>
                                        Order #{order.id}
                                    </strong>

                                    <span>
                                        {new Date(
                                            order.created_at
                                        ).toLocaleDateString("en-IN")}
                                    </span>

                                </div>

                                <div>

                                    <strong>
                                        ₹
                                        {Number(
                                            order.total_amount
                                        ).toLocaleString("en-IN")}
                                    </strong>

                                    <span
                                        className={`customer-order-status ${order.status.toLowerCase()}`}
                                    >
                                        {order.status}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>


            <button
                className="close-customer-bottom-btn"
                onClick={() => setSelectedCustomer(null)}
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

export default AdminCustomers;