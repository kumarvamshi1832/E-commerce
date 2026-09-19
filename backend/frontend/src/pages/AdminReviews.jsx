import { useEffect, useState } from "react";
import api from "../services/api";
import AdminExportActions from "../components/AdminExportActions";
import "./AdminReviews.css";

function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        const token = localStorage.getItem("token");

        try {
            const response = await api.get(
                "admin/reviews/",
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            setReviews(response.data);
        } catch (error) {
            console.log(error);
            alert(
                error.response?.data?.error ||
                "Unable to load reviews."
            );
        } finally {
            setLoading(false);
        }
    };

    const openReview = async (reviewId) => {
        const token = localStorage.getItem("token");

        try {
            const response = await api.get(
                `admin/reviews/${reviewId}/`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            setSelectedReview(response.data);
        } catch (error) {
            console.log(error);
            alert(
                error.response?.data?.error ||
                "Unable to load review details."
            );
        }
    };

    const renderStars = (rating) => {
        return (
            <span className="review-stars">
                {"★".repeat(rating)}
                <span className="empty-stars">
                    {"★".repeat(5 - rating)}
                </span>
            </span>
        );
    };

    const exportColumns = [
    {
        label: "Product",
        key: "product"
    },
    {
        label: "Customer",
        key: "customer"
    },
    {
        label: "Email",
        key: "email"
    },
    {
        label: "Rating",
        key: "rating"
    },
    {
        label: "Review",
        key: "review"
    },
    {
        label: "Date",
        key: "date"
    }
];

const exportData = reviews.map((review) => ({
    product: review.product.name,
    customer: review.customer.username,
    email: review.customer.email,
    rating: `${review.rating}/5`,
    review: review.review,
    date: new Date(
        review.created_at
    ).toLocaleDateString("en-IN")
}));

    if (loading) {
        return (
            <div className="admin-reviews-page">
                <div className="reviews-loading">
                    Loading reviews...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-reviews-page">

            <div className="reviews-header">

    <div>
        <h1>Reviews</h1>

        <p>
            Manage and view customer product reviews.
        </p>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        <AdminExportActions
            title="Reviews"
            columns={exportColumns}
            data={exportData}
            filename="mystore-reviews"
        />

        <div className="review-count">
            {reviews.length} Reviews
        </div>

    </div>

</div>
            <div className="reviews-table-card">

                {reviews.length === 0 ? (
                    <div className="no-reviews">
                        <h3>No Reviews Found</h3>
                        <p>
                            Customer reviews will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="reviews-table-wrapper">

                        <table className="reviews-table">

                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Customer</th>
                                    <th>Rating</th>
                                    <th>Review</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {reviews.map((review) => (
                                    <tr key={review.id}>

                                        <td>
                                            <div className="product-cell">

                                                {review.product.image ? (
                                                    <img
                                                        src={review.product.image}
                                                        alt={review.product.name}
                                                    />
                                                ) : (
                                                    <div className="review-no-image">
                                                        No Image
                                                    </div>
                                                )}

                                                <span>
                                                    {review.product.name}
                                                </span>

                                            </div>
                                        </td>

                                        <td>
                                            <div className="customer-cell">
                                                <strong>
                                                    {review.customer.username}
                                                </strong>
                                                <span>
                                                    {review.customer.email}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="rating-cell">
                                                {renderStars(review.rating)}
                                                <span>
                                                    {review.rating}/5
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="review-text">
                                                {review.review}
                                            </div>
                                        </td>

                                        <td>
                                            {new Date(
                                                review.created_at
                                            ).toLocaleDateString("en-IN")}
                                        </td>

                                        <td>
                                            <button
                                                className="view-review-btn"
                                                onClick={() =>
                                                    openReview(review.id)
                                                }
                                            >
                                                View
                                            </button>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {selectedReview && (
                <div className="review-modal-overlay">

                    <div className="review-modal">

                        <div className="review-modal-header">

                            <div>
                                <h2>Review Details</h2>
                                <p>
                                    Customer product review
                                </p>
                            </div>

                            <button
                                className="close-review-btn"
                                onClick={() =>
                                    setSelectedReview(null)
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="review-modal-content">

                            <div className="review-product-section">

                                {selectedReview.product.image ? (
                                    <img
                                        src={selectedReview.product.image}
                                        alt={selectedReview.product.name}
                                    />
                                ) : (
                                    <div className="modal-no-image">
                                        No Image
                                    </div>
                                )}

                                <div>
                                    <span className="detail-label">
                                        Product
                                    </span>

                                    <h3>
                                        {selectedReview.product.name}
                                    </h3>
                                </div>

                            </div>

                            <div className="review-detail-grid">

                                <div className="review-detail-box">
                                    <span className="detail-label">
                                        Customer
                                    </span>

                                    <strong>
                                        {selectedReview.customer.username}
                                    </strong>
                                </div>

                                <div className="review-detail-box">
                                    <span className="detail-label">
                                        Email
                                    </span>

                                    <strong>
                                        {selectedReview.customer.email}
                                    </strong>
                                </div>

                                <div className="review-detail-box">
                                    <span className="detail-label">
                                        Rating
                                    </span>

                                    <div className="modal-rating">
                                        {renderStars(
                                            selectedReview.rating
                                        )}

                                        <strong>
                                            {selectedReview.rating}/5
                                        </strong>
                                    </div>
                                </div>

                                <div className="review-detail-box">
                                    <span className="detail-label">
                                        Reviewed On
                                    </span>

                                    <strong>
                                        {new Date(
                                            selectedReview.created_at
                                        ).toLocaleDateString("en-IN")}
                                    </strong>
                                </div>

                            </div>

                            <div className="full-review-section">

                                <span className="detail-label">
                                    Customer Review
                                </span>

                                <div className="full-review-text">
                                    {selectedReview.review}
                                </div>

                            </div>

                        </div>

                        <div className="review-modal-footer">

                            <button
                                className="close-modal-btn"
                                onClick={() =>
                                    setSelectedReview(null)
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default AdminReviews;