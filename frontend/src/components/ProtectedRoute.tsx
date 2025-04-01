import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  return isAuthenticated() ? (
    children
  ) : window.location.pathname === "/logout" ? (
    <Navigate to={"/login"} />
  ) : (
    <Navigate to={`/login?redirect=${window.location.pathname}`} />
  );
};

export default ProtectedRoute;
