import { useEffect, useState } from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  CheckCircle2,
  Clock3,
  CookingPot,
  PackageCheck,
  XCircle,
  LoaderCircle,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const STATUS_STEPS = [
  {
    status: "PENDING",
    label: "Order Placed",
    icon: Clock3,
  },
  {
    status: "CONFIRMED",
    label: "Confirmed",
    icon: CheckCircle2,
  },
  {
    status: "PREPARING",
    label: "Preparing",
    icon: CookingPot,
  },
  {
    status: "READY",
    label: "Ready",
    icon: PackageCheck,
  },
  {
    status: "COMPLETED",
    label: "Completed",
    icon: CheckCircle2,
  },
];

function OrderDetails() {
  const { orderId } = useParams();

  const {
    token,
    isAuthenticated,
  } = useAuth();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [cancelling, setCancelling] =
    useState(false);

  const fetchOrder = async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/orders/${orderId}`,
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
            "Failed to fetch order"
        );
      }

      setOrder(result.data);
    } catch (error) {
      console.error(
        "Fetch order error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrder();
    }
  }, [orderId, token, isAuthenticated]);

  const handleCancelOrder =
    async () => {
      if (!order) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to cancel this order?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setCancelling(true);

        const response =
          await fetch(
            `${API_URL}/orders/${order.id}/cancel`,
            {
              method: "PATCH",

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
              "Failed to cancel order"
          );
        }

        setOrder((currentOrder) => ({
          ...currentOrder,
          ...result.data,
        }));
      } catch (error) {
        alert(error.message);
      } finally {
        setCancelling(false);
      }
    };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] px-5 py-16 text-white">

        <div className="mx-auto max-w-xl text-center">

          <h1 className="heading-font text-3xl uppercase">
            Login Required
          </h1>

          <p className="mt-4 text-white/60">
            Please login to view your order.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex rounded-lg bg-[#D92323] px-6 py-3 font-medium text-white"
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

        <div className="flex flex-col items-center gap-4 text-white">

          <LoaderCircle
            size={34}
            className="animate-spin text-[#D92323]"
          />

          <p className="text-white/60">
            Loading your order...
          </p>

        </div>

      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] px-5 py-16 text-white">

        <div className="mx-auto max-w-xl text-center">

          <XCircle
            size={48}
            className="mx-auto text-[#D92323]"
          />

          <h1 className="heading-font mt-5 text-3xl uppercase">
            Order Not Found
          </h1>

          <p className="mt-3 text-white/60">
            {error ||
              "We couldn't find this order."}
          </p>

          <Link
            to="/orders"
            className="mt-6 inline-flex items-center gap-2 text-[#D92323]"
          >
            <ArrowLeft size={18} />
            Back to My Orders
          </Link>

        </div>

      </main>
    );
  }

  const currentStepIndex =
    STATUS_STEPS.findIndex(
      (step) =>
        step.status === order.status
    );

  const isCancelled =
    order.status === "CANCELLED";

  const canCancel =
    order.status === "PENDING" ||
    order.status === "CONFIRMED";

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-5 py-8 text-white sm:px-8">

      <div className="mx-auto max-w-5xl">

        {/* Back */}

        <Link
          to="/orders"
          className="mb-7 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-[#D92323]"
        >
          <ArrowLeft size={17} />

          My Orders
        </Link>

        {/* Header */}

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

          <div>

            <p className="text-sm text-white/45">
              Order
            </p>

            <h1 className="heading-font text-4xl uppercase sm:text-5xl">
              #{order.id}
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Placed on{" "}
              {new Date(
                order.createdAt
              ).toLocaleString()}
            </p>

          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">

            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                isCancelled
                  ? "bg-red-500/15 text-red-400"
                  : "bg-[#D92323]/15 text-[#ff5a5a]"
              }`}
            >
              {order.status}
            </div>

            {canCancel && (
              <button
                onClick={
                  handleCancelOrder
                }
                disabled={cancelling}
                className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Order"}
              </button>
            )}

          </div>

        </div>

        {/* Cancelled Order */}

        {isCancelled ? (
          <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-6">

            <div className="flex items-start gap-4">

              <XCircle
                size={28}
                className="mt-1 text-red-400"
              />

              <div>

                <h2 className="heading-font text-xl uppercase text-red-300">
                  Order Cancelled
                </h2>

                <p className="mt-2 text-sm text-white/55">
                  This order has been
                  cancelled and will not be
                  prepared.
                </p>

              </div>

            </div>

          </div>
        ) : (

          /* Order Progress */

          <section className="mb-10 rounded-2xl border border-white/10 bg-[#111111] p-5 sm:p-8">

            <h2 className="heading-font mb-8 text-2xl uppercase">
              Order Status
            </h2>

            <div className="relative">

              <div className="absolute left-[19px] top-6 h-[calc(100%-48px)] w-px bg-white/10 sm:left-0 sm:top-[19px] sm:h-px sm:w-full" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:justify-between sm:gap-0">

                {STATUS_STEPS.map(
                  (step, index) => {
                    const Icon =
                      step.icon;

                    const completed =
                      index <=
                      currentStepIndex;

                    return (
                      <div
                        key={step.status}
                        className="relative flex items-center gap-4 sm:flex-col sm:items-center sm:gap-3"
                      >

                        <div
                          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border ${
                            completed
                              ? "border-[#D92323] bg-[#D92323] text-white"
                              : "border-white/15 bg-[#111111] text-white/30"
                          }`}
                        >
                          <Icon size={18} />
                        </div>

                        <div className="sm:text-center">

                          <p
                            className={`text-sm font-medium ${
                              completed
                                ? "text-white"
                                : "text-white/35"
                            }`}
                          >
                            {step.label}
                          </p>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          </section>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

          {/* Order Items */}

          <section className="rounded-2xl border border-white/10 bg-[#111111] p-5 sm:p-7">

            <h2 className="heading-font mb-6 text-2xl uppercase">
              Your Items
            </h2>

            <div className="space-y-4">

              {order.items.map(
                (item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/5 bg-black/20 p-4"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="font-medium text-white">
                          {item.itemName}
                        </h3>

                        {item.variantName && (
                          <p className="mt-1 text-sm text-white/45">
                            {item.variantName}
                          </p>
                        )}

                        <p className="mt-2 text-sm text-white/50">
                          Quantity:{" "}
                          {item.quantity}
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="font-medium text-white">
                          ₹
                          {Number(
                            item.totalPrice
                          ).toFixed(2)}
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          ₹
                          {Number(
                            item.unitPrice
                          ).toFixed(2)}{" "}
                          each
                        </p>

                      </div>

                    </div>

                    {/* Combo Choices */}

                    {item.choices?.length > 0 && (
                      <div className="mt-4 border-t border-white/5 pt-4">

                        <p className="mb-2 text-xs uppercase tracking-wider text-white/35">
                          Your selections
                        </p>

                        <div className="space-y-1">

                          {item.choices.map(
                            (choice) => (
                              <div
                                key={
                                  choice.id
                                }
                                className="flex justify-between text-sm"
                              >
                                <span className="text-white/45">
                                  {
                                    choice.choiceGroupName
                                  }
                                </span>

                                <span className="text-white/75">
                                  {
                                    choice.optionName
                                  }
                                  {choice.optionVariantName &&
                                    ` (${choice.optionVariantName})`}
                                </span>
                              </div>
                            )
                          )}

                        </div>

                      </div>
                    )}

                  </div>
                )
              )}

            </div>

          </section>

          {/* Summary */}

          <aside className="h-fit rounded-2xl border border-white/10 bg-[#111111] p-6">

            <h2 className="heading-font text-2xl uppercase">
              Order Summary
            </h2>

            <div className="mt-6 border-t border-white/10 pt-5">

              <div className="flex items-center justify-between text-sm">

                <span className="text-white/50">
                  Total Amount
                </span>

                <span className="text-xl font-semibold text-white">
                  ₹
                  {Number(
                    order.totalAmount
                  ).toFixed(2)}
                </span>

              </div>

            </div>

            <div className="mt-6 rounded-xl border border-[#D92323]/20 bg-[#D92323]/5 p-4">

              <p className="text-sm font-medium text-[#ff5a5a]">
                Current Status
              </p>

              <p className="mt-1 text-sm text-white/70">
                {isCancelled
                  ? "Your order was cancelled."
                  : `Your order is currently ${order.status.toLowerCase()}.`}
              </p>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}

export default OrderDetails;