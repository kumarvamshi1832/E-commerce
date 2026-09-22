import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminReferrals.css";

function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalReferrals, setTotalReferrals] = useState(0);
  const [successfulReferrals, setSuccessfulReferrals] = useState(0);
  const [pendingReferrals, setPendingReferrals] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState("0.00");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchReferrals = async () => {
    try {
      const response = await api.get("admin/referrals/");

      setReferrals(response.data.referrals || []);
      setTotalReferrals(response.data.total_referrals || 0);
      setSuccessfulReferrals(response.data.successful_referrals || 0);
      setPendingReferrals(response.data.pending_referrals || 0);
      setTotalEarnings(response.data.total_earnings || "0.00");
    } catch (error) {
      console.log("Unable to load referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const filteredReferrals = referrals.filter((referral) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      referral.referrer_username?.toLowerCase().includes(search) ||
      referral.referred_username?.toLowerCase().includes(search) ||
      referral.referred_email?.toLowerCase().includes(search) ||
      referral.referral_code?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      referral.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-referrals-page">

      <div className="admin-referrals-header">
        <div>
          <p className="admin-referrals-label">
            REFERRAL MANAGEMENT
          </p>

          <h1>Referrals</h1>

          <p>
            Track customer referrals, bonuses and commissions.
          </p>
        </div>
      </div>

      <div className="admin-referral-stats">

        <div className="admin-referral-stat-card">
          <span>Total Referrals</span>
          <strong>{totalReferrals}</strong>
        </div>

        <div className="admin-referral-stat-card">
          <span>Successful</span>
          <strong>{successfulReferrals}</strong>
        </div>

        <div className="admin-referral-stat-card">
          <span>Pending</span>
          <strong>{pendingReferrals}</strong>
        </div>

        <div className="admin-referral-stat-card">
          <span>Total Earnings</span>
          <strong>₹{totalEarnings}</strong>
        </div>

      </div>

      <div className="admin-referral-toolbar">

        <input
          type="text"
          placeholder="Search referrer, customer, email or code..."
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Successful">Successful</option>
        </select>

      </div>

      <div className="admin-referrals-table-card">

        {loading ? (
          <div className="admin-referrals-loading">
            Loading referrals...
          </div>
        ) : filteredReferrals.length === 0 ? (
          <div className="admin-referrals-empty">
            No referrals found.
          </div>
        ) : (
          <div className="admin-referrals-table-wrapper">

            <table className="admin-referrals-table">

              <thead>
                <tr>
                  <th>Referrer</th>
                  <th>Referred Customer</th>
                  <th>Referral Code</th>
                  <th>Status</th>
                  <th>First Order</th>
                  <th>First Bonus</th>
                  <th>Total Earned</th>
                  <th>Joined</th>
                </tr>
              </thead>

              <tbody>

                {filteredReferrals.map((referral) => (

                  <tr key={referral.id}>

                    <td>
                      <strong>
                        {referral.referrer_username}
                      </strong>
                    </td>

                    <td>
                      <div className="referral-customer-name">
                        {referral.referred_username}
                      </div>

                      <div className="referral-customer-email">
                        {referral.referred_email}
                      </div>
                    </td>

                    <td>
                      <span className="referral-code">
                        {referral.referral_code}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`referral-status ${
                          referral.status === "Successful"
                            ? "successful"
                            : "pending"
                        }`}
                      >
                        {referral.status}
                      </span>
                    </td>

                    <td>
                      {referral.first_order_id ? (
                        <div>
                          <strong>
                            #{referral.first_order_id}
                          </strong>

                          <div className="referral-order-amount">
                            ₹{referral.first_order_amount}
                          </div>
                        </div>
                      ) : (
                        <span className="not-available">
                          —
                        </span>
                      )}
                    </td>

                    <td>
                      {referral.first_bonus_credited ? (
                        <span className="bonus-credited">
                          ₹100
                        </span>
                      ) : (
                        <span className="not-available">
                          —
                        </span>
                      )}
                    </td>

                    <td>
                      <strong className="referral-earnings">
                        ₹{referral.referral_earnings}
                      </strong>
                    </td>

                    <td>
                      {new Date(
                        referral.created_at
                      ).toLocaleDateString("en-IN")}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default AdminReferrals;