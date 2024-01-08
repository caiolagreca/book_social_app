import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function PrivateProtectedRoute({ component: Component, ...rest }) {
  //check if user is login
  const user = useSelector((state) => state?.users);
  const { userAuth } = user;

  if (!userAuth) {
    return <Navigate to="/login" />;
  }

  return <Component {...rest} />;
}

export default PrivateProtectedRoute;
