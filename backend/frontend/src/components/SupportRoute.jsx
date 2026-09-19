import { Navigate } from "react-router-dom";

function SupportRoute({ children }) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "support") {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default SupportRoute;