import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();

  const { addToCart, cartItems, increaseQuantity, decreaseQuantity } =
    useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    api
      .get(`products/${id}/`)
      .then((response) => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading product:", error);
        setError("Unable to load this product.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main className="product-details-page">
        <div className="product-details-loading">
          Loading product...
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-details-page">
        <div className="product-details-error">
          <h2>Product not found</h2>
          <p>{error}</p>

          <Link to="/products" className="back-products-button">
            ← Back to Products
          </Link>
        </div>
      </main>
    );
  }

  const cartItem = cartItems?.find(
    (item) => item.id === product.id
  );

  const quantity = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = product.stock <= 0;

  const isLowStock =
    product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product);
    }
  };

  return (
    <main className="product-details-page">

      <div className="product-details-container">

        {/* Back */}

        <Link
          to="/products"
          className="product-back-link"
        >
          ← Back to Products
        </Link>

        <div className="product-details-card">

          {/* Image */}

          <div className="product-details-image-section">

            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="product-details-image"
              />
            ) : (
              <div className="product-details-image-placeholder">
                🛒
              </div>
            )}

          </div>

          {/* Information */}

          <div className="product-details-info">

            <span className="product-details-category">
              {product.category}
            </span>

            <h1>{product.name}</h1>

            <div className="product-details-rating">
              ⭐⭐⭐⭐⭐
              <span>Premium quality</span>
            </div>

            <div className="product-details-price">
              ₹{Number(product.price).toFixed(2)}
            </div>

            <p className="product-details-description">
              {product.description}
            </p>

            {/* Stock */}

            <div className="product-stock">

              {isOutOfStock ? (
                <span className="out-stock">
                  ● Out of stock
                </span>
              ) : isLowStock ? (
                <span className="low-stock">
                  ● Only {product.stock} left
                </span>
              ) : (
                <span className="in-stock">
                  ● In stock
                </span>
              )}

            </div>

            {/* Cart */}

            {quantity > 0 ? (
              <div className="details-cart-control">

                <button
                  onClick={() =>
                    decreaseQuantity(product.id)
                  }
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  onClick={() => {
                    if (quantity < product.stock) {
                      increaseQuantity(product.id);
                    }
                  }}
                >
                  +
                </button>

              </div>
            ) : (
              <button
                className="details-add-cart"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>
            )}

            <div className="product-details-features">

              <div>
                🚚
                <span>
                  <strong>Fast Delivery</strong>
                  <small>Delivered to your door</small>
                </span>
              </div>

              <div>
                ✓
                <span>
                  <strong>Quality Guaranteed</strong>
                  <small>Fresh and carefully selected</small>
                </span>
              </div>

              <div>
                🔒
                <span>
                  <strong>Secure Shopping</strong>
                  <small>Your information is protected</small>
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}

export default ProductDetails;