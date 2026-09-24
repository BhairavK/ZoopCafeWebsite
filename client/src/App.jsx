import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import CustomerLayout from
  "./layouts/CustomerLayout";

import AdminLayout from
  "./layouts/AdminLayout";

import AdminRoute from "./components/admin/AdminRoute";
/*
|--------------------------------------------------------------------------
| Customer Pages
|--------------------------------------------------------------------------
*/

import Home from
  "./pages/customer/Home";

import Menu from
  "./pages/customer/Menu";

import Cart from
  "./pages/customer/Cart";

import Checkout from
  "./pages/customer/Checkout";

import Orders from
  "./pages/customer/Orders";

import OrderDetails from
  "./pages/customer/OrderDetails";

  import MenuItemDetails from
  "./pages/customer/MenuItemDetails";


/*
|--------------------------------------------------------------------------
| Auth Pages
|--------------------------------------------------------------------------
*/

import Login from
  "./pages/auth/Login";

import Register from
  "./pages/auth/Register";


/*
|--------------------------------------------------------------------------
| Admin Pages
|--------------------------------------------------------------------------
*/

import AdminDashboard from
  "./pages/admin/AdminDashboard";

import MenuManagement from
  "./pages/admin/AdminMenuManagement";

import AdminCategories from
  "./pages/admin/AdminCategories";

import AdminOrders from
  "./pages/admin/AdminOrders";

import Combos from
  "./pages/admin/AdminCombos";

import AdminReviews from "./pages/admin/AdminReviews";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ============================================= */}
        {/* CUSTOMER ROUTES */}
        {/* ============================================= */}

        <Route element={<CustomerLayout />}>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/menu"
            element={<Menu />}
          />

          <Route
            path="/menu/item/:itemId"
            element={<MenuItemDetails />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/orders/:orderId"
            element={<OrderDetails />}
          />

        </Route>


        {/* ============================================= */}
        {/* AUTH ROUTES */}
        {/* ============================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ============================================= */}
{/* ADMIN ROUTES */}
{/* ============================================= */}

<Route element={<AdminRoute />}>

  <Route
    path="/admin"
    element={<AdminLayout />}
  >

    <Route
      index
      element={<AdminDashboard />}
    />

    <Route
      path="menu"
      element={<MenuManagement />}
    />

    <Route
      path="categories"
      element={<AdminCategories />}
    />

    <Route
      path="combos"
      element={<Combos />}
    />

    <Route
      path="orders"
      element={<AdminOrders />}
    />

    <Route path="reviews" element={<AdminReviews />} />

  </Route>

</Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;