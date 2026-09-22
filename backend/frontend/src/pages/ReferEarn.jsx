import { useEffect, useState } from "react";
import { getReferralDetails } from "../services/api";
import {
  FaWhatsapp,
  FaFacebookF,
  FaTelegramPlane,
  FaCopy,
  FaLink,
  FaShareAlt,
} from "react-icons/fa";
import "./ReferEarn.css";

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

function ReferEarn() {
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadReferralDetails = async () => {
    try {
      const response = await getReferralDetails();
      setReferral(response.data);
    } catch (error) {
      console.log("Referral loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferralDetails();
  }, []);

  const getReferralLink = () => {
    if (!referral) {
      return "";
    }

    return `${window.location.origin}/register?ref=${encodeURIComponent(
      referral.referral_code
    )}`;
  };

  const handleCopyLink = async () => {
    const link = getReferralLink();

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.log("Copy referral link error:", error);
    }
  };

  const handleWhatsApp = () => {
    const link = getReferralLink();

    window.open(
      `https://wa.me/?text=${encodeURIComponent(link)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleFacebook = () => {
    const link = getReferralLink();

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        link
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleTelegram = () => {
    const link = getReferralLink();

    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(link)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleNativeShare = async () => {
    const link = getReferralLink();

    if (!navigator.share) {
      await handleCopyLink();
      return;
    }

    try {
      await navigator.share({
        title: "MY-STORE Refer & Earn",
        url: link,
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.log("Share error:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="refer-page">

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

        <div className="refer-loading">
          Loading Refer & Earn...
        </div>

      </div>
    );
  }

  if (!referral) {
    return (
      <div className="refer-page">

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

        <div className="refer-error">
          Unable to load referral details.
        </div>

      </div>
    );
  }

  return (
    <div className="refer-page">

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

      <div className="refer-container">

        <div className="refer-hero">

          <div className="refer-hero-content">

            <p className="refer-label">
              MY-STORE REWARDS
            </p>

            <h1>Refer & Earn</h1>

            <p className="refer-description">
              Invite your friends to MY-STORE and earn rewards
              when they start shopping.
            </p>

            <div className="refer-code-box">

              <span>
                Your Referral Code
              </span>

              <strong>
                {referral.referral_code}
              </strong>

            </div>

          </div>

          <div className="refer-hero-icon">
            🎁
          </div>

        </div>

        <div className="refer-share-card">

          <div className="refer-section-title">

            <div>
              <h2>
                Share Your Referral Link
              </h2>

              <p>
                Send this link to your friends and family.
              </p>
            </div>

            <FaLink />

          </div>

          <div className="refer-link-box">

            <input
              type="text"
              value={getReferralLink()}
              readOnly
            />

            <button
              type="button"
              onClick={handleCopyLink}
            >
              <FaCopy />
              {copied ? "Copied" : "Copy"}
            </button>

          </div>

          <div className="refer-share-buttons">

            <button
              type="button"
              className="share-whatsapp"
              onClick={handleWhatsApp}
            >
              <FaWhatsapp />
              WhatsApp
            </button>

            <button
              type="button"
              className="share-facebook"
              onClick={handleFacebook}
            >
              <FaFacebookF />
              Facebook
            </button>

            <button
              type="button"
              className="share-telegram"
              onClick={handleTelegram}
            >
              <FaTelegramPlane />
              Telegram
            </button>

            <button
              type="button"
              className="share-more"
              onClick={handleNativeShare}
            >
              <FaShareAlt />
              More
            </button>

          </div>

        </div>

        <div className="refer-stats">

          <div className="refer-stat-card">

            <span className="refer-stat-icon">
              👥
            </span>

            <div>
              <span>Total Referrals</span>
              <strong>
                {referral.total_referrals}
              </strong>
            </div>

          </div>

          <div className="refer-stat-card">

            <span className="refer-stat-icon">
              ✓
            </span>

            <div>
              <span>Successful Referrals</span>
              <strong>
                {referral.successful_referrals}
              </strong>
            </div>

          </div>

          <div className="refer-stat-card">

            <span className="refer-stat-icon">
              ₹
            </span>

            <div>
              <span>Total Earnings</span>
              <strong>
                ₹{referral.total_earnings}
              </strong>
            </div>

          </div>

        </div>

        <div className="refer-history-card">

          <div className="refer-history-header">

            <div>

              <h2>
                Referral History
              </h2>

              <p>
                Track the people you have referred.
              </p>

            </div>

          </div>

          {referral.referral_history.length === 0 ? (

            <div className="refer-empty">

              <div>
                👥
              </div>

              <h3>
                No referrals yet
              </h3>

              <p>
                Share your referral link to start earning.
              </p>

            </div>

          ) : (

            <div className="refer-history-list">

              {referral.referral_history.map((item) => (

                <div
                  className="refer-history-row"
                  key={item.id}
                >

                  <div className="refer-person">

                    <div className="refer-avatar">
                      {item.username
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>

                      <strong>
                        {item.username}
                      </strong>

                      <span>
                        Referred on{" "}
                        {new Date(
                          item.created_at
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>

                    </div>

                  </div>

                  <div className="refer-status-area">

                    <span
                      className={`refer-status ${
                        item.status === "Successful"
                          ? "successful"
                          : "pending"
                      }`}
                    >
                      {item.status}
                    </span>

                    {item.first_bonus_credited && (
                      <span className="refer-earned">
                        ₹100 bonus credited
                      </span>
                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        <div className="refer-how-card">

          <h2>
            How Refer & Earn Works
          </h2>

          <div className="refer-steps">

            <div className="refer-step">

              <div>1</div>

              <h3>
                Share your link
              </h3>

              <p>
                Send your unique MY-STORE referral link
                to your friends.
              </p>

            </div>

            <div className="refer-step">

              <div>2</div>

              <h3>
                Friend registers
              </h3>

              <p>
                Your friend creates a MY-STORE account
                using your referral link.
              </p>

            </div>

            <div className="refer-step">

              <div>3</div>

              <h3>
                Friend shops
              </h3>

              <p>
                Their qualifying delivered order activates
                your referral reward.
              </p>

            </div>

            <div className="refer-step">

              <div>4</div>

              <h3>
                Earn rewards
              </h3>

              <p>
                Your referral earnings are credited directly
                to your MY-STORE wallet.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ReferEarn;