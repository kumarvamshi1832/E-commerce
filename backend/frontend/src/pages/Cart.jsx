import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import "./Cart.css";

function Cart() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const [wishlistIds, setWishlistIds] = useState([]);

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

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await api.get("wishlist/");

        setWishlistIds(
          response.data.map((item) => item.id)
        );
      } catch (error) {
        console.error(
          "Wishlist fetch error:",
          error
        );
      }
    };

    fetchWishlist();
  }, []);

  const handleWishlist = async (productId) => {
    try {
      if (wishlistIds.includes(productId)) {
        await api.delete(
          `wishlist/remove/${productId}/`
        );

        setWishlistIds((current) =>
          current.filter(
            (id) => id !== productId
          )
        );
      } else {
        await api.post(
          `wishlist/add/${productId}/`
        );

        setWishlistIds((current) => [
          ...current,
          productId,
        ]);
      }
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );
    }
  };

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price) *
        item.quantity,
    0
  );

  const delivery =
    subtotal > 0 ? 40 : 0;

  const total =
    subtotal + delivery;

  if (cart.length === 0) {
    return (
      <main className="cart-page">

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

        <div className="empty-cart">

          <div className="empty-cart-icon">
            🛒
          </div>

          <h1>Your cart is empty</h1>

          <p>
            Looks like you haven't added
            anything to your cart yet.
          </p>

          <Link
            to="/products"
            className="continue-shopping"
          >
            Start Shopping
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="cart-page">

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

      <div className="cart-container">

        <div className="cart-header">

          <div>

            <p className="cart-eyebrow">
              YOUR SHOPPING BAG
            </p>

            <h1>
              Your Cart
            </h1>

            <p>
              {cart.length}{" "}
              {cart.length === 1
                ? "item"
                : "items"}{" "}
              in your cart
            </p>

          </div>

          <Link
            to="/products"
            className="continue-shopping-link"
          >
            ← Continue Shopping
          </Link>

        </div>

        <div className="cart-layout">

          <section className="cart-items">

            {cart.map((item) => (

              <article
                className="cart-item"
                key={item.id}
              >

                <button
                  type="button"
                  className={`wishlist-heart ${
                    wishlistIds.includes(
                      item.id
                    )
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleWishlist(
                      item.id
                    )
                  }
                  aria-label={
                    wishlistIds.includes(
                      item.id
                    )
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  {wishlistIds.includes(
                    item.id
                  )
                    ? "❤️"
                    : "♡"}
                </button>

                <div className="cart-item-image">

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

                <div className="cart-item-details">

                  <span className="cart-item-category">
                    {item.category}
                  </span>

                  <h2>
                    {item.name}
                  </h2>

                  <p className="cart-item-price">
                    ₹
                    {Number(
                      item.price
                    ).toFixed(2)}
                  </p>

                </div>

                <div className="cart-item-actions">

                  <div className="cart-quantity">

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

                  {item.quantity >=
                  item.stock ? (

                    <p className="stock-limit-message">
                      ⚠️ You reached the
                      stock limit. Only{" "}
                      {item.stock}{" "}
                      available.
                    </p>

                  ) : (

                    <p className="stock-available-message">
                      ✓{" "}
                      {item.stock -
                        item.quantity}{" "}
                      more available
                    </p>

                  )}

                  <strong className="cart-item-total">
                    ₹
                    {(
                      Number(
                        item.price
                      ) *
                      item.quantity
                    ).toFixed(2)}
                  </strong>

                </div>

              </article>

            ))}

          </section>

          <aside className="cart-summary">

            <h2>
              Order Summary
            </h2>

            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {subtotal.toFixed(
                  2
                )}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Delivery
              </span>

              <strong>
                ₹
                {delivery.toFixed(
                  2
                )}
              </strong>

            </div>

            <div className="summary-divider" />

            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                ₹
                {total.toFixed(
                  2
                )}
              </strong>

            </div>

            <Link
              to="/checkout"
              className="checkout-button"
            >
              Proceed to Checkout
            </Link>

            <div className="secure-checkout">
              🔒 Secure checkout
            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}

export default Cart;