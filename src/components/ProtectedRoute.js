// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuth, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null; // o un spinner
  }

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
}
