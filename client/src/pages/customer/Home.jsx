import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../../components/ui/Button";
import SectionTitle from "../../components/ui/SectionTitle";
import PopularDishes from "../../components/customer/PopularDishes";
import { getCurrentUser } from "../../api/authApi";

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("zoop_token");

    if (!token) {
      return;
    }

    getCurrentUser(token)
      .then((data) => {
        setUser(data);
      })
      .catch((error) => {
        console.error("Failed to fetch current user:", error);
        setUser(null);
      });
  }, []);

  /*
   * Depending on your backend response, getCurrentUser()
   * may return:
   *
   * {
   *   user: {
   *     role: "ADMIN"
   *   }
   * }
   *
   * Hence user?.user?.role here.
   */
  const isAdmin = user?.data?.role === "ADMIN";

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-76px)] items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#111111]/70" />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 text-sm font-medium uppercase tracking-[0.4em] text-[#D92323] sm:text-base"
            >
              Welcome to
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.1,
              }}
              className="heading-font text-7xl font-extrabold uppercase leading-[0.85] tracking-wide text-white sm:text-8xl md:text-9xl"
            >
              Zoop
              <span className="block text-[#D92323]">
                Cafe
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.25,
              }}
              className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base sm:leading-8"
            >
              Fresh food, bold flavours and your favourite
              dishes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.4,
              }}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              {/* Explore Menu */}
              <Link to="/menu">
                <Button className="w-full sm:w-auto">
                  Explore Menu
                  <ArrowRight size={19} />
                </Button>
              </Link>

              {/* My Orders */}
              <Link to="/orders">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  My Orders
                </Button>
              </Link>

              {/* Admin Mode */}
              {isAdmin && (
                <Link to="/admin">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <ShieldCheck size={18} />
                    Admin Mode
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular dishes */}
      <PopularDishes />

      {/* Intro */}
      <section className="border-t border-white/5 px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="What's cooking"
            
            description="From quick bites to proper meals, discover the food that keeps our customers coming back."
          />

          
        </div>
      </section>
    </div>
  );
}

export default Home;