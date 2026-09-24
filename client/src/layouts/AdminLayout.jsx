import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import AdminSidebar from
  "../components/admin/AdminSidebar";

import {
  LoaderCircle,
} from "lucide-react";


function AdminLayout() {
  const {
    loading,
    isAuthenticated,
    isAdmin,
  } = useAuth();


  /*
  |--------------------------------------------------------------------------
  | Wait while restoring session
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b]">

        <LoaderCircle
          size={35}
          className="animate-spin text-[#D92323]"
        />

      </main>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Not logged in
  |--------------------------------------------------------------------------
  */

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Logged in but not admin
  |--------------------------------------------------------------------------
  */

  if (!isAdmin) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Admin Layout
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#0b0b0b]">

      <AdminSidebar />

      {/*
        Sidebar width = 270px

        On large screens, push the page
        content to the right.
      */}

      <main className="min-h-screen lg:ml-[270px]">

        <Outlet />

      </main>

    </div>
  );
}


export default AdminLayout;