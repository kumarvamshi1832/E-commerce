import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./SupportDashboard.css";


function SupportDashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [tickets, setTickets] = useState([]);

    const [loading, setLoading] = useState(true);
    const [ticketsLoading, setTicketsLoading] = useState(false);

    const [error, setError] = useState("");

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));


    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        navigate("/login");
    };


    // =========================
    // FETCH DASHBOARD
    // =========================

    const fetchDashboard = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "support/dashboard/"
            );

            setDashboard(response.data);

        } catch (error) {

            setError(
                error.response?.data?.error ||
                "Unable to load support dashboard."
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================
    // FETCH TICKETS
    // =========================

    const fetchTickets = async (
        category = "",
        status = ""
    ) => {

        try {

            setTicketsLoading(true);
            setError("");

            let url = "support/dashboard/tickets/";

            const params = [];


            // CATEGORY FILTER

            if (category) {

                params.push(
                    `category=${encodeURIComponent(category)}`
                );
            }


            // STATUS FILTER

            if (status) {

                params.push(
                    `status=${encodeURIComponent(status)}`
                );
            }


            // ADD QUERY PARAMETERS

            if (params.length > 0) {

                url += `?${params.join("&")}`;
            }


            const response = await api.get(url);

            setTickets(
                response.data.tickets || []
            );

        } catch (error) {

            setError(
                error.response?.data?.error ||
                "Unable to load support tickets."
            );

        } finally {

            setTicketsLoading(false);
        }
    };


    // =========================
    // LOAD DATA
    // =========================

    useEffect(() => {

        fetchDashboard();
        fetchTickets();

    }, []);


    // =========================
    // ALL TICKETS
    // =========================

    const handleAllTickets = () => {

        setSelectedCategory("");
        setSelectedStatus("");

        fetchTickets();
    };


    // =========================
    // STATUS FILTER
    // =========================

    const handleStatusClick = (status) => {

        setSelectedStatus(status);
        setSelectedCategory("");

        fetchTickets("", status);
    };


    // =========================
    // CATEGORY FILTER
    // =========================

    const handleCategoryClick = (category) => {

        setSelectedCategory(category);
        setSelectedStatus("");

        fetchTickets(category, "");
    };


    // =========================
    // LOADING DASHBOARD
    // =========================

    if (loading) {

        return (
            <div className="support-dashboard">

                <h1>
                    Support Dashboard
                </h1>

                <p>
                    Loading dashboard...
                </p>

            </div>
        );
    }


    // =========================
    // ERROR
    // =========================

    if (error && !dashboard) {

        return (
            <div className="support-dashboard">

                <h1>
                    Support Dashboard
                </h1>

                <p className="dashboard-error">
                    {error}
                </p>

            </div>
        );
    }


    // =========================
    // RETURN
    // =========================

    return (

        <div className="support-dashboard">


            {/* =========================
                PROFILE SIDEBAR
            ========================= */}

            {profileOpen && (

                <>

                    <div
                        className="profile-overlay"
                        onClick={() =>
                            setProfileOpen(false)
                        }
                    ></div>


                    <div className="staff-sidebar">


                        {/* SIDEBAR HEADER */}

                        <div className="staff-sidebar-header">

                            <h2>
                                Staff Profile
                            </h2>

                            <button
                                className="close-sidebar-button"
                                onClick={() =>
                                    setProfileOpen(false)
                                }
                            >
                                ✕
                            </button>

                        </div>


                        {/* PROFILE */}

                        <div className="staff-profile-section">

                            <div className="large-profile-icon">
                                👤
                            </div>

                            <h3>
                                {user?.username || "Staff"}
                            </h3>

                            <p>
                                {user?.email ||
                                    "No email available"}
                            </p>

                        </div>


                        {/* STAFF INFORMATION */}

                        <div className="staff-info-section">


                            <div className="staff-info-item">

                                <span className="staff-info-label">
                                    👤 Profile
                                </span>

                                <strong>
                                    {user?.username ||
                                        "Staff"}
                                </strong>

                            </div>


                            <div className="staff-info-item">

                                <span className="staff-info-label">
                                    🛠 Role
                                </span>

                                <strong>
                                    Support Staff
                                </strong>

                            </div>


                            <div className="staff-info-item">

                                <span className="staff-info-label">
                                    📧 Email
                                </span>

                                <strong>
                                    {user?.email ||
                                        "No email"}
                                </strong>

                            </div>


                        </div>


                        {/* SIDEBAR MENU */}

                        <div className="staff-sidebar-menu">


                            <button
                                onClick={() => {

                                    setProfileOpen(false);

                                    handleAllTickets();

                                    navigate(
                                        "/support-dashboard"
                                    );

                                }}
                            >
                                📊 Dashboard
                            </button>


                            <button
                                onClick={() => {

                                    setProfileOpen(false);

                                    window.scrollTo({
                                        top:
                                            document.body
                                                .scrollHeight,
                                        behavior:
                                            "smooth"
                                    });

                                }}
                            >
                                🎫 Support Tickets
                            </button>


                        </div>


                        {/* LOGOUT */}

                        <div className="staff-sidebar-logout">

                            <button
                                onClick={handleLogout}
                            >
                                🚪 Logout
                            </button>

                        </div>


                    </div>

                </>
            )}


            {/* =========================
                HEADER
            ========================= */}

            <div className="dashboard-header">


                <div className="dashboard-title">

                    <h1>
                        Support Dashboard
                    </h1>

                    <p>
                        Manage customer support tickets
                    </p>

                </div>


                {/* PROFILE BUTTON */}

                <button
                    className="staff-profile-button"
                    onClick={() =>
                        setProfileOpen(true)
                    }
                >

                    <span className="staff-profile-icon">
                        👤
                    </span>

                    <span className="staff-profile-name">
                        {user?.username || "Staff"}
                    </span>

                </button>


            </div>


            {/* =========================
                ERROR MESSAGE
            ========================= */}

            {error && (

                <p className="dashboard-error">
                    {error}
                </p>

            )}


            {/* =========================
                SUMMARY CARDS
            ========================= */}

            <div className="dashboard-cards">


                {/* TOTAL */}

                <div
                    className={
                        `dashboard-card total ${
                            selectedStatus === ""
                                && selectedCategory === ""
                                ? "selected-dashboard-card"
                                : ""
                        }`
                    }
                    onClick={handleAllTickets}
                >

                    <h3>
                        Total Tickets
                    </h3>

                    <strong>
                        {dashboard?.total_tickets || 0}
                    </strong>

                </div>


                {/* OPEN */}

                <div
                    className={
                        `dashboard-card open ${
                            selectedStatus === "Open"
                                ? "selected-dashboard-card"
                                : ""
                        }`
                    }
                    onClick={() =>
                        handleStatusClick("Open")
                    }
                >

                    <h3>
                        Open
                    </h3>

                    <strong>
                        {dashboard?.open_tickets || 0}
                    </strong>

                </div>


                {/* IN PROGRESS */}

                <div
                    className={
                        `dashboard-card progress ${
                            selectedStatus ===
                            "In Progress"
                                ? "selected-dashboard-card"
                                : ""
                        }`
                    }
                    onClick={() =>
                        handleStatusClick(
                            "In Progress"
                        )
                    }
                >

                    <h3>
                        In Progress
                    </h3>

                    <strong>
                        {dashboard?.in_progress_tickets ||
                            0}
                    </strong>

                </div>


                {/* RESOLVED */}

                <div
                    className={
                        `dashboard-card resolved ${
                            selectedStatus ===
                            "Resolved"
                                ? "selected-dashboard-card"
                                : ""
                        }`
                    }
                    onClick={() =>
                        handleStatusClick(
                            "Resolved"
                        )
                    }
                >

                    <h3>
                        Resolved
                    </h3>

                    <strong>
                        {dashboard?.resolved_tickets ||
                            0}
                    </strong>

                </div>


                {/* CLOSED */}

                <div
                    className={
                        `dashboard-card closed ${
                            selectedStatus ===
                            "Closed"
                                ? "selected-dashboard-card"
                                : ""
                        }`
                    }
                    onClick={() =>
                        handleStatusClick(
                            "Closed"
                        )
                    }
                >

                    <h3>
                        Closed
                    </h3>

                    <strong>
                        {dashboard?.closed_tickets ||
                            0}
                    </strong>

                </div>


            </div>


            {/* =========================
                ALL TICKETS BUTTON
            ========================= */}

            <div className="category-filter-section">

                <button
                    className={
                        selectedCategory === "" &&
                        selectedStatus === ""
                            ? "category-filter active"
                            : "category-filter"
                    }
                    onClick={handleAllTickets}
                >
                    All Tickets
                </button>

            </div>


            {/* =========================
                CATEGORY SECTION
            ========================= */}

            <div className="dashboard-category-section">


                <h2>
                    Ticket Categories
                </h2>


                <div className="category-grid">


                    {dashboard?.categories &&

                        Object.entries(
                            dashboard.categories
                        ).map(
                            ([category, count]) => (

                                <div
                                    className={
                                        selectedCategory ===
                                        category
                                            ? "category-card selected-category"
                                            : "category-card"
                                    }
                                    key={category}
                                    onClick={() =>
                                        handleCategoryClick(
                                            category
                                        )
                                    }
                                >

                                    <span>
                                        {category}
                                    </span>

                                    <strong>
                                        {count}
                                    </strong>

                                </div>

                            )
                        )

                    }


                </div>

            </div>


            {/* =========================
                TICKETS SECTION
            ========================= */}

            <div className="dashboard-tickets-section">


                <div className="tickets-section-header">

                    <h2>

                        {selectedStatus

                            ? `${selectedStatus} Tickets`

                            : selectedCategory

                            ? `${selectedCategory} Tickets`

                            : "All Support Tickets"

                        }

                    </h2>


                    <span>
                        {tickets.length} Tickets
                    </span>

                </div>


                {/* =========================
                    LOADING
                ========================= */}

                {ticketsLoading ? (

                    <div className="tickets-loading">

                        <p>
                            Loading tickets...
                        </p>

                    </div>

                ) : tickets.length === 0 ? (


                    /* =========================
                       NO TICKETS
                    ========================= */

                    <div className="no-dashboard-tickets">

                        <p>
                            No tickets found.
                        </p>

                    </div>

                ) : (


                    /* =========================
                       TICKET LIST
                    ========================= */

                    <div className="dashboard-ticket-list">


                        {tickets.map(
                            (ticket) => (

                                <div
                                    className="dashboard-ticket-card"
                                    key={ticket.id}
                                >


                                    {/* =========================
                                        TICKET TOP
                                    ========================= */}

                                    <div className="dashboard-ticket-top">


                                        <div>

                                            <span className="dashboard-ticket-id">
                                                Ticket #{ticket.id}
                                            </span>

                                            <h3>
                                                {ticket.subject}
                                            </h3>

                                        </div>


                                        <span
                                            className={
                                                `dashboard-ticket-status status-${ticket.status
                                                    .toLowerCase()
                                                    .replace(
                                                        /\s+/g,
                                                        "-"
                                                    )}`
                                            }
                                        >
                                            {ticket.status}
                                        </span>


                                    </div>


                                    {/* =========================
                                        CUSTOMER INFO
                                    ========================= */}

                                    <div className="dashboard-ticket-info">


                                        <span>
                                            Customer:{" "}
                                            {ticket.customer_username}
                                        </span>


                                        <span>
                                            Email:{" "}
                                            {ticket.customer_email}
                                        </span>


                                        <span>
                                            Category:{" "}
                                            {ticket.category}
                                        </span>


                                        {ticket.order_id && (

                                            <span>
                                                Order: #
                                                {ticket.order_id}
                                            </span>

                                        )}


                                    </div>


                                    {/* =========================
                                        DESCRIPTION
                                    ========================= */}

                                    <div className="dashboard-ticket-description">

                                        <strong>
                                            Issue
                                        </strong>

                                        <p>
                                            {ticket.description}
                                        </p>

                                    </div>


                                    {/* =========================
                                        DATE
                                    ========================= */}

                                    <div className="dashboard-ticket-date">

                                        <span>

                                            Created:{" "}

                                            {new Date(
                                                ticket.created_at
                                            ).toLocaleString()}

                                        </span>

                                    </div>


                                    {/* =========================
                                        ADMIN REPLY
                                    ========================= */}

                                    {ticket.admin_reply && (

                                        <div className="dashboard-ticket-reply">

                                            <strong>
                                                Latest Reply
                                            </strong>

                                            <p>
                                                {ticket.admin_reply}
                                            </p>

                                        </div>

                                    )}


                                    {/* =========================
                                        VIEW TICKET
                                    ========================= */}

                                    <button
                                        className="open-ticket-button"
                                        onClick={() =>
                                            navigate(
                                                `/support-dashboard/tickets/${ticket.id}`
                                            )
                                        }
                                    >
                                        View Ticket →
                                    </button>


                                </div>

                            )
                        )}


                    </div>

                )}


            </div>


        </div>
    );
}


export default SupportDashboard;