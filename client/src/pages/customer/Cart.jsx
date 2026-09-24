import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { useCart } from "../../context/CartContext";

function Cart() {
  const {
    items,
    itemCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  /*
   * Empty cart
   */
  if (items.length === 0) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-[#101010] px-4 py-16 sm:px-6">
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-[#171717]">
              <ShoppingBag
                size={32}
                className="text-gray-500"
              />
            </div>

            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#D92323]">
              Your cart
            </p>

            <h1 className="heading-font text-4xl uppercase tracking-wide text-white sm:text-5xl">
              Cart is Empty
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gray-500">
              Looks like you haven't added
              anything yet. Let's fix that.
            </p>

            <Link
              to="/menu"
              className="mt-8 inline-flex items-center justify-center rounded-md bg-[#D92323] px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#ef2929]"
            >
              Explore Menu
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#101010] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">

        {/* Page heading */}
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-8"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#D92323]">
            Your selection
          </p>

          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <h1 className="heading-font text-4xl uppercase tracking-wide text-white sm:text-5xl">
              Your Cart
            </h1>

            <span className="text-sm text-gray-500">
              {itemCount}{" "}
              {itemCount === 1
                ? "item"
                : "items"}
            </span>
          </div>
        </motion.div>

        {/* Main layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">

          {/* Cart items */}
          <section className="space-y-3">
            {items.map(
              (item, index) => (
                <motion.article
                  key={item.cartItemId}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.05,
                  }}
                  className="rounded-xl border border-white/10 bg-[#161616] p-4 sm:p-5"
                >
                  <div className="flex gap-4">

                    {/* Image placeholder */}
                    <div className="hidden h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#222] sm:flex">
                      <ShoppingBag
                        size={25}
                        className="text-gray-600"
                      />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="heading-font truncate text-xl uppercase tracking-wide text-white">
                            {item.itemName}
                          </h2>

                          {item.variantName && (
                            <p className="mt-1 text-sm text-gray-500">
                              {item.variantName}
                            </p>
                          )}
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() =>
                            removeFromCart(
                              item.cartItemId
                            )
                          }
                          className="shrink-0 rounded-md p-2 text-gray-600 transition hover:bg-red-500/10 hover:text-[#D92323]"
                          aria-label={`Remove ${item.itemName}`}
                        >
                          <Trash2
                            size={18}
                          />
                        </button>
                      </div>

                      {/* Combo choices */}
                      {item.choiceDetails
                        ?.length >
                        0 && (
                        <div className="mt-3 space-y-2">
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

                                <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-1">
                                  {group.options.map(
                                    (
                                      option
                                    ) => (
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

                      {/* Bottom row */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">

                        {/* Quantity */}
                        <div className="flex items-center rounded-md border border-white/10">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.cartItemId,
                                item.quantity -
                                  1
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:text-white"
                            aria-label="Decrease quantity"
                          >
                            <Minus
                              size={14}
                            />
                          </button>

                          <span className="flex h-9 min-w-9 items-center justify-center border-x border-white/10 px-2 text-sm font-medium text-white">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                item.cartItemId,
                                Math.min(
                                  100,
                                  item.quantity +
                                    1
                                )
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:text-white"
                            aria-label="Increase quantity"
                          >
                            <Plus
                              size={14}
                            />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-xs text-gray-600">
                            ₹
                            {Number(
                              item.unitPrice
                            )}{" "}
                            each
                          </p>

                          <p className="heading-font mt-0.5 text-xl text-[#D92323]">
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
                    </div>
                  </div>
                </motion.article>
              )
            )}

            {/* Continue shopping */}
            <Link
              to="/menu"
              className="inline-block pt-3 text-sm font-semibold uppercase tracking-wide text-gray-500 transition hover:text-white"
            >
              ← Continue Shopping
            </Link>
          </section>

          {/* Summary */}
          <aside className="h-fit lg:sticky lg:top-24">
            <div className="rounded-xl border border-white/10 bg-[#161616] p-5 sm:p-6">

              <p className="text-xs uppercase tracking-[0.25em] text-[#D92323]">
                Order summary
              </p>

              <h2 className="heading-font mt-1 text-2xl uppercase tracking-wide text-white">
                Your Order
              </h2>

              <div className="my-5 border-t border-white/10" />

              {/* Item summary */}
              <div className="space-y-3">
                {items.map(
                  (item) => (
                    <div
                      key={
                        item.cartItemId
                      }
                      className="flex justify-between gap-4 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-gray-300">
                          {item.itemName}
                        </p>

                        <p className="text-xs text-gray-600">
                          {item.quantity} × ₹
                          {Number(
                            item.unitPrice
                          )}
                        </p>
                      </div>

                      <span className="shrink-0 text-gray-300">
                        ₹
                        {(
                          Number(
                            item.unitPrice
                          ) *
                          item.quantity
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="my-5 border-t border-white/10" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Subtotal
                </span>

                <span className="heading-font text-2xl text-white">
                  ₹
                  {cartTotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-600">
                Final price and availability
                will be verified when you
                place the order.
              </p>

              <Link
                to="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-md bg-[#D92323] px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#ef2929]"
              >
                Proceed to Checkout
              </Link>

            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}

export default Cart;