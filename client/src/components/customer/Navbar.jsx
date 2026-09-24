import { useState } from "react";

import {
  Menu,
  ShoppingCart,
  X,
  LogIn,
  User,
  LogOut,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";


function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const navigate = useNavigate();

  const { itemCount } = useCart();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();


  const navLinks = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Menu",
      path: "/menu",
    },
    {
      name: "My Orders",
      path: "/orders",
    },
  ];


  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };


  const handleLogout = () => {
    logout();

    closeMobileMenu();

    navigate("/");
  };


  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0b0b]/90 backdrop-blur-xl">

      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* Logo */}

        <Link
          to="/"
          onClick={closeMobileMenu}
          className="group flex flex-col leading-none"
        >

          <span className="heading-font text-4xl font-extrabold tracking-wide text-white transition group-hover:text-[#D92323]">
            ZOOP
          </span>

          <span className="mt-0.5 text-center text-[9px] font-medium tracking-[0.4em] text-[#D92323]">
            CAFE
          </span>

        </Link>


        {/* Desktop Navigation */}

        <nav className="hidden items-center gap-8 md:flex lg:gap-11">

          {navLinks.map((link) => (

            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `heading-font relative px-1 text-lg uppercase tracking-wide transition ${
                  isActive
                    ? "text-[#D92323]"
                    : "text-white hover:text-[#D92323]"
                }`
              }
            >
              {link.name}
            </NavLink>

          ))}

        </nav>


        {/* Desktop Controls */}

        <div className="hidden items-center gap-3 md:flex">

          {/* Cart */}

          <Link
            to="/cart"
            className="flex items-center gap-2 rounded-md border border-[#D92323] px-4 py-2 text-white transition hover:bg-[#D92323]"
          >

            <ShoppingCart size={19} />

            <span className="heading-font text-lg uppercase">
              Cart
            </span>

            {itemCount > 0 && (

              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D92323] px-1 text-xs font-bold text-white">
                {itemCount > 99
                  ? "99+"
                  : itemCount}
              </span>

            )}

          </Link>


          {/* Authentication */}

          {isAuthenticated ? (

            <>

              {/* User */}

              <div className="flex items-center gap-2 px-2 text-white">

                <User
                  size={18}
                  className="text-[#D92323]"
                />

                <span className="max-w-[120px] truncate text-sm">
                  Hi,{" "}
                  {user?.name?.split(" ")[0]}
                </span>

              </div>


              {/* Logout */}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm text-white transition hover:border-[#D92323] hover:text-[#D92323]"
              >

                <LogOut size={17} />

                Logout

              </button>

            </>

          ) : (

            <>

              {/* Login */}

              <Link
                to="/login"
                className="flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-white transition hover:border-[#D92323] hover:text-[#D92323]"
              >

                <LogIn size={18} />

                <span className="heading-font text-lg uppercase">
                  Login
                </span>

              </Link>


              {/* Register */}

              <Link
                to="/register"
                className="rounded-md bg-[#D92323] px-4 py-2 text-white transition hover:scale-[1.03] hover:bg-[#ef3030]"
              >

                <span className="heading-font text-lg uppercase">
                  Register
                </span>

              </Link>

            </>

          )}

        </div>


        {/* Mobile Controls */}

        <div className="flex items-center gap-2 md:hidden">

          {/* Mobile Cart */}

          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white"
            aria-label="Cart"
          >

            <ShoppingCart size={20} />

            {itemCount > 0 && (

              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D92323] px-1 text-xs font-bold text-white">
                {itemCount > 99
                  ? "99+"
                  : itemCount}
              </span>

            )}

          </Link>


          {/* Mobile Menu Button */}

          <button
            onClick={() =>
              setMobileMenuOpen(
                (prev) => !prev
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white transition hover:border-[#D92323] hover:text-[#D92323]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >

            {mobileMenuOpen ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}

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

            <div className="flex flex-col px-5 py-4">

              {/* Navigation Links */}

              {navLinks.map((link) => (

                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `border-b border-white/5 py-4 heading-font text-xl uppercase tracking-wide ${
                      isActive
                        ? "text-[#D92323]"
                        : "text-white"
                    }`
                  }
                >
                  {link.name}
                </NavLink>

              ))}


              {/* Authentication */}

              {isAuthenticated ? (

                <>

                  {/* User */}

                  <div className="flex items-center gap-3 border-b border-white/5 py-4 text-white">

                    <User
                      size={19}
                      className="text-[#D92323]"
                    />

                    <span>
                      Hi, {user?.name}
                    </span>

                  </div>


                  {/* Logout */}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 py-4 text-left heading-font text-xl uppercase tracking-wide text-[#D92323]"
                  >

                    <LogOut size={20} />

                    Logout

                  </button>

                </>

              ) : (

                <>

                  {/* Login */}

                  <NavLink
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 border-b border-white/5 py-4 heading-font text-xl uppercase tracking-wide text-white"
                  >

                    <LogIn size={20} />

                    Login

                  </NavLink>


                  {/* Register */}

                  <NavLink
                    to="/register"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 py-4 heading-font text-xl uppercase tracking-wide text-[#D92323]"
                  >

                    <User
                      size={20}
                    />

                    Create Account

                  </NavLink>

                </>

              )}

            </div>

          </motion.nav>

        )}

      </AnimatePresence>

    </header>
  );
}

export default Navbar;