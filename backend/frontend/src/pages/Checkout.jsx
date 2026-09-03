import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import BalloonEffect from "../components/BalloonEffect";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const {
    cart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const [showBalloons, setShowBalloons] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  // Pincode
  const [pin, setPin] = useState("");
  const [location, setLocation] = useState(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");

  // =========================
  // PINCODE
  // =========================

  const pincode = async (e) => {
    let value = e.target.value;

    // Only numbers + maximum 6 digits
    value = value.replace(/\D/g, "").slice(0, 6);

    setPin(value);

    // Reset old location/error
    setLocation(null);
    setPinError("");
    setError("");

    // Don't call API until 6 digits
    if (value.length !== 6) {
      return;
    }

    try {
      setPinLoading(true);

      const response = await fetch(
        `https://api.postalpincode.in/pincode/${value}`
      );

      const data = await response.json();

      if (
        !data[0] ||
        data[0].Status !== "Success" ||
        !data[0].PostOffice?.length
      ) {
        setPinError("Invalid pincode");
        return;
      }

      const firstOffice = data[0].PostOffice[0];

      setLocation({
        postOffice: firstOffice.Name,
        district: firstOffice.District,
        state: firstOffice.State,
      });

    } catch (error) {
      console.error("Pincode error:", error);
      setPinError(
        "Unable to check pincode. Please try again."
      );
    } finally {
      setPinLoading(false);
    }
  };

  // =========================
  // SUBTOTAL
  // =========================

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  // =========================
  // DELIVERY CHARGE
  // =========================

  const delivery =
    subtotal > 0 && location
      ? pin.startsWith("500")
        ? 40
        : 140
      : 0;

  // =========================
  // DISCOUNT
  // =========================

  const discountAmount =
    (subtotal * discountPercent) / 100;

  // =========================
  // FINAL TOTAL
  // =========================

  const total =
    subtotal + delivery - discountAmount;

  // =========================
  // APPLY COUPON
  // =========================

  const applyCoupon = (code) => {
    const coupon = String(code || couponCode)
      .trim()
      .toUpperCase();

    if (coupon === "SAVE10") {
      setCouponCode("SAVE10");
      setAppliedCoupon("SAVE10");
      setDiscountPercent(10);
      setCouponMessage(
        "✓ 10% discount applied!"
      );
    }

    else if (coupon === "SAVE20") {
      setCouponCode("SAVE20");
      setAppliedCoupon("SAVE20");
      setDiscountPercent(20);
      setCouponMessage(
        "✓ 20% discount applied!"
      );
    }

    else if (coupon === "SAVE30") {
      setCouponCode("SAVE30");
      setAppliedCoupon("SAVE30");
      setDiscountPercent(30);
      setCouponMessage(
        "✓ 30% discount applied!"
      );
    }

    else {
      setAppliedCoupon("");
      setDiscountPercent(0);
      setCouponMessage(
        "⚠️ Invalid coupon code."
      );
    }
  };

  // =========================
  // PLACE ORDER
  // =========================

  const handlePlaceOrder = async () => {

    // No pincode
    if (pin.length !== 6) {
      setError(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    // Invalid pincode
    if (!location) {
      setError(
        "Please enter a valid pincode before placing the order."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const orderItems = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      const response = await api.post(
        "orders/",
        {
          items: orderItems,
          coupon_code: appliedCoupon,
          pincode: pin,
        } 
      );

      console.log(
        "Order created:",
        response.data
      );

      // Empty cart
      clearCart();

      // 🎈 SHOW BALLOONS
      setShowBalloons(true);

      // Redirect after 4 seconds
      setTimeout(() => {
        navigate("/");
      }, 4000);

    } catch (error) {
      console.error(
        "Order error:",
        error
      );

      setError(
        error.response?.data?.error ||
        "Failed to place order. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EMPTY CART
  // =========================

  if (
    cart.length === 0 &&
    !showBalloons
  ) {
    return (
      <main className="checkout-page">

        <div className="checkout-empty">

          <h1>
            Your cart is empty
          </h1>

          <p>
            Add some products before checking out.
          </p>

          <Link to="/products">
            Continue Shopping
          </Link>

        </div>

      </main>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <main className="checkout-page">

      {/* 🎈 BALLOON EFFECT */}

      {showBalloons && (
        <BalloonEffect />
      )}

      {showBalloons ? (

        // =========================
        // ORDER SUCCESS
        // =========================

        <div className="order-success">

          <div className="order-success-content">

            <div className="success-icon">
              🎉
            </div>

            <h1>
              Order Placed!
            </h1>

            <p>
              Your order has been placed successfully.
            </p>

            <p>
              Redirecting you shortly...
            </p>

          </div>

        </div>

      ) : (

        // =========================
        // NORMAL CHECKOUT
        // =========================

        <>

          {cart.length === 0 ? (

            <div className="checkout-empty">

              <h1>
                Your cart is empty
              </h1>

              <p>
                Add some products before checking out.
              </p>

              <Link to="/products">
                Continue Shopping
              </Link>

            </div>

          ) : (

            <div className="checkout-container">

              {/* =========================
                  HEADER
              ========================= */}

              <div className="checkout-header">

                <p className="checkout-eyebrow">
                  FINAL STEP
                </p>

                <h1>
                  Checkout
                </h1>

                <p>
                  Review your order before placing it.
                </p>

              </div>

              {/* ERROR */}

              {error && (
                <div className="checkout-error">
                  ⚠️ {error}
                </div>
              )}

              <div className="checkout-layout">

                {/* =========================
                    ORDER ITEMS
                ========================= */}

                <section className="checkout-items">

                  <h2>
                    Your Items
                  </h2>

                  {cart.map((item) => (

                    <article
                      className="checkout-item"
                      key={item.id}
                    >

                      {/* IMAGE */}

                      <div className="checkout-item-image">

                        {item.image ? (

                          <img
                            src={item.image}
                            alt={item.name}
                          />

                        ) : (

                          <span>
                            🛒
                          </span>

                        )}

                      </div>

                      {/* INFO */}

                      <div className="checkout-item-info">

                        <h3>
                          {item.name}
                        </h3>

                        <p>
                          ₹
                          {Number(
                            item.price
                          ).toFixed(2)}
                        </p>

                       <div className="checkout-quantity">

  <button
    type="button"
    onClick={() =>
      decreaseQuantity(item.id)
    }
  >
    −
  </button>

  <span>
    {item.quantity}
  </span>

  <button
    type="button"
    onClick={() =>
      increaseQuantity(item.id)
    }
  >
    +
  </button>

</div>

                      </div>

                      {/* ITEM TOTAL */}

                      <strong>
                        ₹
                        {(
                          Number(item.price) *
                          item.quantity
                        ).toFixed(2)}
                      </strong>

                    </article>

                  ))}

                </section>

                {/* =========================
                    COUPON + PINCODE
                ========================= */}

                <div className="coupon-section">

                  <h3>
                    Have a coupon?
                  </h3>

                  <div className="coupon-input-row">

                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          applyCoupon(
                            e.target.value
                          );
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        applyCoupon(
                          couponCode
                        )
                      }
                    >
                      Apply
                    </button>

                  </div>

                  {/* COUPON BUTTONS */}

                  <div className="coupon-buttons">

                    <button
                      type="button"
                      onClick={() =>
                        applyCoupon("SAVE10")
                      }
                    >
                      SAVE10
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        applyCoupon("SAVE20")
                      }
                    >
                      SAVE20
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        applyCoupon("SAVE30")
                      }
                    >
                      SAVE30
                    </button>

                  </div>

                  {couponMessage && (
                    <p className="coupon-message">
                      {couponMessage}
                    </p>
                  )}

                  {/* =========================
                      PINCODE
                  ========================= */}

                  <div className="pincode">

                    <strong>
                      Enter pincode:
                    </strong>

                    <input
                      type="text"
                      value={pin}
                      onChange={pincode}
                      maxLength="6"
                      placeholder="Enter 6 digit pincode"
                    />

                    {pinLoading && (
                      <p>
                        Checking pincode...
                      </p>
                    )}

                    {location && (
                      <div className="pincode-location">

                        <p>
                          📍{" "}
                          <strong>
                            Post Office:
                          </strong>{" "}
                          {location.postOffice}
                        </p>

                        <p>
                          🏙️{" "}
                          <strong>
                            District:
                          </strong>{" "}
                          {location.district}
                        </p>

                        <p>
                          🗺️{" "}
                          <strong>
                            State:
                          </strong>{" "}
                          {location.state}
                        </p>

                      </div>
                    )}

                    {pinError && (
                      <p className="pincode-error">
                        ⚠️ {pinError}
                      </p>
                    )}

                  </div>

                </div>

                {/* =========================
                    ORDER SUMMARY
                ========================= */}

                <aside className="checkout-summary">

                  <h2>
                    Order Summary
                  </h2>

                  {/* SUBTOTAL */}

                  <div className="checkout-row">

                    <span>
                      Subtotal
                    </span>

                    <strong>
                      ₹
                      {subtotal.toFixed(2)}
                    </strong>

                  </div>

                  {/* DELIVERY */}

                  <div className="checkout-row">

                    <span>
                      Delivery
                    </span>

                    <strong>
                      {pin.length === 0 ||
                      !location
                        ? "—"
                        : `₹${delivery.toFixed(2)}`}
                    </strong>

                  </div>

                  {/* DISCOUNT */}

                  {discountPercent > 0 && (

                    <>

                      <div className="checkout-row discount-row">

                        <span>
                          Coupon (
                          {appliedCoupon})
                        </span>

                        <strong>
                          -₹
                          {discountAmount.toFixed(
                            2
                          )}
                        </strong>

                      </div>

                      <div className="checkout-row original-total-row">

                        <span>
                          Original Total
                        </span>

                        <strong>
                          ₹
                          {(
                            subtotal +
                            delivery
                          ).toFixed(2)}
                        </strong>

                      </div>

                      <div className="checkout-row saved-row">

                        <span>
                          You Save
                        </span>

                        <strong>
                          ₹
                          {discountAmount.toFixed(
                            2
                          )}
                        </strong>

                      </div>

                      <div className="coupon-success">

                        🎉 Congrats! You saved ₹
                        {discountAmount.toFixed(
                          2
                        )}{" "}
                        with{" "}

                        <strong>
                          {appliedCoupon}
                        </strong>
                        !

                      </div>

                    </>

                  )}

                  <div className="checkout-divider" />

                  {/* FINAL TOTAL */}

                  <div className="checkout-total">

                    <span>
                      Final Total
                    </span>

                    <strong>
                      ₹
                      {total.toFixed(2)}
                    </strong>

                  </div>

                  <div className="checkout-divider" />

                  {/* TOTAL */}

                  <div className="checkout-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {total.toFixed(2)}
                    </strong>

                  </div>

                  {/* PLACE ORDER */}

                  <button
                    className="place-order-button"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >

                    {loading
                      ? "Placing Order..."
                      : "Place Order"}

                  </button>

                  {/* BACK TO CART */}

                  <Link
                    to="/cart"
                    className="back-to-cart"
                  >
                    ← Back to Cart
                  </Link>

                </aside>

              </div>

            </div>

          )}

        </>

      )}

    </main>
  );
}

export default Checkout;