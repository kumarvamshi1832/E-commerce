import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

function AdminLayout() {
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Products", path: "/admin/products", icon: "📦" },
    { name: "Orders", path: "/admin/orders", icon: "🛒" },
    { name: "Customers", path: "/admin/customers", icon: "👥" },
    { name: "Coupons", path: "/admin/coupons", icon: "🎟️" },
    { name: "Inventory", path: "/admin/inventory", icon: "📋" },
    { name: "Reviews", path: "/admin/reviews", icon: "⭐" },
    { name: "Support", path: "/admin/support", icon: "🎧" },
    { name: "Notifications", path: "/admin/notifications", icon: "🔔" },
    { name: "Settings", path: "/admin/settings", icon: "⚙️" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">🛍️</div>

          <div className="admin-logo-content">
            <h2>MyStore</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-navigation">
          <p className="admin-menu-title">MAIN MENU</p>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "admin-nav-link active"
                  : "admin-nav-link"
              }
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            <span>🚪</span>
            <span className="admin-logout-text">Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {/* <div className="admin-main-header">
          <div>
            <p className="admin-header-label">MY STORE</p>
            <h1>Admin Management</h1>
          </div>

          <button
            type="button"
            className="admin-view-store-btn"
            onClick={() => navigate("/")}
          >
            View Store ↗
          </button>
        </div> */}

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;