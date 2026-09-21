import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [pincode, setPincode] = useState("");
  const [checkedPincode, setCheckedPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState({});
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");

  const [showReviews, setShowReviews] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const vegetables = [
    "🥕", "🥦", "🍅", "🥬", "🫑",
    "🥒", "🌽", "🍆", "🧅", "🥔",
    "🍎", "🍏", "🍋", "🍊", "🥝",
    "🍐", "🍓", "🍇", "🍉", "🍌",
    "🥕", "🥦", "🍅", "🥬", "🫑",
    "🥒", "🌽", "🍆", "🧅", "🥔",
    "🍎", "🍋", "🍊", "🥝", "🍐",
    "🍓", "🍇", "🍉", "🍌", "🥕",
    "🥦", "🍅", "🥬", "🫑", "🥒",
    "🌽", "🍆", "🧅", "🥔", "🍎"
  ];

  const handleCheckDelivery = async () => {
    const enteredPincode = pincode.trim();

    if (!enteredPincode) {
      setDeliveryError("Please enter a pincode");
      return;
    }

    if (!/^\d{6}$/.test(enteredPincode)) {
      setDeliveryError(
        "Please enter a valid 6-digit pincode"
      );
      return;
    }

    setCheckingDelivery(true);
    setDeliveryError("");

    try {
      const response = await api.get(
        `delivery/check/?pincode=${enteredPincode}`
      );

      const status = {};

      response.data.products.forEach((item) => {
        status[item.product_id] = item.deliverable;
      });

      setDeliveryStatus(status);
      setCheckedPincode(response.data.pincode);
    } catch (error) {
      console.error(
        "Error checking delivery:",
        error
      );

      setDeliveryError(
        error.response?.data?.error ||
          "Unable to check delivery"
      );
    } finally {
      setCheckingDelivery(false);
    }
  };

  useEffect(() => {
    api
      .get("products/")
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Error loading products:",
          error
        );
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter(
    (product) => {
      const search =
        searchTerm.toLowerCase();

      return (
        product.name
          ?.toLowerCase()
          .includes(search) ||
        product.description
          ?.toLowerCase()
          .includes(search) ||
        product.category
          ?.toLowerCase()
          .includes(search)
      );
    }
  );

  const handleReviewsClick = async (
    productId
  ) => {
    const product = products.find(
      (item) => item.id === productId
    );

    setSelectedProduct(product);
    setShowReviews(true);
    setReviewsLoading(true);

    try {
      const response = await api.get(
        `products/${productId}/reviews/`
      );

      setReviews(
        response.data.reviews || []
      );
    } catch (error) {
      console.error(
        "Error loading reviews:",
        error
      );

      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const closeReviews = () => {
    setShowReviews(false);
    setSelectedProduct(null);
    setReviews([]);
  };

  if (loading) {
    return (
      <main className="products-section products-loading-page">

        <div className="floating-groceries">
          {vegetables.map(
            (vegetable, index) => (
              <span
                key={index}
                className="floating-grocery"
              >
                {vegetable}
              </span>
            )
          )}
        </div>

        <div className="products-loading-card">
          <div className="products-loading-icon">
            🥕
          </div>

          <h2>
            Loading fresh products...
          </h2>

          <p>
            Getting everything ready for you
          </p>
        </div>

      </main>
    );
  }

  return (
    <main className="products-section">

      {/* FLOATING GROCERIES */}

      <div className="floating-groceries">
        {vegetables.map(
          (vegetable, index) => (
            <span
              key={index}
              className="floating-grocery"
            >
              {vegetable}
            </span>
          )
        )}
      </div>

      <div className="products-page-container">

        {/* =========================
            HEADER
        ========================= */}

        <div className="section-header">

          <div className="products-heading-content">

            <p className="section-label">
              FRESH • LOCAL • QUALITY
            </p>

            <h1>
              Fresh Products
            </h1>

            <p className="products-heading-text">
              Discover fresh groceries and
              everyday essentials, carefully
              selected for you.
            </p>

          </div>

          <div className="products-search-box">

            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search products..."
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                ×
              </button>
            )}

          </div>

          <div className="product-count-box">
            <strong>
              {filteredProducts.length}
            </strong>

            <span>
              {filteredProducts.length === 1
                ? "Product"
                : "Products"}
            </span>
          </div>

        </div>

        {/* =========================
            DELIVERY CHECK
        ========================= */}

        <section className="delivery-check-section">

          <div className="delivery-check-content">

            <div className="delivery-info">

              <div className="delivery-icon">
                🚚
              </div>

              <div>

                <p className="delivery-check-label">
                  CHECK DELIVERY
                </p>

                <h3>
                  Check product delivery
                  to your location
                </h3>

                {checkedPincode &&
                  !deliveryError && (
                    <p className="delivery-checked-message">
                      ✓ Delivery status for{" "}
                      <strong>
                        {checkedPincode}
                      </strong>
                    </p>
                  )}

              </div>

            </div>

            <div className="delivery-input-area">

              <input
                type="text"
                value={pincode}
                onChange={(e) => {
                  setPincode(
                    e.target.value
                  );
                  setDeliveryError("");
                }}
                placeholder="Enter 6-digit pincode"
                maxLength="6"
              />

              <button
                type="button"
                onClick={
                  handleCheckDelivery
                }
                disabled={
                  checkingDelivery
                }
              >
                {checkingDelivery
                  ? "Checking..."
                  : "CHECK"}
              </button>

            </div>

          </div>

          {deliveryError && (
            <p className="delivery-error">
              ⚠️ {deliveryError}
            </p>
          )}

        </section>

        {/* =========================
            PRODUCT RESULTS
        ========================= */}

        {filteredProducts.length > 0 ? (

          <div className="products-grid">

            {filteredProducts.map(
              (product) => (

                <ProductCard
                  key={product.id}
                  product={product}
                  onReviewsClick={
                    handleReviewsClick
                  }
                  deliveryStatus={
                    checkedPincode
                      ? deliveryStatus[
                          product.id
                        ]
                      : null
                  }
                  checkedPincode={
                    checkedPincode
                  }
                />

              )
            )}

          </div>

        ) : (

          <div className="products-empty">

            <div className="products-empty-icon">
              🥕
            </div>

            <p className="section-label">
              NO RESULTS
            </p>

            <h2>
              No products found
            </h2>

            <p>
              We couldn't find anything
              matching "{searchTerm}".
            </p>

            <button
              type="button"
              onClick={() =>
                setSearchTerm("")
              }
            >
              View All Products
            </button>

          </div>

        )}

      </div>

      {/* =========================
          REVIEWS POPUP
      ========================= */}

      {showReviews && (

        <div
          className="reviews-modal-overlay"
          onClick={closeReviews}
        >

          <div
            className="reviews-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="reviews-modal-close"
              onClick={closeReviews}
              aria-label="Close reviews"
            >
              ×
            </button>

            <div className="reviews-modal-icon">
              ⭐
            </div>

            <p className="reviews-modal-label">
              CUSTOMER FEEDBACK
            </p>

            <h2>
              {selectedProduct?.name}
            </h2>

            <p className="reviews-modal-title">
              Customer Reviews
            </p>

            {reviewsLoading ? (

              <div className="reviews-loading-box">

                <div className="reviews-loading-icon">
                  ⭐
                </div>

                <p>
                  Loading reviews...
                </p>

              </div>

            ) : reviews.length === 0 ? (

              <div className="no-reviews-box">

                <span>
                  💬
                </span>

                <p>
                  No reviews yet.
                </p>

                <small>
                  Be the first to share
                  your experience.
                </small>

              </div>

            ) : (

              <div className="reviews-list">

                {reviews.map((item) => (

                  <div
                    className="review-item"
                    key={item.id}
                  >

                    <div className="review-header">

                      <div className="review-user">

                        <span className="review-user-icon">
                          👤
                        </span>

                        <strong>
                          {item.username}
                        </strong>

                      </div>

                      <span className="review-item-stars">
                        {"★".repeat(
                          item.rating
                        )}
                      </span>

                    </div>

                    <p className="review-text">
                      {item.review}
                    </p>

                    <small className="review-date">
                      {new Date(
                        item.created_at
                      ).toLocaleDateString()}
                    </small>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      )}

    </main>
  );
}

export default Products;