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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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

import AdminLayout from "./components/AdminLayout";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminCustomers from "./pages/AdminCustomers";
import AdminInventory from "./pages/AdminInventory";
import AdminReviews from "./pages/AdminReviews";
import AdminSupport from "./pages/AdminSupport";
import AdminNotifications from "./pages/AdminNotifications";
import AdminCoupons from "./pages/AdminCoupons";
import AdminDashboard from "./pages/AdminDashboard";

function AppContent() {
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const isSupport = user?.role === "support";
  const isAdmin = user?.role === "admin";

  if (
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password"
  ) {
    return (
      <Routes>
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    );
  }

  if (isSupport) {
    return (
      <Routes>
        <Route
          path="/support-dashboard"
          element={<SupportDashboard />}
        />

        <Route
          path="/support-dashboard/tickets/:ticketId"
          element={<SupportTicketDetail />}
        />

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
    );
  }

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="products"
            element={<AdminProducts />}
          />

          <Route
            path="orders"
            element={<AdminOrders />}
          />

          <Route
            path="customers"
            element={<AdminCustomers />}
          />

          <Route
            path="coupons"
            element={<AdminCoupons />}
          />

          <Route
            path="inventory"
            element={<AdminInventory />}
          />

          <Route
            path="reviews"
            element={<AdminReviews />}
          />

          <Route
            path="support"
            element={<AdminSupport />}
          />

          <Route
            path="notifications"
            element={<AdminNotifications />}
          />

          <Route
            path="settings"
            element={
              <div>
                <h1>Settings</h1>
                <p>Admin settings will be available here.</p>
              </div>
            }
          />

          <Route
            index
            element={
              <Navigate
                to="/admin/dashboard"
                replace
              />
            }
          />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
        />
      </Routes>
    );
  }

  return (
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
  path="/forgot-password"
  element={<ForgotPassword />}
/>
<Route
    path="/reset-password"
    element={<ResetPassword />}
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

        <Route
          path="/support"
          element={<Support />}
        />

        <Route
          path="/support/tickets/:ticketId"
          element={<SupportTicketDetails />}
        />

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

        <Route
          path="/admin/*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

        <Route
          path="*"
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