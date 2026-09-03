import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import "./Products.css";


function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("products/")
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading products:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h2>Loading products...</h2>;
  }

  return (
    <main className="products-section">
      <div className="section-header">
        <div>
          <p className="section-label">OUR COLLECTION</p>
          <h2>All Products</h2>
        </div>

        <p className="product-count">
          {products.length} products
        </p>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </main>
  );
}

export default Products;