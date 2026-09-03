import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const categories = [
    {
      name: "Vegetables",
      emoji: "🥦",
      color: "#e9f8ed",
      category: "Veg",
    },
    {
      name: "Non-Veg",
      emoji: "🍗",
      color: "#fff0ed",
      category: "Non-Veg",
    },
    {
      name: "Dairy",
      emoji: "🥛",
      color: "#eef5ff",
      category: "Dairy",
    },
    {
      name: "Beverages",
      emoji: "🥤",
      color: "#fff5df",
      category: "Beverages",
    },
    {
      name: "Snacks",
      emoji: "🍪",
      color: "#f5edff",
      category: "Snacks",
    },
  ];

  return (
    <main className="home">

      {/* Hero */}

      <section className="hero">
        <div className="hero-content">

          <span className="hero-badge">
            ✨ Fresh products, delivered fast
          </span>

          <h1>
            Everything you need,
            <br />
            <span>delivered to your door.</span>
          </h1>

          <p>
            Shop fresh groceries, quality products and
            everyday essentials from the comfort of your home.
          </p>

          <div className="hero-buttons">
            <Link to="/products" className="hero-primary">
              Shop Now →
            </Link>

            <a href="#categories" className="hero-secondary">
              Explore Categories
            </a>
          </div>

        </div>

        <div className="hero-visual">
          <div className="hero-circle">
            🛒
          </div>

          <div className="floating-card card-one">
            🥦 Fresh
          </div>

          <div className="floating-card card-two">
            ⚡ Fast Delivery
          </div>

          <div className="floating-card card-three">
            ⭐ Quality
          </div>
        </div>
      </section>

      {/* Categories */}

      <section
        className="categories-section"
        id="categories"
      >
        <div className="section-heading">
          <div>
            <span>EXPLORE</span>
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
              style={{
                backgroundColor: category.color,
              }}
            >
              <div className="category-icon">
                {category.emoji}
              </div>

              <h3>{category.name}</h3>

              <span>
                Shop now →
              </span>
            </Link>
          ))}

        </div>
      </section>

      {/* Promotional Banner */}

      <section className="promo-section">

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
            Discover amazing products and enjoy
            great value on your everyday shopping.
          </p>

          <Link
            to="/products"
            className="promo-button"
          >
            Shop Offers →
          </Link>

        </div>

        <div className="promo-visual">
          🛍️
        </div>

      </section>

      {/* Featured Products */}

      <section className="featured-section">

        <div className="section-heading">

          <div>
            <span>OUR COLLECTION</span>
            <h2>Featured Products</h2>
          </div>

          <Link to="/products">
            View all →
          </Link>

        </div>

        <div className="featured-placeholder">
          <div>
            <span className="placeholder-icon">
              🛒
            </span>

            <h3>Fresh products are waiting for you</h3>

            <p>
              Browse our complete collection and
              find your favorites.
            </p>

            <Link
              to="/products"
              className="browse-button"
            >
              Browse Products
            </Link>
          </div>
        </div>

      </section>

    </main>
  );
}

export default Home;