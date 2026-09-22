import { useEffect, useState } from "react";
import { getWallet, getWalletTransactions } from "../services/api";
import "./Wallet.css";

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

function FloatingGroceries() {
  return (
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
  );
}

function Wallet() {
  const [wallet, setWallet] = useState({
    balance: "0.00",
    total_credits: "0.00",
    total_debits: "0.00",
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWallet = async () => {
    try {
      const walletResponse = await getWallet();
      const transactionsResponse = await getWalletTransactions();

      setWallet(walletResponse.data);
      setTransactions(
        transactionsResponse.data.transactions || []
      );
    } catch (error) {
      console.log("Wallet loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  if (loading) {
    return (
      <div className="wallet-page">

        <FloatingGroceries />

        <div className="wallet-loading">
          Loading wallet...
        </div>

      </div>
    );
  }

  return (
    <div className="wallet-page">

      <FloatingGroceries />

      <div className="wallet-container">

        <div className="wallet-header">
          <div>
            <p className="wallet-label">
              MY ACCOUNT
            </p>

            <h1>
              My Wallet
            </h1>

            <p>
              Manage your wallet balance and view your transaction history.
            </p>
          </div>
        </div>

        <div className="wallet-summary">

          <div className="wallet-card wallet-balance-card">

            <div className="wallet-card-icon">
              ₹
            </div>

            <div>
              <span>
                Available Balance
              </span>

              <strong>
                ₹{wallet.balance}
              </strong>
            </div>

          </div>

          <div className="wallet-card">

            <div className="wallet-card-icon credit-icon">
              +
            </div>

            <div>
              <span>
                Total Earned
              </span>

              <strong>
                ₹{wallet.total_credits}
              </strong>
            </div>

          </div>

          <div className="wallet-card">

            <div className="wallet-card-icon debit-icon">
              −
            </div>

            <div>
              <span>
                Total Used
              </span>

              <strong>
                ₹{wallet.total_debits}
              </strong>
            </div>

          </div>

        </div>

        <div className="wallet-transactions-section">

          <div className="wallet-section-header">

            <div>
              <h2>
                Wallet Transactions
              </h2>

              <p>
                Your wallet credit and debit history
              </p>
            </div>

            <span className="transaction-count">
              {transactions.length} transactions
            </span>

          </div>

          {transactions.length === 0 ? (

            <div className="empty-wallet">

              <div className="empty-wallet-icon">
                ₹
              </div>

              <h3>
                No transactions yet
              </h3>

              <p>
                Your referral earnings and wallet usage will appear here.
              </p>

            </div>

          ) : (

            <div className="transactions-list">

              {transactions.map((transaction) => {

                const isCredit =
                  transaction.transaction_type === "Credit";

                return (
                  <div
                    className="transaction-row"
                    key={transaction.id}
                  >

                    <div className="transaction-left">

                      <div
                        className={`transaction-icon ${
                          isCredit ? "credit" : "debit"
                        }`}
                      >
                        {isCredit ? "+" : "−"}
                      </div>

                      <div className="transaction-info">

                        <h3>
                          {transaction.description}
                        </h3>

                        <p>
                          {new Date(
                            transaction.created_at
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>

                        {transaction.order_id && (
                          <span>
                            Order #{transaction.order_id}
                          </span>
                        )}

                      </div>

                    </div>

                    <div
                      className={`transaction-amount ${
                        isCredit ? "credit" : "debit"
                      }`}
                    >
                      {isCredit ? "+" : "−"}₹
                      {transaction.amount}
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Wallet;