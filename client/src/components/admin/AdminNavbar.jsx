import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  useState,
} from "react";

import {
  useAuth,
} from "../../context/AuthContext";

function AdminNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const adminLinks = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
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
      name: "Orders",
      path: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      name: "Customers",
      path: "/admin/customers",
      icon: Users,
    },
  ];

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();

    closeMobileMenu();

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0b0b]/95 backdrop-blur-xl">

      <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* Admin Logo */}

        <NavLink
          to="/admin"
          className="flex items-center gap-3"
        >
          <div className="flex flex-col leading-none">

            <span className="heading-font text-3xl font-extrabold tracking-wide text-white">
              ZOOP
            </span>

            <span className="mt-1 text-[8px] tracking-[0.45em] text-[#D92323]">
              ADMIN PANEL
            </span>

          </div>
        </NavLink>


        {/* Desktop Navigation */}

        <nav className="hidden items-center gap-2 lg:flex">

          {adminLinks.map(
            (link) => {
              const Icon =
                link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={
                    link.path === "/admin"
                  }
                  className={({
                    isActive,
                  }) =>
                    `
                    flex items-center gap-2
                    rounded-lg
                    px-4 py-2.5
                    text-sm
                    font-medium
                    transition
                    ${
                      isActive
                        ? "bg-[#D92323]/15 text-[#ff4a4a]"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }
                    `
                  }
                >

                  <Icon size={18} />

                  {link.name}

                </NavLink>
              );
            }
          )}

        </nav>


        {/* Desktop Admin Profile */}

        <div className="hidden items-center gap-4 lg:flex">

          <div className="text-right">

            <p className="text-sm font-medium text-white">
              {user?.name}
            </p>

            <p className="text-xs uppercase tracking-wider text-[#D92323]">
              {user?.role}
            </p>

          </div>


          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D92323]/15 text-sm font-bold text-[#ff4a4a]">

            {user?.name
              ?.charAt(0)
              ?.toUpperCase()}

          </div>


          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/70 transition hover:border-[#D92323]/50 hover:text-[#ff4a4a]"
          >

            <LogOut size={17} />

            Logout

          </button>

        </div>


        {/* Mobile Controls */}

        <div className="flex items-center gap-3 lg:hidden">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D92323]/15 text-sm font-bold text-[#ff4a4a]">

            {user?.name
              ?.charAt(0)
              ?.toUpperCase()}

          </div>


          <button
            onClick={() =>
              setMobileMenuOpen(
                (prev) => !prev
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white"
            aria-label="Toggle admin menu"
          >

            {mobileMenuOpen
              ? <X size={22} />
              : <Menu size={22} />
            }

          </button>

        </div>

      </div>


      {/* Mobile Navigation */}

      <AnimatePresence>

        {mobileMenuOpen && (

          <motion.nav
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="overflow-hidden border-t border-white/10 bg-[#0b0b0b]"
          >

            <div className="space-y-1 px-5 py-5">

              {adminLinks.map(
                (link) => {
                  const Icon =
                    link.icon;

                  return (

                    <NavLink
                      key={link.path}
                      to={link.path}
                      end={
                        link.path === "/admin"
                      }
                      onClick={
                        closeMobileMenu
                      }
                      className={({
                        isActive,
                      }) =>
                        `
                        flex items-center gap-3
                        rounded-lg
                        px-4 py-3.5
                        transition
                        ${
                          isActive
                            ? "bg-[#D92323]/15 text-[#ff4a4a]"
                            : "text-white/70 hover:bg-white/5"
                        }
                        `
                      }
                    >

                      <Icon size={19} />

                      <span>
                        {link.name}
                      </span>

                    </NavLink>

                  );
                }
              )}


              {/* Admin Info */}

              <div className="mt-4 border-t border-white/10 pt-4">

                <div className="mb-4 px-4">

                  <p className="text-sm text-white">
                    {user?.name}
                  </p>

                  <p className="mt-1 text-xs uppercase tracking-wider text-[#D92323]">
                    {user?.role}
                  </p>

                </div>


                <button
                  onClick={
                    handleLogout
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left text-[#ff4a4a] hover:bg-[#D92323]/10"
                >

                  <LogOut size={19} />

                  Logout

                </button>

              </div>

            </div>

          </motion.nav>

        )}

      </AnimatePresence>

    </header>
  );
}

export default AdminNavbar;