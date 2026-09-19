import { useEffect, useState } from "react";
import api from "../services/api";
import AdminExportActions from "../components/AdminExportActions";
import "./AdminProducts.css";

function AdminProducts() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingProduct, setEditingProduct] = useState(null);

    const [editForm, setEditForm] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
        stock: ""
    });

    const [showAddProduct, setShowAddProduct] = useState(false);

    const [addForm, setAddForm] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
        stock: "",
        image: null
    });

    const fetchProducts = async () => {

        const token = localStorage.getItem("token");

        try {
            const response = await api.get("admin/products/", {
                headers: {
                    Authorization: `Token ${token}`
                }
            });

            setProducts(response.data);

        } catch (error) {
            console.log(error);
        }

        setLoading(false);
    };

    const toggleProductStatus = async (productId) => {

        const token = localStorage.getItem("token");

        try {
            const response = await api.patch(
                `admin/products/${productId}/status/`,
                {},
                {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                }
            );

            alert(response.data.message);

            fetchProducts();

        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.error ||
                "Unable to update product status."
            );
        }
    };

    const startEditing = (product) => {
        setEditingProduct(product);

        setEditForm({
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category,
            stock: product.stock
        });
    };

    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const handleAddChange = (e) => {

        const { name, value, files } = e.target;

        setAddForm({
            ...addForm,
            [name]: files ? files[0] : value
        });
    };

    const updateProduct = async () => {

        const token = localStorage.getItem("token");

        try {
            const response = await api.put(
                `admin/products/${editingProduct.id}/update/`,
                {
                    name: editForm.name,
                    price: editForm.price,
                    description: editForm.description,
                    category: editForm.category,
                    stock: editForm.stock
                },
                {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                }
            );

            alert(response.data.message);

            setEditingProduct(null);

            fetchProducts();

        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.error ||
                "Unable to update product."
            );
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="admin-products-page">
                <h2>Loading products...</h2>
            </div>
        );
    }

    const createProduct = async () => {

        if (!addForm.name.trim()) {
            alert("Product name is required.");
            return;
        }

        if (addForm.price === "" || Number(addForm.price) <= 0) {
            alert("Price must be greater than 0.");
            return;
        }

        if (!addForm.category.trim()) {
            alert("Category is required.");
            return;
        }

        if (addForm.stock === "" || Number(addForm.stock) < 0) {
            alert("Stock cannot be negative.");
            return;
        }

        if (!addForm.image) {
            alert("Product image is required.");
            return;
        }

        const token = localStorage.getItem("token");

        const formData = new FormData();

        formData.append("name", addForm.name.trim());
        formData.append("price", addForm.price);
        formData.append("description", addForm.description.trim());
        formData.append("category", addForm.category.trim());
        formData.append("stock", addForm.stock);
        formData.append("image", addForm.image);

        try {

            const response = await api.post(
                "admin/products/create/",
                formData,
                {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                }
            );

            alert(response.data.message);

            setShowAddProduct(false);

            setAddForm({
                name: "",
                price: "",
                description: "",
                category: "",
                stock: "",
                image: null
            });

            fetchProducts();

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.error ||
                "Unable to create product."
            );
        }
    };

    const exportColumns = [
        {
            label: "Product",
            key: "name"
        },
        {
            label: "ID",
            key: "id"
        },
        {
            label: "Category",
            key: "category"
        },
        {
            label: "Price",
            key: "price"
        },
        {
            label: "Stock",
            key: "stock"
        },
        {
            label: "Status",
            key: "status"
        }
    ];

    const exportData = products.map((product) => ({
        ...product,
        id: `#${product.id}`,
        price: `₹${Number(product.price).toLocaleString("en-IN")}`,
        status: product.is_active ? "Active" : "Inactive"
    }));

    return (
        <div className="admin-products-page">

            <div className="admin-products-header">

                <div>
                    <h1>Products</h1>
                    <p>Manage your store products and inventory</p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                    <AdminExportActions
                        title="Products"
                        columns={exportColumns}
                        data={exportData}
                        filename="mystore-products"
                    />

                    <button
                        className="add-product-btn"
                        onClick={() => setShowAddProduct(true)}
                    >
                        + Add Product
                    </button>

                </div>

            </div>

            <div className="products-table-container">

                <table className="products-table">

                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {products.map((product) => (

                            <tr key={product.id}>

                                <td>

                                    <div className="product-info">

                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                            />
                                        ) : (
                                            <div className="no-image">
                                                No Image
                                            </div>
                                        )}

                                        <div>
                                            <strong>{product.name}</strong>
                                            <span>ID: #{product.id}</span>
                                        </div>

                                    </div>

                                </td>

                                <td>
                                    {product.category}
                                </td>

                                <td className="product-price">
                                    ₹{Number(product.price).toLocaleString("en-IN")}
                                </td>

                                <td>

                                    <span
                                        className={
                                            product.stock === 0
                                                ? "stock-out"
                                                : product.stock <= 5
                                                ? "stock-low"
                                                : "stock-good"
                                        }
                                    >
                                        {product.stock}
                                    </span>

                                </td>

                                <td>

                                    <span
                                        className={
                                            product.is_active
                                                ? "status-active"
                                                : "status-inactive"
                                        }
                                    >
                                        {product.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>

                                </td>

                                <td>

                                    <div className="product-actions">

                                        <button
                                            className="edit-btn"
                                            onClick={() => startEditing(product)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className={
                                                product.is_active
                                                    ? "deactivate-btn"
                                                    : "activate-btn"
                                            }
                                            onClick={() =>
                                                toggleProductStatus(product.id)
                                            }
                                        >
                                            {product.is_active
                                                ? "Deactivate"
                                                : "Activate"}
                                        </button>

                                    </div>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

                {editingProduct && (
                    <div className="edit-product-overlay">

                        <div className="edit-product-modal">

                            <h2>Edit Product</h2>

                            <input
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleEditChange}
                                placeholder="Product name"
                            />

                            <input
                                type="number"
                                name="price"
                                value={editForm.price}
                                onChange={handleEditChange}
                                placeholder="Price"
                            />

                            <textarea
                                name="description"
                                value={editForm.description}
                                onChange={handleEditChange}
                                placeholder="Description"
                            />

                            <input
                                type="text"
                                name="category"
                                value={editForm.category}
                                onChange={handleEditChange}
                                placeholder="Category"
                            />

                            <input
                                type="number"
                                name="stock"
                                value={editForm.stock}
                                onChange={handleEditChange}
                                placeholder="Stock"
                            />

                            <div className="edit-modal-actions">

                                <button
                                    className="cancel-edit-btn"
                                    onClick={() => setEditingProduct(null)}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="save-edit-btn"
                                    onClick={updateProduct}
                                >
                                    Save Changes
                                </button>

                            </div>

                        </div>

                    </div>
                )}

                {showAddProduct && (
                    <div className="edit-product-overlay">

                        <div className="edit-product-modal">

                            <h2>Add Product</h2>

                            <input
                                type="text"
                                name="name"
                                value={addForm.name}
                                onChange={handleAddChange}
                                placeholder="Product name"
                            />

                            <input
                                type="number"
                                name="price"
                                min="0"
                                step="0.01"
                                value={addForm.price}
                                onChange={handleAddChange}
                                placeholder="Price"
                            />

                            <textarea
                                name="description"
                                value={addForm.description}
                                onChange={handleAddChange}
                                placeholder="Description"
                            />

                            <input
                                type="text"
                                name="category"
                                value={addForm.category}
                                onChange={handleAddChange}
                                placeholder="Category"
                            />

                            <input
                                type="number"
                                name="stock"
                                min="0"
                                value={addForm.stock}
                                onChange={handleAddChange}
                                placeholder="Stock"
                            />

                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleAddChange}
                            />

                            <div className="edit-modal-actions">

                                <button
                                    className="cancel-edit-btn"
                                    onClick={() => setShowAddProduct(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="save-edit-btn"
                                    onClick={createProduct}
                                >
                                    Add Product
                                </button>

                            </div>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}

export default AdminProducts;
