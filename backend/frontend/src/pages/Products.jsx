import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

        <div>

          <p className="section-label">
            OUR COLLECTION
          </p>

          <h2>
            All Products
          </h2>

        </div>

        <p className="product-count">
          {products.length} products
        </p>

      </div>

      {/* =========================
          PRODUCTS
      ========================= */}

      <div className="products-grid">

        {products.map((product) => (

          <ProductCard
            key={product.id}
            product={product}
            onReviewsClick={
              handleReviewsClick
            }
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