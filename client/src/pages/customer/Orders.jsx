import { useEffect, useState } from "react";

import {
  Link,
} from "react-router-dom";

import {
  LoaderCircle,
  Package,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

function Orders() {
  const {
    token,
    isAuthenticated,
  } = useAuth();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchOrders =
      async () => {
        if (!token) {
          setLoading(false);
          return;
        }

        try {
          const response =
            await fetch(
              `${API_URL}/orders`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
                "Failed to fetch orders"
            );
          }

          setOrders(result.data);
        } catch (error) {
          console.error(
            "Fetch orders error:",
            error
          );

          setError(
            error.message
          );
        } finally {
          setLoading(false);
        }
      };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [
    token,
    isAuthenticated,
  ]);

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-5 text-center">

        <div>

          <Package
            size={48}
            className="mx-auto text-[#D92323]"
          />

          <h1 className="heading-font mt-5 text-3xl uppercase text-white">
            Your Orders
          </h1>

          <p className="mt-3 text-white/55">
            Login to view your orders.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex rounded-lg bg-[#D92323] px-6 py-3 text-white"
          >
            Login
          </Link>

        </div>

      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b]">

        <LoaderCircle
          size={34}
          className="animate-spin text-[#D92323]"
        />

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-5 py-10 text-white sm:px-8">

      <div className="mx-auto max-w-5xl">

        <div className="mb-8">

          <p className="text-sm uppercase tracking-widest text-[#D92323]">
            Zoop Cafe
          </p>

          <h1 className="heading-font mt-2 text-4xl uppercase sm:text-5xl">
            My Orders
          </h1>

        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {!error &&
          orders.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#111111] px-6 py-14 text-center">

              <Package
                size={44}
                className="mx-auto text-white/30"
              />

              <h2 className="heading-font mt-5 text-2xl uppercase">
                No Orders Yet
              </h2>

              <p className="mt-3 text-white/50">
                Your delicious orders will
                appear here.
              </p>

              <Link
                to="/menu"
                className="mt-6 inline-flex rounded-lg bg-[#D92323] px-6 py-3 text-white"
              >
                Explore Menu
              </Link>

            </div>
          )}

        <div className="space-y-4">

          {orders.map(
            (order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="group block rounded-2xl border border-white/10 bg-[#111111] p-5 transition hover:border-[#D92323]/50 hover:bg-[#151515]"
              >

                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                  <div>

                    <div className="flex items-center gap-3">

                      <h2 className="heading-font text-2xl uppercase">
                        Order #{order.id}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          order.status ===
                          "CANCELLED"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-[#D92323]/10 text-[#ff5a5a]"
                        }`}
                      >
                        {order.status}
                      </span>

                    </div>

                    <p className="mt-2 text-sm text-white/45">
                      {new Date(
                        order.createdAt
                      ).toLocaleString()}
                    </p>

                    <p className="mt-4 text-sm text-white/60">

                      {order.items
                        .map(
                          (item) =>
                            `${item.itemName} × ${item.quantity}`
                        )
                        .join(", ")}

                    </p>

                  </div>

                  <div className="flex items-center gap-5">

                    <div className="text-right">

                      <p className="text-sm text-white/45">
                        Total
                      </p>

                      <p className="text-lg font-semibold">
                        ₹
                        {Number(
                          order.totalAmount
                        ).toFixed(2)}
                      </p>

                    </div>

                    <ArrowRight
                      size={20}
                      className="text-white/35 transition group-hover:translate-x-1 group-hover:text-[#D92323]"
                    />

                  </div>

                </div>

              </Link>
            )
          )}

        </div>

      </div>

    </main>
  );
}

export default Orders;