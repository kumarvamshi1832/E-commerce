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

import { CartProvider } from "./context/CartContext";

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
        </Routes>

      </BrowserRouter>
    </CartProvider>
  );
}

export default App;