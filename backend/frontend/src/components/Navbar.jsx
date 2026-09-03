import { Link, useNavigate, } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

function Navbar() {
  const { cartCount } = useCart();
  const navigate = useNavigate();

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
            {/* My Orders - only logged-in users */}
            <Link to="/my-orders">
              My Orders
            </Link>

            <span className="welcome-user">
              Hi, {user.username}
            </span>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
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