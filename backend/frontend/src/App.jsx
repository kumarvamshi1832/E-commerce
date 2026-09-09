import { BrowserRouter, Routes, Route } from "react-router-dom";

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

// import ChatBot from "./components/ChatBot";

import Profile from "./pages/Profile";
import Support from "./pages/Support";
import SupportTicketDetails from "./pages/SupportTicketDetails";

import { CartProvider } from "./context/CartContext";
import ChatBot from "./components/Chatbot";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />

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

<Route path="/profile" element={<Profile />} />
<Route path="/support" element={<Support />} />
<Route path="/support/tickets/:ticketId" element={<SupportTicketDetails />}/>

        </Routes>
        <ChatBot/>

      </BrowserRouter>
    </CartProvider>
  );
}

export default App;