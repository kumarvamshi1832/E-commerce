import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis
} from "recharts";
import api from "../services/api";
import "./SupportDashboard.css";

function SupportDashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [allTickets, setAllTickets] = useState([]);

    const [loading, setLoading] = useState(true);
    const [ticketsLoading, setTicketsLoading] = useState(false);

    const [error, setError] = useState("");

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [downloadOpen, setDownloadOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        navigate("/login");
    };


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


    const fetchTickets = async (
        category = "",
        status = ""
    ) => {

        try {

            setTicketsLoading(true);
            setError("");

            let url = "support/dashboard/tickets/";

            const params = [];

            if (category) {

                params.push(
                    `category=${encodeURIComponent(category)}`
                );
            }

            if (status) {

                params.push(
                    `status=${encodeURIComponent(status)}`
                );
            }

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

    const fetchAllTickets = async () => {

    try {

        const response = await api.get(
            "support/dashboard/tickets/"
        );

        setAllTickets(
            response.data.tickets || []
        );

    } catch (error) {

        console.log(
            "Unable to load ticket chart data:",
            error
        );

    }
};


    const filteredTickets = tickets.filter((ticket) => {

        const search = searchTerm
            .toLowerCase()
            .trim();

        if (!search) {
            return true;
        }

        if (/^\d+$/.test(search)) {

            return (
                String(ticket.id) === search ||
                String(ticket.order_id || "") === search
            );
        }

        return (
            ticket.subject
                ?.toLowerCase()
                .includes(search) ||

            ticket.customer_username
                ?.toLowerCase()
                .includes(search) ||

            ticket.customer_email
                ?.toLowerCase()
                .includes(search) ||

            ticket.category
                ?.toLowerCase()
                .includes(search) ||

            ticket.description
                ?.toLowerCase()
                .includes(search)
        );
    });


    useEffect(() => {

        fetchDashboard();
        fetchTickets();
        fetchAllTickets();

    }, []);


    const handleAllTickets = () => {

        setSelectedCategory("");
        setSelectedStatus("");

        fetchTickets();
    };


    const handleStatusClick = (status) => {

        setSelectedStatus(status);
        setSelectedCategory("");

        fetchTickets("", status);
    };


    const handleCategoryClick = (category) => {

        setSelectedCategory(category);
        setSelectedStatus("");

        fetchTickets(category, "");
    };


    const statusChartData = [
        {
            name: "Open",
            value: dashboard?.open_tickets || 0
        },
        {
            name: "In Progress",
            value: dashboard?.in_progress_tickets || 0
        },
        {
            name: "Resolved",
            value: dashboard?.resolved_tickets || 0
        },
        {
            name: "Closed",
            value: dashboard?.closed_tickets || 0
        }
    ];


    const categoryChartData = dashboard?.categories
        ? Object.entries(dashboard.categories).map(
            ([category, count]) => ({
                category,
                tickets: count
            })
        )
        : [];

    const ticketTrendData = (() => {

    const today = new Date();

    const data = [];

    for (let i = 6; i >= 0; i--) {

        const date = new Date(today);

        date.setDate(
            today.getDate() - i
        );

        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);

        nextDate.setDate(
            date.getDate() + 1
        );

        const count = allTickets.filter(
            (ticket) => {

                const ticketDate =
                    new Date(
                        ticket.created_at
                    );

                return (
                    ticketDate >= date &&
                    ticketDate < nextDate
                );

            }
        ).length;

        data.push({

            date: date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            ),

            tickets: count

        });

    }

    return data;

})();


    const statusColors = [
        "#f97316",
        "#2563eb",
        "#16a34a",
        "#64748b"
    ];


    const downloadCSV = () => {

        const headers = [
            "Ticket ID",
            "Customer",
            "Email",
            "Category",
            "Order ID",
            "Status",
            "Created"
        ];

        const rows = filteredTickets.map((ticket) => [

            ticket.id,

            ticket.customer_username || "",

            ticket.customer_email || "",

            ticket.category || "",

            ticket.order_id || "",

            ticket.status || "",

            new Date(
                ticket.created_at
            ).toLocaleString()

        ]);

        const csvContent = [
            headers,
            ...rows
        ]
            .map((row) =>
                row
                    .map((value) =>
                        `"${String(value).replace(
                            /"/g,
                            '""'
                        )}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob(
            [csvContent],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "support-tickets.csv";

        link.click();

        URL.revokeObjectURL(url);

        setDownloadOpen(false);
    };


    const downloadPDF = () => {

        const doc = new jsPDF();

        doc.setFontSize(16);

        doc.text(
            "Support Tickets",
            14,
            15
        );

        const tableData =
            filteredTickets.map(
                (ticket) => [

                    `#${ticket.id}`,

                    ticket.customer_username ||
                    "",

                    ticket.category ||
                    "",

                    ticket.status ||
                    "",

                    new Date(
                        ticket.created_at
                    ).toLocaleDateString()

                ]
            );

        autoTable(doc, {

            startY: 22,

            head: [
                [
                    "Ticket ID",
                    "Customer",
                    "Category",
                    "Status",
                    "Created"
                ]
            ],

            body: tableData,

            styles: {
                fontSize: 9,
                cellPadding: 3
            },

            headStyles: {
                fontSize: 9
            }

        });

        doc.save(
            "support-tickets.pdf"
        );

        setDownloadOpen(false);
    };


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


    return (

        <div className="support-dashboard">


            {profileOpen && (

                <>

                    <div
                        className="profile-overlay"
                        onClick={() =>
                            setProfileOpen(false)
                        }
                    ></div>


                    <div className="staff-sidebar">

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


                        <div className="staff-profile-section">

                            <div className="large-profile-icon">
                                👤
                            </div>

                            <h3>
                                {user?.username ||
                                    "Staff"}
                            </h3>

                            <p>
                                {user?.email ||
                                    "No email available"}
                            </p>

                        </div>


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


                        <div className="staff-sidebar-menu">

                            <button
                                onClick={() => {

                                    setProfileOpen(
                                        false
                                    );

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

                                    setProfileOpen(
                                        false
                                    );

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


                        <div className="staff-sidebar-logout">

                            <button
                                onClick={
                                    handleLogout
                                }
                            >
                                🚪 Logout
                            </button>

                        </div>

                    </div>

                </>
            )}


            <div className="dashboard-header">

                <div className="dashboard-title">

                    <h1>
                        Support Dashboard
                    </h1>

                    <p>
                        Manage customer support tickets
                    </p>

                </div>


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
                        {user?.username ||
                            "Staff"}
                    </span>

                </button>

            </div>


            {error && (

                <p className="dashboard-error">
                    {error}
                </p>

            )}


            <div className="dashboard-cards">


                <div
                    className={
                        `dashboard-card total ${
                            selectedStatus === "" &&
                            selectedCategory === ""
                                ? "selected-dashboard-card"
                                : ""
                        }`
                    }
                    onClick={
                        handleAllTickets
                    }
                >

                    <h3>
                        Total Tickets
                    </h3>

                    <strong>
                        {dashboard?.total_tickets ||
                            0}
                    </strong>

                </div>


                <div
                    className={
                        `dashboard-card open ${
                            selectedStatus === "Open"
                                ? "selected-dashboard-card"
                                : ""
                        }`
                    }
                    onClick={() =>
                        handleStatusClick(
                            "Open"
                        )
                    }
                >

                    <h3>
                        Open
                    </h3>

                    <strong>
                        {dashboard?.open_tickets ||
                            0}
                    </strong>

                </div>


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


            <div className="category-filter-section">

                <button
                    className={
                        selectedCategory === "" &&
                        selectedStatus === ""
                            ? "category-filter active"
                            : "category-filter"
                    }
                    onClick={
                        handleAllTickets
                    }
                >
                    All Tickets
                </button>

            </div>


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


            <div className="support-charts-section">


                <div className="support-chart-card">

                    <div className="support-chart-header">

                        <div>

                            <h2>
                                Ticket Status
                            </h2>

                            <p>
                                Distribution of support tickets
                            </p>

                        </div>

                        <span>
                            {dashboard?.total_tickets ||
                                0} Total
                        </span>

                    </div>


                    <div className="support-pie-chart">

                        <ResponsiveContainer
                            width="100%"
                            height={330}
                        >

                            <PieChart>

                                <Pie
                                    data={
                                        statusChartData
                                    }
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="48%"
                                    outerRadius={105}
                                    innerRadius={55}
                                    paddingAngle={3}
                                    label={({
                                        name,
                                        percent
                                    }) =>
                                        `${name} ${(
                                            percent *
                                            100
                                        ).toFixed(1)}%`
                                    }
                                    labelLine={false}
                                >

                                    {statusChartData.map(
                                        (
                                            entry,
                                            index
                                        ) => (

                                            <Cell
                                                key={
                                                    `cell-${index}`
                                                }
                                                fill={
                                                    statusColors[
                                                        index
                                                    ]
                                                }
                                            />

                                        )
                                    )}

                                </Pie>


                                <Tooltip
                                    formatter={(
                                        value
                                    ) => [
                                        value,
                                        "Tickets"
                                    ]}
                                />


                                <Legend />

                            </PieChart>

                        </ResponsiveContainer>

                    </div>

                </div>


                <div className="support-chart-card">

                    <div className="support-chart-header">

                        <div>

                            <h2>
                                Tickets by Category
                            </h2>

                            <p>
                                Support tickets grouped by category
                            </p>

                        </div>

                        <span>
                            {categoryChartData.length ||
                                0} Categories
                        </span>

                    </div>


                    <div className="support-bar-chart">

                        <ResponsiveContainer
                            width="100%"
                            height={330}
                        >

                            <BarChart
                                data={
                                    categoryChartData
                                }
                                margin={{
                                    top: 20,
                                    right: 15,
                                    left: 0,
                                    bottom: 10
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />


                                <XAxis
                                    dataKey="category"
                                    tick={{
                                        fontSize: 12
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />


                                <YAxis
                                    allowDecimals={false}
                                    tick={{
                                        fontSize: 12
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />


                                <Tooltip
                                    formatter={(
                                        value
                                    ) => [
                                        value,
                                        "Tickets"
                                    ]}
                                />


                                <Bar
                                    dataKey="tickets"
                                    name="Tickets"
                                    fill="#2563eb"
                                    radius={[
                                        6,
                                        6,
                                        0,
                                        0
                                    ]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </div>

            </div>

<div className="support-trend-section">

    <div className="support-chart-card support-trend-card">

        <div className="support-chart-header">

            <div>

                <h2>
                    Tickets Created Over Time
                </h2>

                <p>
                    Support tickets created during the last 7 days
                </p>

            </div>

            <span>
                Last 7 Days
            </span>

        </div>


        <div className="support-line-chart">

            <ResponsiveContainer
                width="100%"
                height={330}
            >

                <LineChart
                    data={ticketTrendData}
                    margin={{
                        top: 20,
                        right: 20,
                        left: 0,
                        bottom: 10
                    }}
                >

                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                    />


                    <XAxis
                        dataKey="date"
                        tick={{
                            fontSize: 12
                        }}
                        axisLine={false}
                        tickLine={false}
                    />


                    <YAxis
                        allowDecimals={false}
                        tick={{
                            fontSize: 12
                        }}
                        axisLine={false}
                        tickLine={false}
                    />


                    <Tooltip
                        formatter={(value) => [
                            value,
                            "Tickets"
                        ]}
                    />


                    <Line
                        type="monotone"
                        dataKey="tickets"
                        name="Tickets"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{
                            r: 5
                        }}
                        activeDot={{
                            r: 7
                        }}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    </div>

</div>
            <div className="dashboard-tickets-section">


                <div className="tickets-section-header">

                    <div className="tickets-header-left">

                        <h2>

                            {selectedStatus
                                ? `${selectedStatus} Tickets`
                                : selectedCategory
                                ? `${selectedCategory} Tickets`
                                : "All Support Tickets"}

                        </h2>

                        <span>
                            {filteredTickets.length}
                            {" "}
                            Tickets
                        </span>

                    </div>


                    <div className="tickets-header-right">


                        <div className="ticket-search-section">

                            <input
                                type="text"
                                value={
                                    searchTerm
                                }
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target.value
                                    )
                                }
                                placeholder="🔍 Search tickets..."
                            />

                        </div>


                        <div className="download-container">

                            <button
                                className="download-button"
                                onClick={() =>
                                    setDownloadOpen(
                                        !downloadOpen
                                    )
                                }
                            >
                                ⬇ Download
                            </button>


                            {downloadOpen && (

                                <div className="download-menu">

                                    <button
                                        onClick={
                                            downloadCSV
                                        }
                                    >
                                        📄 Download CSV
                                    </button>

                                    <button
                                        onClick={
                                            downloadPDF
                                        }
                                    >
                                        📑 Download PDF
                                    </button>

                                </div>

                            )}

                        </div>

                    </div>

                </div>


                {ticketsLoading ? (

                    <div className="tickets-loading">

                        <p>
                            Loading tickets...
                        </p>

                    </div>

                ) : filteredTickets.length === 0 ? (

                    <div className="no-dashboard-tickets">

                        <p>
                            No tickets found.
                        </p>

                    </div>

                ) : (

                    <div className="dashboard-ticket-table-wrapper">

                        <table className="dashboard-ticket-table">

                            <thead>

                                <tr>

                                    <th>
                                        Ticket ID
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Created
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredTickets.map(
                                    (ticket) => (

                                        <tr
                                            key={
                                                ticket.id
                                            }
                                        >

                                            <td>

                                                <span className="table-ticket-id">
                                                    #{ticket.id}
                                                </span>

                                            </td>


                                            <td>

                                                <div className="table-customer">

                                                    <strong>
                                                        {
                                                            ticket.customer_username
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            ticket.customer_email
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            <td>
                                                {
                                                    ticket.category
                                                }
                                            </td>


                                            <td>

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
                                                    {
                                                        ticket.status
                                                    }
                                                </span>

                                            </td>


                                            <td>

                                                {new Date(
                                                    ticket.created_at
                                                ).toLocaleDateString()}

                                            </td>


                                            <td>

                                                <button
                                                    className="table-view-button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/support-dashboard/tickets/${ticket.id}`
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default SupportDashboard;