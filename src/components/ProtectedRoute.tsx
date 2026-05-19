import { Navigate } from "react-router-dom";
import { clearAuthSession, isTokenExpired } from "../utils/authToken";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isTokenExpired(token)) {
    clearAuthSession();
    return <Navigate to="/login" replace />;
  }

  return children;
}