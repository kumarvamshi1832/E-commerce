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

  // =========================
// CHECK DELIVERY
// =========================

const handleCheckDelivery = async () => {
  const enteredPincode = pincode.trim();

  if (!enteredPincode) {
    setDeliveryError("Please enter a pincode");
    return;
  }

  if (!/^\d{6}$/.test(enteredPincode)) {
    setDeliveryError("Please enter a valid 6-digit pincode");
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

  // =========================
  // REVIEWS
  // =========================

  const [showReviews, setShowReviews] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // =========================
  // LOAD PRODUCTS
  // =========================

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

 const filteredProducts = products.filter((product) => {
  const search = searchTerm.toLowerCase();

  return (
    product.name?.toLowerCase().includes(search) ||
    product.description?.toLowerCase().includes(search) ||
    product.category?.toLowerCase().includes(search)
  );
});

  // =========================
  // OPEN REVIEWS
  // =========================

  const handleReviewsClick = async (productId) => {
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

  // =========================
  // CLOSE REVIEWS
  // =========================

  const closeReviews = () => {
    setShowReviews(false);
    setSelectedProduct(null);
    setReviews([]);
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <h2>Loading products...</h2>
    );
  }

  return (
    <main className="products-section">

      {/* =========================
          HEADER
      ========================= */}

      <div className="section-header">

  <p className="section-label">
    OUR COLLECTION
  </p>

  <div className="products-title-row">

    <h2>
      All Products
    </h2>

    <div className="product-search-section">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="🔍 Search products..."
      />
    </div>

    <p className="product-count">
      {filteredProducts.length} products
    </p>

  </div>

</div>
      

      {/* =========================
    DELIVERY CHECK
========================= */}

<div className="delivery-check-section">

  <div className="delivery-check-content">

    <div>
      <p className="delivery-check-label">
        🚚 CHECK DELIVERY
      </p>

      <h3>
        Check product delivery to your location
      </h3>

      {checkedPincode && !deliveryError && (
        <p className="delivery-checked-message">
          Delivery status for {checkedPincode}
        </p>
      )}
    </div>

    <div className="delivery-input-area">

      <input
        type="text"
        value={pincode}
        onChange={(e) => {
          setPincode(e.target.value);
          setDeliveryError("");
        }}
        placeholder="Enter 6-digit pincode"
        maxLength="6"
      />

      <button
        type="button"
        onClick={handleCheckDelivery}
        disabled={checkingDelivery}
      >
        {checkingDelivery ? "Checking..." : "CHECK"}
      </button>

    </div>

  </div>

  {deliveryError && (
    <p className="delivery-error">
      {deliveryError}
    </p>
  )}

</div>

      {/* =========================
          PRODUCTS
      ========================= */}

      <div className="products-grid">

        {filteredProducts.map((product) => (

          <ProductCard
  key={product.id}
  product={product}
  onReviewsClick={handleReviewsClick}
  deliveryStatus={
    checkedPincode
      ? deliveryStatus[product.id]
      : null
  }
  checkedPincode={checkedPincode}
/>

        ))}

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

            {/* CLOSE BUTTON */}

            <button
              type="button"
              className="reviews-modal-close"
              onClick={closeReviews}
              aria-label="Close reviews"
            >
              ×
            </button>

            {/* TITLE */}

            <h2>
              {selectedProduct?.name}
            </h2>

            <p className="reviews-modal-title">
              Customer Reviews
            </p>

            {/* LOADING */}

            {reviewsLoading ? (

              <p className="reviews-loading">
                Loading reviews...
              </p>

            ) : reviews.length === 0 ? (

              <p className="no-reviews-message">
                No reviews yet.
              </p>

            ) : (

              <div className="reviews-list">

                {reviews.map((item) => (

                  <div
                    className="review-item"
                    key={item.id}
                  >

                    <div className="review-header">

                      <strong>
                        {item.username}
                      </strong>

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