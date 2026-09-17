import { useEffect, useState } from "react";
import api from "../services/api";
import AdminExportActions from "../components/AdminExportActions";
import "./AdminCoupons.css";

function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    const [code, setCode] = useState("");
    const [discountPercent, setDiscountPercent] = useState("");

    useEffect(() => {
        fetchCoupons();
    }, []);

    const getHeaders = () => {
        const token = localStorage.getItem("token");

        return {
            headers: {
                Authorization: `Token ${token}`,
            },
        };
    };

    const fetchCoupons = async () => {
        try {
            const response = await api.get(
                "admin/coupons/",
                getHeaders()
            );

            setCoupons(response.data);
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.error ||
                "Unable to load coupons."
            );
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingCoupon(null);
        setCode("");
        setDiscountPercent("");
        setShowModal(true);
    };

    const openEditModal = (coupon) => {
        setEditingCoupon(coupon);
        setCode(coupon.code);
        setDiscountPercent(coupon.discount_percent);
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingCoupon(null);
        setCode("");
        setDiscountPercent("");
    };

    const saveCoupon = async () => {
        if (!code.trim()) {
            alert("Coupon code is required.");
            return;
        }

        if (!discountPercent) {
            alert("Discount percentage is required.");
            return;
        }

        const discount = Number(discountPercent);

        if (discount <= 0 || discount > 100) {
            alert("Discount must be between 1 and 100.");
            return;
        }

        setSaving(true);

        try {
            if (editingCoupon) {
                const response = await api.put(
                    `admin/coupons/${editingCoupon.id}/update/`,
                    {
                        code: code.trim().toUpperCase(),
                        discount_percent: discount,
                    },
                    getHeaders()
                );

                setCoupons((previous) =>
                    previous.map((coupon) =>
                        coupon.id === editingCoupon.id
                            ? {
                                ...coupon,
                                code: response.data.code,
                                discount_percent:
                                    response.data.discount_percent,
                            }
                            : coupon
                    )
                );

                alert("Coupon updated successfully.");
            } else {
                const response = await api.post(
                    "admin/coupons/create/",
                    {
                        code: code.trim().toUpperCase(),
                        discount_percent: discount,
                    },
                    getHeaders()
                );

                const newCoupon = response.data.coupon;

                setCoupons((previous) => [
                    newCoupon,
                    ...previous,
                ]);

                alert("Coupon created successfully.");
            }

            closeModal();
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.error ||
                "Unable to save coupon."
            );
        } finally {
            setSaving(false);
        }
    };

    const toggleCouponStatus = async (coupon) => {
        try {
            const response = await api.patch(
                `admin/coupons/${coupon.id}/status/`,
                {},
                getHeaders()
            );

            setCoupons((previous) =>
                previous.map((item) =>
                    item.id === coupon.id
                        ? {
                            ...item,
                            active: response.data.active,
                        }
                        : item
                )
            );

            alert(
                response.data.active
                    ? "Coupon activated successfully."
                    : "Coupon deactivated successfully."
            );
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.error ||
                "Unable to update coupon status."
            );
        }
    };

    const exportColumns = [
    {
        label: "Coupon Code",
        key: "code"
    },
    {
        label: "Discount",
        key: "discount"
    },
    {
        label: "Status",
        key: "status"
    },
    {
        label: "Created",
        key: "created"
    }
];

const exportData = coupons.map((coupon) => ({
    code: coupon.code,
    discount: `${coupon.discount_percent}%`,
    status: coupon.active
        ? "Active"
        : "Inactive",
    created: new Date(
        coupon.created_at
    ).toLocaleDateString("en-IN")
}));

    if (loading) {
        return (
            <div className="admin-coupons-page">
                <div className="coupons-loading">
                    Loading coupons...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-coupons-page">

           <div className="coupons-header">

    <div>
        <h1>Coupons</h1>

        <p>
            Create and manage discount coupons.
        </p>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        <AdminExportActions
            title="Coupons"
            columns={exportColumns}
            data={exportData}
            filename="mystore-coupons"
        />

        <button
            className="add-coupon-btn"
            onClick={openAddModal}
        >
            + Add Coupon
        </button>

    </div>

</div>
            <div className="coupon-summary">

                <div className="coupon-summary-card">
                    <span>Total Coupons</span>
                    <strong>{coupons.length}</strong>
                </div>

                <div className="coupon-summary-card">
                    <span>Active Coupons</span>
                    <strong>
                        {
                            coupons.filter(
                                (coupon) => coupon.active
                            ).length
                        }
                    </strong>
                </div>

                <div className="coupon-summary-card">
                    <span>Inactive Coupons</span>
                    <strong>
                        {
                            coupons.filter(
                                (coupon) => !coupon.active
                            ).length
                        }
                    </strong>
                </div>

            </div>

            <div className="coupons-table-card">

                {coupons.length === 0 ? (
                    <div className="no-coupons">
                        <h3>No Coupons</h3>

                        <p>
                            Create your first coupon to get started.
                        </p>
                    </div>
                ) : (
                    <div className="coupons-table-wrapper">

                        <table className="coupons-table">

                            <thead>
                                <tr>
                                    <th>Coupon Code</th>
                                    <th>Discount</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {coupons.map((coupon) => (
                                    <tr key={coupon.id}>

                                        <td>
                                            <span className="coupon-code">
                                                {coupon.code}
                                            </span>
                                        </td>

                                        <td>
                                            <strong>
                                                {coupon.discount_percent}%
                                            </strong>
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    coupon.active
                                                        ? "coupon-status active"
                                                        : "coupon-status inactive"
                                                }
                                            >
                                                {coupon.active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td>
                                            {new Date(
                                                coupon.created_at
                                            ).toLocaleDateString(
                                                "en-IN"
                                            )}
                                        </td>

                                        <td>
                                            <div className="coupon-actions">

                                                <button
                                                    className="edit-coupon-btn"
                                                    onClick={() =>
                                                        openEditModal(
                                                            coupon
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className={
                                                        coupon.active
                                                            ? "deactivate-coupon-btn"
                                                            : "activate-coupon-btn"
                                                    }
                                                    onClick={() =>
                                                        toggleCouponStatus(
                                                            coupon
                                                        )
                                                    }
                                                >
                                                    {coupon.active
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {showModal && (
                <div className="coupon-modal-overlay">

                    <div className="coupon-modal">

                        <div className="coupon-modal-header">

                            <div>
                                <h2>
                                    {editingCoupon
                                        ? "Edit Coupon"
                                        : "Add Coupon"}
                                </h2>

                                <p>
                                    {editingCoupon
                                        ? "Update coupon details."
                                        : "Create a new discount coupon."}
                                </p>
                            </div>

                            <button
                                className="close-coupon-modal"
                                onClick={closeModal}
                            >
                                ×
                            </button>

                        </div>

                        <div className="coupon-form">

                            <div className="coupon-form-group">

                                <label>
                                    Coupon Code
                                </label>

                                <input
                                    type="text"
                                    value={code}
                                    onChange={(event) =>
                                        setCode(event.target.value)
                                    }
                                    placeholder="Example: SAVE10"
                                />

                            </div>

                            <div className="coupon-form-group">

                                <label>
                                    Discount Percentage
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={discountPercent}
                                    onChange={(event) =>
                                        setDiscountPercent(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Example: 10"
                                />

                            </div>

                            <div className="coupon-modal-actions">

                                <button
                                    className="cancel-coupon-btn"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="save-coupon-btn"
                                    onClick={saveCoupon}
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingCoupon
                                            ? "Update Coupon"
                                            : "Create Coupon"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default AdminCoupons;