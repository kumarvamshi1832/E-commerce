import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import {
  getNotifications,
  markNotificationRead,
} from "../services/api";
import "./Navbar.css";

function Navbar() {
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // =========================
  // LOAD NOTIFICATIONS
  // =========================

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const response = await getNotifications();

      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.log("Notification error:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  // =========================
  // MARK NOTIFICATION READ
  // =========================

  const handleNotificationClick = async (notification) => {
    if (notification.is_read) {
      return;
    }

    try {
      const response = await markNotificationRead(notification.id);

      setNotifications((previousNotifications) =>
        previousNotifications.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true }
            : item
        )
      );

      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.log("Mark notification error:", error);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/");

    window.location.reload();
  };

  return (
    <header className="navbar">

      <Link to="/" className="logo">
        MyStore
      </Link>

      <nav className="nav-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/products">
          Products
        </Link>

        <Link to="/cart" className="cart-button">
          🛒
          <span>Cart</span>

          {cartCount > 0 && (
            <span className="cart-count">
              {cartCount}
            </span>
          )}
        </Link>

        {user ? (
          <>
            <Link to="/wishlist">
              ❤️ Wishlist
            </Link>

            <Link to="/my-orders">
              My Orders
            </Link>

            {/* =========================
                NOTIFICATIONS
            ========================= */}

            <div className="notification-menu">

              <button
                type="button"
                className="notification-button"
                onClick={() =>
                  setShowNotifications(!showNotifications)
                }
              >
                🔔

                {unreadCount > 0 && (
                  <span className="notification-count">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">

                  <div className="notification-header">
                    Notifications
                  </div>

                  {notifications.length === 0 ? (
                    <div className="no-notifications">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={
                          notification.is_read
                            ? "notification-item read"
                            : "notification-item unread"
                        }
                        onClick={() =>
                          handleNotificationClick(notification)
                        }
                      >
                        <div className="notification-message">
                          {notification.message}
                        </div>

                        <div className="notification-time">
                          {new Date(
                            notification.created_at
                          ).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}

                </div>
              )}

            </div>

            {/* =========================
                USER MENU
            ========================= */}

            <div className="user-menu">

              <button
                type="button"
                className="welcome-user"
                onClick={() =>
                  setShowUserMenu(!showUserMenu)
                }
              >
                Hi, {user.username}

                <span className="dropdown-arrow">
                  {showUserMenu ? "▲" : "▼"}
                </span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/profile");
                    }}
                  >
                    👤 My Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/support");
                    }}
                  >
                    💬 Help & Support
                  </button>

                  <div className="dropdown-divider"></div>

                  <button
                    type="button"
                    className="dropdown-logout"
                    onClick={handleLogout}
                  >
                    🚪 Logout
                  </button>

                </div>
              )}

            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="login-nav-button"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="register-nav-button"
            >
              Register
            </Link>
          </>
        )}

      </nav>

    </header>
  );
}

export default Navbar;