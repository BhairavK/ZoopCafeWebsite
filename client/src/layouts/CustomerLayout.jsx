import { Outlet } from "react-router-dom";
import Navbar from "../components/customer/Navbar";
import Footer from "../components/customer/Footer";

function CustomerLayout() {
  return (
    <div className="min-h-screen bg-[#111111] text-white">

      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />

    </div>
  );
}

export default CustomerLayout;