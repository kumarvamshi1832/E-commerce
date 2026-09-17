import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminInventory.css";
import AdminExportActions from "../components/AdminExportActions";

function AdminInventory() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedProduct, setSelectedProduct] = useState(null);
const [newStock, setNewStock] = useState("");
const [updatingStock, setUpdatingStock] = useState(false);

    const fetchInventory = async () => {

        const token = localStorage.getItem("token");

        try {

            const response = await api.get(
                "admin/inventory/",
                {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                }
            );

            setProducts(response.data);

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.error ||
                "Unable to load inventory."
            );

        }

        setLoading(false);
    };

    const updateStock = async () => {

    if (newStock === "" || Number(newStock) < 0) {
        alert("Stock cannot be negative.");
        return;
    }

    const token = localStorage.getItem("token");

    setUpdatingStock(true);

    try {

        const response = await api.patch(
            `admin/inventory/${selectedProduct.id}/update/`,
            {
                stock: Number(newStock)
            },
            {
                headers: {
                    Authorization: `Token ${token}`
                }
            }
        );

        setProducts((previousProducts) =>
            previousProducts.map((product) =>
                product.id === selectedProduct.id
                    ? {
                        ...product,
                        stock: response.data.stock,
                        stock_status:
                            response.data.stock === 0
                                ? "Out of Stock"
                                : response.data.stock <= 5
                                    ? "Low Stock"
                                    : "In Stock"
                    }
                    : product
            )
        );

        setSelectedProduct(null);
        setNewStock("");

        alert("Stock updated successfully.");

    } catch (error) {

        console.log(error);

        alert(
            error.response?.data?.error ||
            "Unable to update stock."
        );

    } finally {

        setUpdatingStock(false);

    }
};

    useEffect(() => {
        fetchInventory();
    }, []);

    const exportColumns = [
    {
        label: "Product",
        key: "product"
    },
    {
        label: "Category",
        key: "category"
    },
    {
        label: "Stock",
        key: "stock"
    },
    {
        label: "Stock Status",
        key: "stock_status"
    },
    {
        label: "Product Status",
        key: "product_status"
    }
];

const exportData = products.map((product) => ({
    product: product.name,
    category: product.category,
    stock: product.stock,
    stock_status: product.stock_status,
    product_status: product.is_active
        ? "Active"
        : "Inactive"
}));

    if (loading) {
        return (
            <div className="admin-inventory-page">
                <h2>Loading inventory...</h2>
            </div>
        );
    }

    return (
        <div className="admin-inventory-page">

            <div className="admin-inventory-header">

    <div>
        <h1>Inventory</h1>

        <p>
            Monitor product stock and inventory levels
        </p>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        <AdminExportActions
            title="Inventory"
            columns={exportColumns}
            data={exportData}
            filename="mystore-inventory"
        />

        <div className="inventory-count">
            {products.length} Products
        </div>

    </div>

</div>

            <div className="inventory-table-container">

                <table className="inventory-table">

                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Stock Status</th>
                            <th>Product Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>


                    <tbody>

                        {products.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="5"
                                    className="no-inventory"
                                >
                                    No products found.
                                </td>
                            </tr>

                        ) : (

                            products.map((product) => (

                                <tr key={product.id}>

                                    <td>

                                        <div className="inventory-product">

                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                />
                                            ) : (
                                                <div className="inventory-no-image">
                                                    No Image
                                                </div>
                                            )}

                                            <strong>
                                                {product.name}
                                            </strong>

                                        </div>

                                    </td>


                                    <td>
                                        {product.category}
                                    </td>


                                    <td>

                                        <span className="stock-number">
                                            {product.stock}
                                        </span>

                                    </td>


                                    <td>

                                        <span
                                            className={`inventory-stock-status ${
                                                product.stock_status
                                                    .toLowerCase()
                                                    .replaceAll(" ", "-")
                                            }`}
                                        >
                                            {product.stock_status}
                                        </span>

                                    </td>


                                    <td>

                                        <span
                                            className={`inventory-product-status ${
                                                product.is_active
                                                    ? "active"
                                                    : "inactive"
                                            }`}
                                        >
                                            {product.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>

                                    </td>

                                    <td>

    <button
        className="update-stock-btn"
        onClick={() => {
            setSelectedProduct(product);
            setNewStock(product.stock);
        }}
    >
        Update Stock
    </button>

</td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

                {selectedProduct && (

    <div className="stock-modal-overlay">

        <div className="stock-modal">

            <div className="stock-modal-header">

                <div>
                    <h2>Update Stock</h2>

                    <p>
                        {selectedProduct.name}
                    </p>
                </div>

                <button
                    className="close-stock-btn"
                    onClick={() => {
                        setSelectedProduct(null);
                        setNewStock("");
                    }}
                >
                    ×
                </button>

            </div>


            <div className="stock-modal-content">

                <div className="current-stock">

                    <span>Current Stock</span>

                    <strong>
                        {selectedProduct.stock}
                    </strong>

                </div>


                <label>
                    New Stock
                </label>

                <input
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={(event) =>
                        setNewStock(event.target.value)
                    }
                    placeholder="Enter stock quantity"
                />

            </div>


            <div className="stock-modal-actions">

                <button
                    className="cancel-stock-btn"
                    onClick={() => {
                        setSelectedProduct(null);
                        setNewStock("");
                    }}
                    disabled={updatingStock}
                >
                    Cancel
                </button>

                <button
                    className="save-stock-btn"
                    onClick={updateStock}
                    disabled={updatingStock}
                >
                    {updatingStock
                        ? "Updating..."
                        : "Update Stock"}
                </button>

            </div>

        </div>

    </div>

)}

            </div>

        </div>
    );
}

export default AdminInventory;