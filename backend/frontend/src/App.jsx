import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import ProductDetails from "./pages/ProductDetails";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import Wishlist from "./pages/Wishlist";

import Profile from "./pages/Profile";
import Support from "./pages/Support";
import SupportTicketDetails from "./pages/SupportTicketDetails";

import SupportDashboard from "./pages/SupportDashboard";
import SupportTicketDetail from "./pages/SupportTicketDetail";

import { CartProvider } from "./context/CartContext";
import ChatBot from "./components/ChatBot";


function AppContent() {
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const isSupport = user?.role === "support";

  return (
    <>
      {/* =========================
          SUPPORT STAFF
      ========================= */}

      {isSupport ? (
        <>
          <Routes>

            {/* Support Dashboard */}
            <Route
              path="/support-dashboard"
              element={<SupportDashboard />}
            />

            {/* Support Ticket Details */}
            <Route
              path="/support-dashboard/tickets/:ticketId"
              element={<SupportTicketDetail />}
            />

            {/* If support staff opens any other URL */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/support-dashboard"
                  replace
                />
              }
            />

          </Routes>
        </>
      ) : (

        /* =========================
           CUSTOMER / NORMAL USER
        ========================= */

        <>
          <Navbar />

          <Routes>

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/products"
              element={<Products />}
            />

            <Route
              path="/product/:id"
              element={<ProductDetails />}
            />

            <Route
              path="/cart"
              element={<Cart />}
            />

            <Route
              path="/checkout"
              element={<Checkout />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/my-orders"
              element={<MyOrders />}
            />

            <Route
              path="/orders/:id"
              element={<OrderDetails />}
            />

            <Route
              path="/wishlist"
              element={<Wishlist />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* Customer Support */}
            <Route
              path="/support"
              element={<Support />}
            />

            <Route
              path="/support/tickets/:ticketId"
              element={<SupportTicketDetails />}
            />

            {/* Prevent normal users from opening Support Dashboard */}
            <Route
              path="/support-dashboard"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

            <Route
              path="/support-dashboard/tickets/:ticketId"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>

          <ChatBot />
        </>
      )}
    </>
  );
}


function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CartProvider>
  );
}


export default App;