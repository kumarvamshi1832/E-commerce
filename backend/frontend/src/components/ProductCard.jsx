import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./ProductCard.css";

import {
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
  FaTelegramPlane,
  FaEnvelope,
  FaLink,
} from "react-icons/fa";

import {
  IoShareSocialOutline,
  IoClose,
} from "react-icons/io5";

function ProductCard({
  product,
  onReviewsClick,
  deliveryStatus,
  checkedPincode,
}) {
  const {
    cart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const {
    increaseWishlistCount,
    decreaseWishlistCount,
  } = useWishlist();

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  const [showShare, setShowShare] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const cartItem = cart.find(
    (item) => item.id === product.id
  );

  const quantity = cartItem
    ? cartItem.quantity
    : 0;

  useEffect(() => {
    const checkWishlist = async () => {
      const user =
        localStorage.getItem("user");

      if (!user) {
        setIsWishlisted(false);
        return;
      }

      try {
        const response = await api.get(
          "wishlist/"
        );

        const exists =
          response.data.some(
            (item) =>
              item.id === product.id
          );

        setIsWishlisted(exists);
      } catch (error) {
        console.error(
          "Wishlist check error:",
          error
        );
      }
    };

    checkWishlist();
  }, [product.id]);

  const handleAddToCart = () => {
    const user =
      localStorage.getItem("user");

    if (!user) {
      alert(
        "Please login first to add items to cart."
      );
      return;
    }

    if (product.stock <= 0) {
      return;
    }

    addToCart(product);
  };

  const handleWishlist = async () => {
    const user =
      localStorage.getItem("user");

    if (!user) {
      alert(
        "Please login first to use wishlist."
      );
      return;
    }

    try {
      if (isWishlisted) {
        await api.delete(
          `wishlist/remove/${product.id}/`
        );

        setIsWishlisted(false);
        decreaseWishlistCount();
      } else {
        await api.post(
          `wishlist/add/${product.id}/`
        );

        setIsWishlisted(true);
        increaseWishlistCount();
      }
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        alert("Please login first.");
      }
    }
  };

const getProductUrl = () => {
  return `${window.location.origin}/product/${product.id}`;
};

const getShareText = () => {
  return `🛒 Check out ${product.name} on MY-STORE`;
};

const handleCopyLink = async () => {
  const productUrl = getProductUrl();

  try {
    await navigator.clipboard.writeText(productUrl);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  } catch (error) {
    console.error("Copy link error:", error);

    const textArea = document.createElement("textarea");
    textArea.value = productUrl;

    document.body.appendChild(textArea);
    textArea.select();

    document.execCommand("copy");

    document.body.removeChild(textArea);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }
};


const handleWhatsAppShare = () => {
  const productUrl = getProductUrl();

  const whatsappUrl =
    `https://wa.me/?text=${encodeURIComponent(productUrl)}`;

  window.open(
    whatsappUrl,
    "_blank",
    "noopener,noreferrer"
  );
};


const handleFacebookShare = () => {
  const productUrl = getProductUrl();

  const facebookUrl =
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;

  window.open(
    facebookUrl,
    "_blank",
    "noopener,noreferrer"
  );
};


const handleInstagramShare = async () => {
  const productUrl = getProductUrl();

  if (navigator.share) {
    try {
      await navigator.share({
        title: product.name,
        text: getShareText(),
        url: productUrl,
      });

      setShowShare(false);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Instagram share error:", error);
      }
    }

    return;
  }

  await handleCopyLink();
};


const handleTelegramShare = () => {
  const productUrl = getProductUrl();

  const telegramUrl =
    `https://t.me/share/url?url=${encodeURIComponent(productUrl)}`;

  window.open(
    telegramUrl,
    "_blank",
    "noopener,noreferrer"
  );
};


const handleEmailShare = () => {
  const productUrl = getProductUrl();

  const subject =
    `Check out ${product.name} on MY-STORE`;

  const body =
    `${getShareText()}\n\n${productUrl}`;

  window.location.href =
    `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};


const handleNativeShare = async () => {
  const productUrl = getProductUrl();

  if (!navigator.share) {
    await handleCopyLink();
    return;
  }

  try {
    await navigator.share({
      title: product.name,
      text: getShareText(),
      url: productUrl,
    });

    setShowShare(false);
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Native share error:", error);
    }
  }
};


const handleShareButton = () => {
  setShowShare((previousValue) => !previousValue);
};

  return (
    <article className="product-card">

      <div className="product-image-wrapper">

        <Link
          to={`/product/${product.id}`}
          className="product-image-link"
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
          ) : (
            <div className="no-image">
              🛍️
            </div>
          )}
        </Link>

        <div className="product-top-actions">

          <button
            type="button"
            className="product-share"
            onClick={handleShareButton}
            aria-label="Share product"
            title="Share product"
          >
            <IoShareSocialOutline />
          </button>

          <button
            type="button"
            className={`product-wishlist ${
              isWishlisted
                ? "wishlisted"
                : ""
            }`}
            onClick={handleWishlist}
            aria-label={
              isWishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            title={
              isWishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
          >
            {isWishlisted
              ? "♥"
              : "♡"}
          </button>

        </div>

        {showShare && (
          <div
            className="product-share-menu"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="share-menu-header">

              <div>
                <strong>
                  Share Product
                </strong>

                <span>
                  Share this product with others
                </span>
              </div>

              <button
                type="button"
                className="share-close-button"
                onClick={() =>
                  setShowShare(false)
                }
                aria-label="Close share menu"
              >
                <IoClose />
              </button>

            </div>

            <div className="share-options">

              <button
                type="button"
                className="share-option copy-share"
                onClick={handleCopyLink}
              >
                <span className="share-option-icon">
                  <FaLink />
                </span>

                <span>
                  {copied
                    ? "Link Copied"
                    : "Copy Link"}
                </span>
              </button>

              <button
                type="button"
                className="share-option whatsapp-share"
                onClick={handleWhatsAppShare}
              >
                <span className="share-option-icon whatsapp-icon">
                  <FaWhatsapp />
                </span>

                <span>
                  WhatsApp
                </span>
              </button>

              <button
                type="button"
                className="share-option facebook-share"
                onClick={handleFacebookShare}
              >
                <span className="share-option-icon facebook-icon">
                  <FaFacebookF />
                </span>

                <span>
                  Facebook
                </span>
              </button>

              <button
                type="button"
                className="share-option instagram-share"
                onClick={handleInstagramShare}
              >
                <span className="share-option-icon instagram-icon">
                  <FaInstagram />
                </span>

                <span>
                  Instagram
                </span>
              </button>

              <button
                type="button"
                className="share-option telegram-share"
                onClick={handleTelegramShare}
              >
                <span className="share-option-icon telegram-icon">
                  <FaTelegramPlane />
                </span>

                <span>
                  Telegram
                </span>
              </button>

              <button
                type="button"
                className="share-option email-share"
                onClick={handleEmailShare}
              >
                <span className="share-option-icon email-icon">
                  <FaEnvelope />
                </span>

                <span>
                  Email
                </span>
              </button>

              <button
                type="button"
                className="share-option native-share"
                onClick={handleNativeShare}
              >
                <span className="share-option-icon native-icon">
                  <IoShareSocialOutline />
                </span>

                <span>
                  More
                </span>
              </button>

            </div>

          </div>
        )}

        {product.stock <= 0 && (
          <span className="out-stock-badge">
            OUT OF STOCK
          </span>
        )}

      </div>

      <div className="product-details">

        <p className="product-category">
          {product.category}
        </p>

        <Link
          to={`/product/${product.id}`}
          className="product-title-link"
        >
          <h3>{product.name}</h3>
        </Link>

        <div className="product-rating">

          <div className="rating-main">

            {product.rating_count > 0 ? (
              <>
                <span className="rating-stars">
                  {"★".repeat(
                    Math.round(
                      product.average_rating
                    )
                  )}
                </span>

                <span className="rating-count">
                  ({product.rating_count})
                </span>
              </>
            ) : (
              <span className="no-rating">
                No ratings yet
              </span>
            )}

          </div>

          <button
            type="button"
            className="reviews-link"
            onClick={() =>
              onReviewsClick(
                product.id
              )
            }
          >
            Reviews →
          </button>

        </div>

        {checkedPincode && (
          <div
            className={
              deliveryStatus
                ? "delivery-status deliverable"
                : "delivery-status not-deliverable"
            }
          >
            {deliveryStatus ? (
              <>
                <span>✓</span>

                <span>
                  Deliverable to{" "}
                  {checkedPincode}
                </span>
              </>
            ) : (
              <>
                <span>✕</span>

                <span>
                  Not deliverable to{" "}
                  {checkedPincode}
                </span>
              </>
            )}
          </div>
        )}

        <p className="product-description">
          {product.description}
        </p>

        <div className="product-bottom">

          <div className="product-price-area">

            <div className="product-price-row">

              <strong className="price">
                ₹
                {Number(
                  product.price
                ).toFixed(2)}
              </strong>

              <span className="price-unit">
                /kg
              </span>

            </div>

            {product.stock > 0 ? (
              <span className="stock">
                ✓ In Stock
              </span>
            ) : (
              <span className="out-stock">
                ✕ Out of Stock
              </span>
            )}

          </div>

          {quantity === 0 ? (

            <button
              type="button"
              className="add-cart"
              disabled={
                product.stock <= 0
              }
              onClick={handleAddToCart}
            >
              <span>🛒</span>

              Add to Cart
            </button>

          ) : (

            <div className="quantity-control">

              <button
                type="button"
                onClick={() =>
                  decreaseQuantity(
                    product.id
                  )
                }
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span>
                {quantity}
              </span>

              <button
                type="button"
                disabled={
                  quantity >=
                  product.stock
                }
                onClick={() =>
                  increaseQuantity(
                    product.id
                  )
                }
                aria-label="Increase quantity"
              >
                +
              </button>

            </div>

          )}

        </div>

      </div>

    </article>
  );
}

export default ProductCard;