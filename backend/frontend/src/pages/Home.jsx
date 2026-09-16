import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const categories = [
    {
      name: "Vegetables",
      emoji: "🥦",
      description: "Fresh & healthy",
      category: "Veg",
    },
    {
      name: "Non-Veg",
      emoji: "🍗",
      description: "Quality meat",
      category: "Non-Veg",
    },
    {
      name: "Dairy",
      emoji: "🥛",
      description: "Fresh dairy",
      category: "Dairy",
    },
    {
      name: "Beverages",
      emoji: "🥤",
      description: "Cool & refreshing",
      category: "Beverages",
    },
    {
      name: "Snacks",
      emoji: "🍪",
      description: "Tasty bites",
      category: "Snacks",
    },
  ];

  return (
    <main className="home">

      {/* ================= HERO ================= */}

      <section className="home-hero">

        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>

        <div className="hero-content">

          <div className="hero-badge">
            <span>🔥</span>
            Fresh & Fast Delivery
          </div>

          <h1>
            Everything you need,
            <br />
            <span>delivered fresh.</span>
          </h1>

          <p>
            Shop fresh groceries, quality products and everyday
            essentials from the comfort of your home.
          </p>

          <div className="hero-buttons">

            <Link to="/products" className="hero-primary">
              Shop Now
              <span>→</span>
            </Link>

            <a href="#categories" className="hero-secondary">
              Explore Categories
            </a>

          </div>

          <div className="hero-pills">

            <div className="hero-pill">
              <span>🚚</span>
              Fast Delivery
            </div>

            <div className="hero-pill">
              <span>🌱</span>
              Fresh Products
            </div>

            <div className="hero-pill">
              <span>🔒</span>
              Secure Shopping
            </div>

          </div>

        </div>

        {/* ================= HERO VISUAL ================= */}

        <div className="hero-visual">

          <div className="hero-orbit orbit-one"></div>
          <div className="hero-orbit orbit-two"></div>

          <div className="hero-main-circle">
            <div className="shopping-bag">
              🛍️
            </div>
          </div>

          <div className="floating-product floating-one">
            <span>🥦</span>
            <div>
              <strong>Fresh</strong>
              <small>Vegetables</small>
            </div>
          </div>

          <div className="floating-product floating-two">
            <span>🥛</span>
            <div>
              <strong>Quality</strong>
              <small>Dairy Products</small>
            </div>
          </div>

          <div className="floating-product floating-three">
            <span>⚡</span>
            <div>
              <strong>Fast</strong>
              <small>Delivery</small>
            </div>
          </div>

        </div>

      </section>


      {/* ================= SERVICE CARDS ================= */}

      <section className="service-section">

        <div className="service-card">
          <div className="service-icon orange-icon">🌱</div>
          <div>
            <h3>Fresh Products</h3>
            <p>Carefully selected for quality</p>
          </div>
        </div>

        <div className="service-card">
          <div className="service-icon red-icon">🛒</div>
          <div>
            <h3>Easy Shopping</h3>
            <p>Simple and convenient checkout</p>
          </div>
        </div>

        <div className="service-card">
          <div className="service-icon yellow-icon">🚚</div>
          <div>
            <h3>Quick Delivery</h3>
            <p>Get your order at your doorstep</p>
          </div>
        </div>

        <div className="service-card">
          <div className="service-icon green-icon">💬</div>
          <div>
            <h3>Customer Support</h3>
            <p>We're here whenever you need us</p>
          </div>
        </div>

      </section>


      {/* ================= CATEGORIES ================= */}

      <section
        className="categories-section"
        id="categories"
      >

        <div className="section-heading">

          <div>
            <span>EXPLORE OUR STORE</span>
            <h2>Shop by Category</h2>
          </div>

          <Link to="/products">
            View all →
          </Link>

        </div>

        <div className="categories-grid">

          {categories.map((category) => (

            <Link
              key={category.category}
              to={`/products?category=${category.category}`}
              className="category-card"
            >

              <div className="category-top">
                <div className="category-icon">
                  {category.emoji}
                </div>

                <span className="category-arrow">
                  →
                </span>
              </div>

              <h3>{category.name}</h3>

              <p>{category.description}</p>

              <span className="category-shop">
                Shop now
              </span>

            </Link>

          ))}

        </div>

      </section>


      {/* ================= PROMOTION ================= */}

      <section className="promo-section">

        <div className="promo-glow"></div>

        <div className="promo-content">

          <span className="promo-label">
            SPECIAL OFFER
          </span>

          <h2>
            Fresh choices.
            <br />
            Better prices.
          </h2>

          <p>
            Discover great products for your everyday needs
            and enjoy amazing value while you shop.
          </p>

          <Link
            to="/products"
            className="promo-button"
          >
            Explore Offers
            <span>→</span>
          </Link>

        </div>

        <div className="promo-visual">

          <div className="promo-circle">
            🛒
          </div>

          <div className="promo-small-card">
            <span>🎁</span>
            <div>
              <strong>Great Deals</strong>
              <small>Everyday</small>
            </div>
          </div>

        </div>

      </section>


      {/* ================= FEATURED ================= */}

      <section className="featured-section">

        <div className="section-heading">

          <div>
            <span>OUR COLLECTION</span>
            <h2>Ready to Shop?</h2>
          </div>

          <Link to="/products">
            View products →
          </Link>

        </div>

        <div className="featured-box">

          <div className="featured-icon">
            🛍️
          </div>

          <h3>
            Your everyday essentials are waiting
          </h3>

          <p>
            Browse our complete collection and find
            everything you need in one place.
          </p>

          <Link
            to="/products"
            className="featured-button"
          >
            Browse Products
            <span>→</span>
          </Link>

        </div>

      </section>

    </main>
  );
}

export default Home;
