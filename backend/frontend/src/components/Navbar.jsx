import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { FaShoppingCart } from "react-icons/fa";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/api";
import "./Navbar.css";

function Navbar() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const response =
        await getNotifications();

      setNotifications(
        response.data.notifications
      );

      setUnreadCount(
        response.data.unread_count
      );
    } catch (error) {
      console.log(
        "Notification error:",
        error
      );
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleNotificationClick = async (
    notification
  ) => {
    if (notification.is_read) {
      return;
    }

    try {
      const response =
        await markNotificationRead(
          notification.id
        );

      setNotifications(
        (previousNotifications) =>
          previousNotifications.map(
            (item) =>
              item.id === notification.id
                ? {
                    ...item,
                    is_read: true,
                  }
                : item
          )
      );

      setUnreadCount(
        response.data.unread_count
      );
    } catch (error) {
      console.log(
        "Mark notification error:",
        error
      );
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      const response =
        await markAllNotificationsRead();

      setNotifications(
        (previousNotifications) =>
          previousNotifications.map(
            (notification) => ({
              ...notification,
              is_read: true,
            })
          )
      );

      setUnreadCount(
        response.data.unread_count
      );
    } catch (error) {
      console.log(
        "Mark all notifications error:",
        error
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/");

    window.location.reload();
  };

  return (
    <header className="navbar">

      <Link
  to="/"
  className="logo"
>
  <FaShoppingCart className="logo-cart-icon" />
  <span>MyStore</span>
</Link>

      <nav className="nav-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/products">
          Products
        </Link>

        {user ? (
          <>
            <Link
              to="/wishlist"
              className="wishlist-button"
            >
              ❤️

              <span>
                Wishlist
              </span>

              {wishlistCount > 0 && (
                <span className="wishlist-count">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/my-orders">
              My Orders
            </Link>

            <Link
  to="/cart"
  className="cart-button"
>
  <FaShoppingCart className="navbar-cart-icon" />

  <span>
    Cart
  </span>

  {cartCount > 0 && (
    <span className="cart-count">
      {cartCount}
    </span>
  )}
</Link>
            <div className="notification-menu">

              <button
                type="button"
                className="notification-button"
                onClick={() =>
                  setShowNotifications(
                    !showNotifications
                  )
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

  <span>
    Notifications
  </span>

  <div className="notification-header-actions">

    {unreadCount > 0 && (
      <button
        type="button"
        className="mark-all-read-button"
        onClick={handleMarkAllRead}
      >
        Mark all read
      </button>
    )}

    <button
      type="button"
      className="notification-close-button"
      onClick={() =>
        setShowNotifications(false)
      }
      aria-label="Close notifications"
    >
      ✕
    </button>

  </div>

</div>
                  {notifications.length ===
                  0 ? (
                    <div className="no-notifications">
                      No notifications
                    </div>
                  ) : (
                    notifications.map(
                      (notification) => (
                        <div
                          key={
                            notification.id
                          }
                          className={
                            notification.is_read
                              ? "notification-item read"
                              : "notification-item unread"
                          }
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                        >

                          <div className="notification-message">
                            {
                              notification.message
                            }
                          </div>

                          <div className="notification-time">
                            {new Date(
                              notification.created_at
                            ).toLocaleString()}
                          </div>

                        </div>
                      )
                    )
                  )}

                </div>
              )}

            </div>

            <div className="user-menu">

              <button
                type="button"
                className="welcome-user"
                onClick={() =>
                  setShowUserMenu(
                    !showUserMenu
                  )
                }
              >
                Hi, {user.username}

                <span className="dropdown-arrow">
                  {showUserMenu
                    ? "▲"
                    : "▼"}
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
                      navigate("/addresses");
                    }}
                  >
                    🏠 My Addresses
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