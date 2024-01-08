import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function AdminRoute({ component: Component, ...rest }) {
  //check if user is login
  const user = useSelector((state) => state?.users);
  const { userAuth } = user;

  if (!userAuth?.isAdmin) {
    return <Navigate to="/login" />;
  }

  return <Component {...rest} />;
}

export default AdminRoute;
