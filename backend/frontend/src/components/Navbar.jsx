import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

function Navbar() {
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");

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

            {/* USER MENU */}
            <div className="user-menu">

              <button
                type="button"
                className="welcome-user"
                onClick={() => setShowUserMenu(!showUserMenu)}
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