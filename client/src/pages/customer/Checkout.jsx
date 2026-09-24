import { useState } from "react";
import {
  AlertCircle,
  LoaderCircle,
  ShoppingBag,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import apiFetch from "../../api/apiClient";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

function Checkout() {
  const navigate = useNavigate();

  const {
    items,
    cartTotal,
    itemCount,
    clearCart,
  } = useCart();

  const {
    user,
    isAuthenticated,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | EMPTY CART
  |--------------------------------------------------------------------------
  */

  if (items.length === 0) {
    return (
      <main className="min-h-[calc(100vh-76px)] bg-[#101010] px-4 py-16 sm:px-6">
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <div className="text-center">

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-[#171717]">
              <ShoppingBag
                size={32}
                className="text-gray-500"
              />
            </div>

            <p className="text-xs uppercase tracking-[0.3em] text-[#D92323]">
              Checkout
            </p>

            <h1 className="heading-font mt-2 text-4xl uppercase text-white sm:text-5xl">
              Your Cart is Empty
            </h1>

            <p className="mt-4 text-sm text-gray-500">
              Add something delicious before checking out.
            </p>

            <Link
              to="/menu"
              className="mt-8 inline-flex rounded-md bg-[#D92323] px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#ef2929]"
            >
              Explore Menu
            </Link>

          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LOGIN REQUIRED
  |--------------------------------------------------------------------------
  */

  if (!isAuthenticated) {
    return (
      <main className="min-h-[calc(100vh-76px)] bg-[#101010] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-lg">

          <div className="rounded-2xl border border-white/10 bg-[#161616] p-6 text-center sm:p-8">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#D92323]/10 text-[#D92323]">
              <AlertCircle size={28} />
            </div>

            <p className="text-xs uppercase tracking-[0.3em] text-[#D92323]">
              Authentication Required
            </p>

            <h1 className="heading-font mt-2 text-3xl uppercase text-white">
              Login to Continue
            </h1>

            <p className="mt-4 text-sm leading-6 text-gray-500">
              You need to login before placing an order.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

              <Link
                to="/login"
                className="flex flex-1 items-center justify-center rounded-md bg-[#D92323] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#ef2929]"
              >
                Login
              </Link>

              <Link
                to="/cart"
                className="flex flex-1 items-center justify-center rounded-md border border-white/15 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:border-[#D92323]"
              >
                Back to Cart
              </Link>

            </div>

          </div>

        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PLACE ORDER
  |--------------------------------------------------------------------------
  */

  const handlePlaceOrder = async () => {
    setError("");
    setLoading(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | Build API payload
      |--------------------------------------------------------------------------
      |
      | IMPORTANT:
      |
      | We only send:
      |
      | variantId
      | quantity
      | choices
      |
      | We NEVER send price.
      |
      */

      const orderItems = items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,

        ...(item.choices?.length > 0
          ? {
              choices: item.choices.map(
                (choice) => ({
                  choiceGroupId:
                    choice.choiceGroupId,

                  optionIds:
                    choice.optionIds,
                })
              ),
            }
          : {}),
      }));

      const response = await apiFetch(
  "/orders",
  {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      items: orderItems,
    }),
  }
);

      const result = await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to place order"
        );
      }

      const createdOrder =
        result.data;

      /*
      |--------------------------------------------------------------------------
      | Clear cart only AFTER successful order
      |--------------------------------------------------------------------------
      */

      clearCart();

      /*
      |--------------------------------------------------------------------------
      | Redirect to order details
      |--------------------------------------------------------------------------
      */

      navigate(
        `/orders/${createdOrder.id}`,
        {
          replace: true,
        }
      );

    } catch (error) {
      console.error(
        "Place order error:",
        error
      );

      setError(error.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#101010] px-4 py-8 sm:px-6 sm:py-12">

      <div className="mx-auto max-w-6xl">

        {/* Heading */}

        <div className="mb-8">

          <p className="text-xs uppercase tracking-[0.3em] text-[#D92323]">
            Final Step
          </p>

          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">

            <div>
              <h1 className="heading-font text-4xl uppercase tracking-wide text-white sm:text-5xl">
                Checkout
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Review your order before placing it.
              </p>
            </div>

            <div className="text-right">

              <p className="text-xs uppercase tracking-wider text-gray-600">
                Ordering as
              </p>

              <p className="mt-1 text-sm text-white">
                {user?.name}
              </p>

            </div>

          </div>

        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* ================================================= */}
          {/* ORDER ITEMS */}
          {/* ================================================= */}

          <section className="space-y-3">

            {items.map((item) => (
              <article
                key={item.cartItemId}
                className="rounded-xl border border-white/10 bg-[#161616] p-4 sm:p-5"
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">

                    <h2 className="heading-font truncate text-xl uppercase tracking-wide text-white">
                      {item.itemName}
                    </h2>

                    {item.variantName && (
                      <p className="mt-1 text-sm text-gray-500">
                        {item.variantName}
                      </p>
                    )}

                    <p className="mt-3 text-sm text-gray-500">
                      Quantity:{" "}

                      <span className="text-white">
                        {item.quantity}
                      </span>
                    </p>

                    {/* Combo choices */}

                    {item.choiceDetails?.length >
                      0 && (
                      <div className="mt-4 space-y-2">

                        {item.choiceDetails.map(
                          (group) => (
                            <div
                              key={
                                group.choiceGroupId
                              }
                            >

                              <p className="text-[10px] uppercase tracking-wider text-gray-600">
                                {
                                  group.groupName
                                }
                              </p>

                              <div className="mt-1 flex flex-wrap gap-2">

                                {group.options.map(
                                  (option) => (
                                    <span
                                      key={
                                        option.optionId
                                      }
                                      className="text-xs text-gray-400"
                                    >
                                      {option.name}

                                      {option.variantName
                                        ? ` · ${option.variantName}`
                                        : ""}
                                    </span>
                                  )
                                )}

                              </div>

                            </div>
                          )
                        )}

                      </div>
                    )}

                  </div>

                  <div className="shrink-0 text-right">

                    <p className="text-xs text-gray-600">
                      ₹
                      {Number(
                        item.unitPrice
                      ).toLocaleString(
                        "en-IN"
                      )}
                      {" "}each
                    </p>

                    <p className="heading-font mt-1 text-xl text-[#D92323]">
                      ₹
                      {(
                        Number(
                          item.unitPrice
                        ) *
                        item.quantity
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                  </div>

                </div>

              </article>
            ))}

          </section>


          {/* ================================================= */}
          {/* ORDER SUMMARY */}
          {/* ================================================= */}

          <aside className="h-fit lg:sticky lg:top-24">

            <div className="rounded-xl border border-white/10 bg-[#161616] p-5 sm:p-6">

              <p className="text-xs uppercase tracking-[0.25em] text-[#D92323]">
                Order Summary
              </p>

              <h2 className="heading-font mt-1 text-2xl uppercase tracking-wide text-white">
                Almost There
              </h2>

              <div className="my-5 border-t border-white/10" />

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-500">
                  Items
                </span>

                <span className="text-sm text-white">
                  {itemCount}
                </span>

              </div>

              <div className="mt-4 flex items-center justify-between">

                <span className="text-sm text-gray-500">
                  Estimated Total
                </span>

                <span className="heading-font text-3xl text-white">
                  ₹
                  {cartTotal.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

              <p className="mt-4 text-xs leading-5 text-gray-600">
                Prices and item availability will be
                verified by the restaurant before your
                order is created.
              </p>

              {/* Error */}

              {error && (
                <div className="mt-5 rounded-lg border border-[#D92323]/40 bg-[#D92323]/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Place order */}

              <button
                onClick={
                  handlePlaceOrder
                }
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-[#D92323] px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#ef2929] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading && (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                )}

                {loading
                  ? "Placing Order..."
                  : "Place Order"}

              </button>

              <Link
                to="/cart"
                className="mt-4 flex items-center justify-center text-xs font-semibold uppercase tracking-wide text-gray-500 transition hover:text-white"
              >
                ← Back to Cart
              </Link>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}

export default Checkout;