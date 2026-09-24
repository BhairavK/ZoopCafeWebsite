import { useState } from "react";

import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Package,
  Tags,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function AdminSidebar() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [collapsed, setCollapsed] =
    useState(false);

  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: ClipboardList,
    },
    {
      name: "Menu",
      path: "/admin/menu",
      icon: UtensilsCrossed,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: Tags,
    },
    {
      name: "Combos",
      path: "/admin/combos",
      icon: Package,
    },
    {
      name: "Reviews",
      path: "/admin/reviews",
      icon: Star,
    },
  ];

  const handleLogout = () => {
    logout();

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* ========================================================= */}
      {/* MOBILE HEADER */}
      {/* ========================================================= */}

      <header className="sticky top-0 z-50 flex h-[72px] items-center justify-between border-b border-white/10 bg-[#0b0b0b]/95 px-5 backdrop-blur-xl lg:hidden">

        {/* Logo */}
        <NavLink
          to="/admin"
          className="flex flex-col leading-none"
        >
          <span className="heading-font text-3xl font-extrabold tracking-wide text-white">
            ZOOP
          </span>

          <span className="mt-0.5 text-[8px] tracking-[0.4em] text-[#D92323]">
            ADMIN
          </span>
        </NavLink>

        {/* Mobile Menu Button */}
        <button
          onClick={() =>
            setMobileOpen(true)
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white transition hover:border-[#D92323]"
          aria-label="Open admin menu"
        >
          <Menu size={22} />
        </button>

      </header>


      {/* ========================================================= */}
      {/* MOBILE OVERLAY */}
      {/* ========================================================= */}

      {mobileOpen && (
        <button
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-50 bg-black/70 lg:hidden"
          aria-label="Close menu overlay"
        />
      )}


      {/* ========================================================= */}
      {/* SIDEBAR */}
      {/* ========================================================= */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-[60]
          flex
          h-screen
          flex-col
          border-r
          border-white/10
          bg-[#101010]
          transition-all
          duration-300
          ease-in-out

          ${
            collapsed
              ? "lg:w-[88px]"
              : "lg:w-[270px]"
          }

          ${
            mobileOpen
              ? "translate-x-0 w-[270px]"
              : "-translate-x-full w-[270px]"
          }

          lg:translate-x-0
        `}
      >


        {/* ========================================================= */}
        {/* SIDEBAR HEADER */}
        {/* ========================================================= */}

        <div
          className={`
            flex
            h-[92px]
            items-center
            border-b
            border-white/10
            transition-all
            duration-300

            ${
              collapsed
                ? "justify-center px-3"
                : "justify-between px-7"
            }
          `}
        >

          {/* Logo */}
          <NavLink
            to="/admin"
            onClick={closeMobileSidebar}
            className="flex flex-col leading-none"
          >

            <span
              className={`
                heading-font
                font-extrabold
                tracking-wide
                text-white
                transition-all
                duration-300

                ${
                  collapsed
                    ? "text-2xl"
                    : "text-4xl"
                }
              `}
            >
              ZOOP
            </span>


            {!collapsed && (
              <span className="mt-1 text-[9px] tracking-[0.45em] text-[#D92323]">
                ADMIN PANEL
              </span>
            )}

          </NavLink>


          {/* Mobile Close Button */}
          <button
            onClick={closeMobileSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white lg:hidden"
          >
            <X size={20} />
          </button>

        </div>


        {/* ========================================================= */}
        {/* COLLAPSE BUTTON - DESKTOP */}
        {/* ========================================================= */}

        <button
          onClick={() =>
            setCollapsed(!collapsed)
          }
          className="
            absolute
            -right-4
            top-[110px]
            hidden
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            border
            border-white/10
            bg-[#181818]
            text-white/70
            shadow-lg
            transition
            hover:border-[#D92323]
            hover:text-white
            lg:flex
          "
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>


        {/* ========================================================= */}
        {/* MANAGEMENT LABEL */}
        {/* ========================================================= */}

        {!collapsed && (
          <div className="px-6 pt-7">

            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/30">
              Management
            </p>

          </div>
        )}


        {/* ========================================================= */}
        {/* NAVIGATION */}
        {/* ========================================================= */}

        <nav
          className={`
            flex-1
            transition-all
            duration-300

            ${
              collapsed
                ? "px-3 py-7"
                : "px-4 py-5"
            }
          `}
        >

          <div className="space-y-2">

            {navItems.map(
              ({
                name,
                path,
                icon: Icon,
                end,
              }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={end}
                  onClick={closeMobileSidebar}
                  title={
                    collapsed
                      ? name
                      : undefined
                  }
                  className={({ isActive }) =>
                    `
                      group
                      flex
                      items-center
                      rounded-xl
                      transition

                      ${
                        collapsed
                          ? "justify-center px-3 py-3.5"
                          : "gap-4 px-4 py-3.5"
                      }

                      ${
                        isActive
                          ? "bg-[#D92323] text-white shadow-lg shadow-[#D92323]/20"
                          : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                      }
                    `
                  }
                >

                  <Icon
                    size={20}
                    className="shrink-0"
                  />


                  {!collapsed && (
                    <span className="font-medium">
                      {name}
                    </span>
                  )}

                </NavLink>
              )
            )}

          </div>

        </nav>


        {/* ========================================================= */}
        {/* USER SECTION */}
        {/* ========================================================= */}

        <div className="border-t border-white/10 p-4">


          {/* Expanded User Card */}
          {!collapsed && (
            <div className="mb-4 rounded-xl bg-white/[0.03] p-4">

              <p className="text-xs text-white/40">
                Logged in as
              </p>

              <p className="mt-1 truncate font-medium text-white">
                {user?.name || "Admin"}
              </p>

              <p className="mt-1 truncate text-xs text-[#D92323]">
                {user?.email}
              </p>

            </div>
          )}


          {/* Logout */}
          <button
            onClick={handleLogout}
            title={
              collapsed
                ? "Logout"
                : undefined
            }
            className={`
              flex
              items-center
              rounded-xl
              border
              border-white/10
              text-sm
              text-white/70
              transition
              hover:border-[#D92323]
              hover:bg-[#D92323]/10
              hover:text-[#D92323]

              ${
                collapsed
                  ? "h-12 w-full justify-center"
                  : "w-full justify-center gap-2 py-3"
              }
            `}
          >

            <LogOut size={18} />

            {!collapsed && (
              <span>
                Logout
              </span>
            )}

          </button>

        </div>

      </aside>
    </>
  );
}

export default AdminSidebar;