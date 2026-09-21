import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  const categories = [
    {
      name: "Leafy Greens",
      category: "Veg",
      image:
        "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=500&q=85",
    },
    {
      name: "Root Vegetables",
      category: "Veg",
      image:
        "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=500&q=85",
    },
    {
      name: "Tomatoes",
      category: "Veg",
      image:
        "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=500&q=85",
    },
    {
      name: "Onions & Garlic",
      category: "Veg",
      image:
        "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=500&q=85",
    },
    {
      name: "Capsicum",
      category: "Veg",
      image:
        "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=500&q=85",
    },
    {
      name: "Brinjal",
      category: "Veg",
      image:
        "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=85",
    },
    {
      name: "Cucumbers",
      category: "Veg",
      image:
        "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=500&q=85",
    },
    {
      name: "Beans & Peas",
      category: "Veg",
      image:
        "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=500&q=85",
    },
  ];

  useEffect(() => {
    api
      .get("products/")
      .then((response) => {
        setProducts(response.data || []);
      })
      .catch((error) => {
        console.error("Error loading home products:", error);
      });
  }, []);

  const handleReviewsClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const featuredProducts = products.slice(0, 4);

  return (
    <main className="home">

      {/* ================= ANNOUNCEMENT ================= */}

      <div className="announcement-bar">
        <div className="announcement-left">
          <span>🚚</span>
          Fresh & Healthy Groceries Delivered to Your Doorstep
          <b>•</b>
          {/* Free Delivery on Orders Above ₹499 */}
        </div>

        {/* <div className="announcement-right">
          <span>Track Order</span>
          <span>|</span>
          <span>Help</span>
          <span>|</span>
          <span>Login / Sign Up</span>
        </div> */}
      </div>

      {/* ================= HERO ================= */}

      <section className="home-hero">

        <div className="hero-decoration hero-decoration-left"></div>
        <div className="hero-decoration hero-decoration-right"></div>

        <div className="hero-content">

          <div className="hero-eyebrow">
            FRESH • LOCAL • ORGANIC
          </div>

          <h1>
            Nature's Goodness
            <br />
            <span>On Your Table</span>
          </h1>

          <p>
            Farm fresh vegetables, handpicked for your
            health and happiness. Because you deserve
            the best, every day.
          </p>

          <Link to="/products" className="hero-shop-button">
            Shop Fresh Vegetables
            <span>→</span>
          </Link>

        </div>

        <div className="hero-visual">

          <div className="hero-handwritten">
            Farm to
            <br />
            Your Home
            <span>♡</span>
          </div>

          <div className="hero-basket-glow"></div>

          <div className="hero-image-container">

            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=90"
              alt="Fresh vegetables"
            />

          </div>

        </div>

      </section>

      {/* ================= BENEFITS ================= */}

      <section className="benefits-strip">

        <div className="benefit-item">
          <div className="benefit-icon">♧</div>
          <div>
            <strong>100% Fresh</strong>
            <span>Handpicked daily</span>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon">♢</div>
          <div>
            <strong>No Harmful Chemicals</strong>
            <span>Safe for your family</span>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon">🚚</div>
          <div>
            <strong>Fast Delivery</strong>
            <span>Across your city</span>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon">♡</div>
          <div>
            <strong>Support Local Farmers</strong>
            <span>Better for the community</span>
          </div>
        </div>

      </section>

      {/* ================= CATEGORIES ================= */}

      <section className="categories-section" id="categories">

        <div className="section-top">

          <div>
            <span className="section-label">
              SHOP BY CATEGORY
            </span>

            <h2>
              Fresh Picks for Every Meal
            </h2>
          </div>

          <Link to="/products" className="view-link">
            View All Categories →
          </Link>

        </div>

        <div className="categories-grid">

          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/products?category=${category.category}`}
              className="category-card"
            >

              <div className="category-image">
                <img
                  src={category.image}
                  alt={category.name}
                />
              </div>

              <div className="category-bottom">

                <h3>{category.name}</h3>

                <span className="category-arrow">
                  +
                </span>

              </div>

            </Link>
          ))}

        </div>

      </section>

      {/* ================= FEATURED PRODUCTS ================= */}

      {/* <section className="featured-section">

        <div className="featured-heading">

          <div>
            <span className="section-label light-label">
              FEATURED PRODUCTS
            </span>

            <h2>
              Top Quality, Freshly Delivered
            </h2>
          </div>

          <Link to="/products" className="featured-view-link">
            View All Products →
          </Link>

        </div>

        {featuredProducts.length > 0 ? (

          <div className="featured-products-grid">

            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onReviewsClick={handleReviewsClick}
              />
            ))}

          </div>

        ) : (

          <div className="featured-empty">
            <h3>Fresh products are coming soon</h3>

            <Link to="/products">
              Browse Products →
            </Link>
          </div>

        )}

      </section> */}

    </main>
  );
}

export default Home;