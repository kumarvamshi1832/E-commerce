import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "./OrderDetails.css";

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`orders/${id}/`);

      setOrder(response.data);

    } catch (error) {
      setError(
        error.response?.data?.error ||
        "Unable to load order."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="order-details-page">
        <div className="order-details-loading">
          Loading order...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="order-details-page">
        <div className="order-details-error">
          ⚠️ {error}

          <br />

          <Link to="/my-orders">
            ← Back to My Orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="order-details-page">

      <div className="order-details-container">

        {/* HEADER */}

        <div className="order-details-header">

          <div>

            <Link
              to="/my-orders"
              className="back-orders-link"
            >
              ← Back to My Orders
            </Link>

            <p className="order-details-eyebrow">
              ORDER DETAILS
            </p>

            <h1>
              Order #{order.id}
            </h1>

            <p className="order-date">
              {new Date(
                order.created_at
              ).toLocaleDateString()}
            </p>

          </div>

          <span
            className={`order-detail-status ${
              order.status
                ?.toLowerCase()
                .replace(" ", "-")
            }`}
          >
            {order.status}
          </span>

        </div>

               {/* PRODUCTS */}

        <section className="order-products">

          <h2>Products</h2>

          <div className="order-items-list">

            {order.items.map((item) => (

              <article
                className="order-item"
                key={item.id}
              >

                {/* IMAGE */}

                <div className="order-item-image">

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.product_name}
                    />
                  ) : (
                    <span>📦</span>
                  )}

                </div>

                {/* PRODUCT INFO */}

                <div className="order-item-info">

                  <h3>
                    {item.product_name}
                  </h3>

                  <p>
                    Quantity: {item.quantity}
                  </p>

                  <p>
                    ₹{Number(
                      item.price
                    ).toFixed(2)} each
                  </p>

                </div>

                {/* ITEM TOTAL */}

                <strong className="order-item-total">
                  ₹{Number(
                    item.item_total
                  ).toFixed(2)}
                </strong>

              </article>

            ))}

          </div>

        </section>
        
        {/* SUMMARY */}

        <section className="order-summary">

          <h2>Order Summary</h2>

          <div className="order-summary-row">

            <span>
              Subtotal
            </span>

            <strong>
              ₹{Number(
                order.subtotal
              ).toFixed(2)}
            </strong>

          </div>

          <div className="order-summary-row">

            <span>
              Delivery
            </span>

            <strong>
              ₹{Number(
                order.delivery
              ).toFixed(2)}
            </strong>

          </div>

          <div className="order-summary-divider" />

          <div className="order-summary-total">

            <span>
              Total
            </span>

            <strong>
              ₹{Number(
                order.total_amount
              ).toFixed(2)}
            </strong>

          </div>

        </section>

        {/* ACTION */}

        <div className="order-details-actions">

          <Link
            to="/products"
            className="continue-shopping-button"
          >
            Continue Shopping
          </Link>

          <Link
            to="/my-orders"
            className="back-orders-button"
          >
            My Orders
          </Link>

        </div>

      </div>

    </main>
  );
}

export default OrderDetails;