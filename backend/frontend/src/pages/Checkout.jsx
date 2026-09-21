import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api, { getAddresses } from "../services/api";
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

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);

  // Delivery availability
  const [deliveryStatus, setDeliveryStatus] = useState({});
  const [checkingDelivery, setCheckingDelivery] = useState(false);

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

  // =========================
  // LOAD ADDRESSES
  // =========================

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setAddressLoading(true);

      const response = await getAddresses();

      setAddresses(response.data);

      const defaultAddress = response.data.find(
        (address) => address.is_default
      );

      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        setPin(defaultAddress.pincode);

        checkPincode(defaultAddress.pincode);
      }
    } catch (error) {
      console.error(
        "Address loading error:",
        error
      );

      setError(
        "Unable to load your saved addresses."
      );
    } finally {
      setAddressLoading(false);
    }
  };

  // =========================
  // SELECT ADDRESS
  // =========================

  const selectAddress = (address) => {
    setSelectedAddress(address);

    setPin(address.pincode);

    setLocation(null);
    setPinError("");
    setError("");
    setDeliveryStatus({});

    checkPincode(address.pincode);
  };

  // =========================
  // CHECK CART DELIVERY
  // =========================

  const checkCartDelivery = async (enteredPincode) => {
    try {
      setCheckingDelivery(true);

      const response = await api.get(
        `delivery/check/?pincode=${enteredPincode}`
      );

      const status = {};

      response.data.products.forEach((item) => {
        status[item.product_id] = item.deliverable;
      });

      setDeliveryStatus(status);

      return status;
    } catch (error) {
      console.error(
        "Delivery check error:",
        error
      );

      setDeliveryStatus({});

      return null;
    } finally {
      setCheckingDelivery(false);
    }
  };

  // =========================
  // CHECK PINCODE
  // =========================

  const checkPincode = async (value) => {
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
        setLocation(null);
        setDeliveryStatus({});
        return;
      }

      const firstOffice = data[0].PostOffice[0];

      setLocation({
        postOffice: firstOffice.Name,
        district: firstOffice.District,
        state: firstOffice.State,
      });

      await checkCartDelivery(value);

    } catch (error) {
      console.error(
        "Pincode error:",
        error
      );

      setPinError(
        "Unable to check pincode. Please try again."
      );
    } finally {
      setPinLoading(false);
    }
  };

  // =========================
  // PINCODE INPUT
  // =========================

  const pincode = async (e) => {
    let value = e.target.value;

    value = value
      .replace(/\D/g, "")
      .slice(0, 6);

    setPin(value);

    setLocation(null);
    setPinError("");
    setError("");
    setDeliveryStatus({});

    if (value.length !== 6) {
      return;
    }

    await checkPincode(value);
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
  // UNDELIVERABLE PRODUCTS
  // =========================

  const unavailableItems = cart.filter(
    (item) => deliveryStatus[item.id] === false
  );

  const hasUndeliverableItems =
    unavailableItems.length > 0;

  // =========================
  // APPLY COUPON
  // =========================

  const applyCoupon = (code) => {
    const coupon = String(
      code || couponCode
    )
      .trim()
      .toUpperCase();

    if (coupon === "SAVE10") {
      setCouponCode("SAVE10");
      setAppliedCoupon("SAVE10");
      setDiscountPercent(10);
      setCouponMessage(
        "✓ 10% discount applied!"
      );

    } else if (coupon === "SAVE20") {
      setCouponCode("SAVE20");
      setAppliedCoupon("SAVE20");
      setDiscountPercent(20);
      setCouponMessage(
        "✓ 20% discount applied!"
      );

    } else if (coupon === "SAVE30") {
      setCouponCode("SAVE30");
      setAppliedCoupon("SAVE30");
      setDiscountPercent(30);
      setCouponMessage(
        "✓ 30% discount applied!"
      );

    } else {
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

    if (!selectedAddress) {
      setError(
        "Please select a delivery address."
      );
      return;
    }

    if (pin.length !== 6) {
      setError(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    if (!location) {
      setError(
        "Please enter a valid pincode before placing the order."
      );
      return;
    }

    if (
      selectedAddress.pincode !== pin
    ) {
      setError(
        "Selected address pincode and delivery pincode must match."
      );
      return;
    }

    const status =
      await checkCartDelivery(pin);

    if (!status) {
      setError(
        "Unable to check delivery availability. Please try again."
      );
      return;
    }

    const unavailableProducts =
      cart.filter(
        (item) =>
          status[item.id] === false
      );

    if (
      unavailableProducts.length > 0
    ) {

      const productNames =
        unavailableProducts
          .map((item) => item.name)
          .join(", ");

      setError(
        `${productNames} ${
          unavailableProducts.length === 1
            ? "is"
            : "are"
        } not deliverable to ${pin}.`
      );

      return;
    }

    try {

      setLoading(true);
      setError("");

      const orderItems =
        cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        }));

      const response =
        await api.post(
          "orders/",
          {
            items: orderItems,
            coupon_code: appliedCoupon,
            pincode: pin,
            address_id:
              selectedAddress.id,
          }
        );

      console.log(
        "Order created:",
        response.data
      );

      clearCart();

      setShowBalloons(true);

      setTimeout(() => {
        navigate("/");
      }, 4000);

    } catch (error) {

      console.error(
        "Order error:",
        error
      );

      if (
        error.response?.data
          ?.non_deliverable_products
      ) {

        const products =
          error.response.data
            .non_deliverable_products;

        const productNames =
          products
            .map(
              (item) =>
                item.product_name
            )
            .join(", ");

        setError(
          `${productNames} ${
            products.length === 1
              ? "is"
              : "are"
          } not deliverable to ${
            error.response.data.pincode ||
            pin
          }.`
        );

      } else {

        setError(
          error.response?.data?.error ||
          "Failed to place order. Please try again."
        );
      }

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

       <div className="floating-groceries">
    {vegetables.map((vegetable, index) => (
      <span
        key={index}
        className="floating-grocery"
      >
        {vegetable}
      </span>
    ))}
  </div>

      {showBalloons && (
        <BalloonEffect />
      )}

      {showBalloons ? (

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

              {error && (
                <div className="checkout-error">
                  ⚠️ {error}
                </div>
              )}

              <div className="checkout-layout">

                {/* ORDER ITEMS */}

                <section className="checkout-items">

                  <h2>
                    Your Items
                  </h2>

                  {cart.map((item) => (

                    <article
                      className="checkout-item"
                      key={item.id}
                    >

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

                        {pin.length === 6 &&
                          deliveryStatus[
                            item.id
                          ] !== undefined && (

                            <p
                              className={
                                deliveryStatus[
                                  item.id
                                ]
                                  ? "checkout-deliverable"
                                  : "checkout-not-deliverable"
                              }
                            >

                              {deliveryStatus[
                                item.id
                              ]
                                ? `✓ Deliverable to ${pin}`
                                : `✕ Not deliverable to ${pin}`}

                            </p>

                          )}

                        <div className="checkout-quantity">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item.id
                              )
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
                              increaseQuantity(
                                item.id
                              )
                            }
                          >
                            +
                          </button>

                        </div>

                      </div>

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

                {/* COUPON + ADDRESS + PINCODE */}

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

                        if (
                          e.key === "Enter"
                        ) {

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
                      DELIVERY ADDRESS
                  ========================= */}

                  <div className="checkout-address-section">

                    <h2>
                      Delivery Address
                    </h2>

                    {addressLoading ? (

                      <p>
                        Loading addresses...
                      </p>

                    ) : addresses.length === 0 ? (

                      <div className="no-address">

                        <p>
                          No saved addresses found.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              "/addresses"
                            )
                          }
                        >
                          Add Address
                        </button>

                      </div>

                    ) : (

                      <div className="address-list">

                        {addresses.map(
                          (address) => (

                            <div
                              key={address.id}
                              className={`checkout-address-card ${
                                selectedAddress?.id ===
                                address.id
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                selectAddress(
                                  address
                                )
                              }
                            >

                              <div className="address-card-header">

                                <strong>
                                  {address.full_name}
                                </strong>

                                <span>
                                  {
                                    address.address_type
                                  }
                                </span>

                              </div>

                              <p>
                                {address.phone}
                              </p>

                              <p>
                                {
                                  address.address_line1
                                }

                                {address.address_line2 &&
                                  `, ${address.address_line2}`}
                              </p>

                              <p>
                                {address.city},{" "}
                                {address.state} -{" "}
                                {address.pincode}
                              </p>

                              {address.landmark && (

                                <p>
                                  Landmark:{" "}
                                  {address.landmark}
                                </p>

                              )}

                              {selectedAddress?.id ===
                                address.id && (

                                <div className="selected-address">
                                  ✓ Selected
                                </div>

                              )}

                            </div>

                          )
                        )}

                      </div>

                    )}

                    {addresses.length > 0 && (

                      <button
                        type="button"
                        className="add-new-address-button"
                        onClick={() =>
                          navigate(
                            "/addresses"
                          )
                        }
                      >
                        + Add New Address
                      </button>

                    )}

                  </div>

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

                    {checkingDelivery && (
                      <p>
                        Checking product delivery...
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

                {/* ORDER SUMMARY */}

                <aside className="checkout-summary">

                  <h2>
                    Order Summary
                  </h2>

                  <div className="checkout-row">

                    <span>
                      Subtotal
                    </span>

                    <strong>
                      ₹
                      {subtotal.toFixed(2)}
                    </strong>

                  </div>

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

                  <div className="checkout-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {total.toFixed(2)}
                    </strong>

                  </div>

                  {hasUndeliverableItems && (

                    <div className="checkout-delivery-warning">

                      ⚠️ Some products cannot be delivered
                      to {pin}. Please remove them or
                      choose another pincode.

                    </div>

                  )}

                  <button
                    className="place-order-button"
                    onClick={handlePlaceOrder}
                    disabled={
                      loading ||
                      checkingDelivery ||
                      hasUndeliverableItems
                    }
                  >

                    {loading
                      ? "Placing Order..."
                      : checkingDelivery
                        ? "Checking Delivery..."
                        : hasUndeliverableItems
                          ? "Delivery Unavailable"
                          : "Place Order"}

                  </button>

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