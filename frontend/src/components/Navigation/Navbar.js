import React from "react";
import PublicNavbar from "./Public/PublicNavbar";
import PrivateNavbar from "./Private/PrivateNavbar";
import AdminNavbar from "./Admin/AdminNavbar";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

function Navbar() {
  //get user from store
  const state = useSelector((state) => state.users);
  const { userAuth } = state;
  const isAdmin = userAuth?.isAdmin;

  //account verification
  const account = useSelector((state) => state?.accountVerification);
  const { loading, appErr, serverErr, token } = account;

  return (
    <>
      {isAdmin ? (
        <AdminNavbar isLogin={userAuth} />
      ) : userAuth ? (
        <PrivateNavbar isLogin={userAuth} />
      ) : (
        <PublicNavbar />
      )}
      {loading && <h2 className="text-center">Loading...</h2>}
      {appErr || serverErr ? (
        <h2 className="text-center text-red-500">
          {serverErr} {appErr}
        </h2>
      ) : null}
      <Outlet />
    </>
  );
}

export default Navbar;
