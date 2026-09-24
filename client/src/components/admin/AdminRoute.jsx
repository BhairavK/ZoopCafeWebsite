import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";


function AdminRoute() {
  const {
    user,
    isAuthenticated,
    loading,
  } = useAuth();


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b] text-white">

        Loading...

      </div>
    );
  }


  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  if (user?.role !== "ADMIN") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  return <Outlet />;
}


export default AdminRoute;