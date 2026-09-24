import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Star,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { getMenu } from "../../api/menuApi";
import AddToCartModal from "../../components/customer/AddToCartModal";
import ReviewList from "../../components/customer/ReviewList";
import ReviewModal from "../../components/customer/ReviewModal";

function MenuItemDetails() {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] =
    useState(null);

  const [reviewModalOpen, setReviewModalOpen] =
  useState(false);

  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMenu();

        const categories = Array.isArray(data)
          ? data
          : data?.categories || [];

        let foundItem = null;

        for (const category of categories) {
          const items =
            category.items ||
            category.menuItems ||
            [];

          const match = items.find(
            (menuItem) =>
              String(menuItem.id) ===
              String(itemId)
          );

          if (match) {
            foundItem = {
              ...match,
              categoryId: category.id,
              categoryName: category.name,
            };

            break;
          }
        }

        if (!foundItem) {
          setError("Menu item not found.");
          return;
        }

        setItem(foundItem);
      } catch (err) {
        console.error(
          "Menu item loading error:",
          err
        );

        setError(
          err.message ||
            "Unable to load this menu item."
        );
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [itemId]);

  const availableVariants = useMemo(() => {
    return (item?.variants || []).filter(
      (variant) =>
        variant.isAvailable !== false
    );
  }, [item]);

  const lowestPrice = useMemo(() => {
    if (availableVariants.length === 0) {
      return null;
    }

    return Math.min(
      ...availableVariants.map((variant) =>
        Number(variant.price)
      )
    );
  }, [availableVariants]);

  const isCombo =
    item?.type === "COMBO";

  const dietaryLabel =
    item?.dietaryType === "NON_VEG"
      ? "Non-Veg"
      : item?.dietaryType === "VEG"
        ? "Veg"
        : item?.dietaryType === "EGG"
          ? "Egg"
          : null;

  const isAvailable =
    item?.isAvailable !== false &&
    availableVariants.length > 0;

    const handleWriteReview = () => {
  const token = localStorage.getItem("zoop_token");

  if (!token) {
    navigate("/login");
    return;
  }

  setReviewModalOpen(true);
};

  if (loading) {
    return (
      <div className="min-h-screen px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-5 w-28 rounded bg-white/5" />

            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              <div className="aspect-[4/3] rounded-xl bg-white/5" />

              <div className="space-y-5">
                <div className="h-10 w-2/3 rounded bg-white/5" />
                <div className="h-5 w-1/3 rounded bg-white/5" />
                <div className="h-24 w-full rounded bg-white/5" />
                <div className="h-14 w-full rounded bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#D92323]">
            Menu
          </p>

          <h1 className="heading-font mt-3 text-4xl font-bold uppercase tracking-wide text-white">
            Item Not Found
          </h1>

          <p className="mt-4 text-sm leading-6 text-gray-500">
            {error ||
              "We couldn't find the menu item you're looking for."}
          </p>

          <Link
            to="/menu"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#D92323] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#ef2929]"
          >
            <ArrowLeft size={17} />
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* ================================================= */}
        {/* BACK */}
        {/* ================================================= */}

        <Link
          to="/menu"
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Menu
        </Link>

        {/* ================================================= */}
        {/* ITEM DETAILS */}
        {/* ================================================= */}

        <section className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">

          {/* IMAGE */}

          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#161616]">
            <div className="aspect-[4/3] bg-[#202020]">

              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="heading-font text-5xl uppercase tracking-wider text-white/10">
                    Zoop
                  </span>
                </div>
              )}

            </div>

            {/* BADGES */}

            <div className="absolute left-4 top-4 flex flex-wrap gap-2">

              {dietaryLabel && (
                <span
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                    item.dietaryType === "VEG"
                      ? "border-green-500/30 bg-black/70 text-green-400"
                      : item.dietaryType === "NON_VEG"
                        ? "border-red-500/30 bg-black/70 text-red-400"
                        : "border-yellow-500/30 bg-black/70 text-yellow-400"
                  }`}
                >
                  {dietaryLabel}
                </span>
              )}

              {isCombo && (
                <span className="rounded-full bg-[#D92323] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Combo
                </span>
              )}

              {item.isPopular && (
                <span className="flex items-center gap-1 rounded-full border border-yellow-400/20 bg-black/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                  <Star
                    size={11}
                    fill="currentColor"
                  />
                  Popular
                </span>
              )}

            </div>
          </div>

          {/* INFORMATION */}

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#D92323]">
              {item.categoryName}
            </p>

            <h1 className="heading-font mt-2 text-4xl font-bold uppercase tracking-wide text-white sm:text-5xl">
              {item.name}
            </h1>

            {item.description && (
              <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-400">
                {item.description}
              </p>
            )}

            {/* PRICE */}

            {lowestPrice !== null && (
              <div className="mt-7">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
                  Starting from
                </p>

                <p className="heading-font mt-1 text-3xl text-[#D92323]">
                  ₹
                  {lowestPrice.toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>
            )}

            {/* VARIANTS */}

            {availableVariants.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Available Options
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  {availableVariants.map(
                    (variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-[#161616] px-4 py-3"
                      >
                        <span className="text-sm text-gray-300">
                          {variant.name ||
                            "Regular"}
                        </span>

                        <span className="heading-font text-lg text-[#D92323]">
                          ₹
                          {Number(
                            variant.price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* ADD TO CART */}

            <div className="mt-8">
              <button
                type="button"
                disabled={!isAvailable}
                onClick={() =>
                  setSelectedItem(item)
                }
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#D92323] px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#ef2929] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-600 sm:w-auto"
              >
                <Plus size={18} />

                {isAvailable
                  ? isCombo
                    ? "Choose Combo"
                    : "Add to Cart"
                  : "Unavailable"}
              </button>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* COMBO CONTENT */}
        {/* ================================================= */}

        {isCombo &&
          item.comboItems?.length > 0 && (
            <section className="mt-16 border-t border-white/5 pt-12">

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#D92323]">
                  What's included
                </p>

                <h2 className="heading-font mt-2 text-3xl font-bold uppercase tracking-wide text-white">
                  Combo Includes
                </h2>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {item.comboItems.map(
                  (comboItem, index) => (
                    <div
                      key={
                        comboItem.id ||
                        `${comboItem.variantId}-${index}`
                      }
                      className="rounded-xl border border-white/10 bg-[#161616] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {comboItem.name ||
                              "Item"}
                          </p>

                          {comboItem.variantName &&
                            comboItem.variantName !==
                              "Regular" && (
                              <p className="mt-1 text-xs text-gray-600">
                                {
                                  comboItem.variantName
                                }
                              </p>
                            )}
                        </div>

                        <span className="shrink-0 text-xs text-gray-500">
                          ×
                          {Number(
                            comboItem.quantity ||
                              1
                          )}
                        </span>
                      </div>

                      {comboItem.servingLabel && (
                        <p className="mt-3 text-xs text-gray-600">
                          {comboItem.servingLabel}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </section>
          )}

        {/* ================================================= */}
{/* REVIEWS */}
{/* ================================================= */}

<section className="mt-16 border-t border-white/5 pt-12">
  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#D92323]">
        Customer feedback
      </p>

      <h2 className="heading-font mt-2 text-3xl font-bold uppercase tracking-wide text-white">
        Customer Reviews
      </h2>
    </div>

    <button
      type="button"
      onClick={handleWriteReview}
      className="inline-flex items-center justify-center rounded-md border border-white/10 bg-[#161616] px-5 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:border-[#D92323]/40 hover:bg-[#D92323]/10"
    >
      Write a Review
    </button>
  </div>

  <ReviewList
    menuItemId={item.id}
    title={`Reviews for ${item.name}`}
  />
</section>

<ReviewModal
  isOpen={reviewModalOpen}
  onClose={() => setReviewModalOpen(false)}
  menuItemId={item.id}
  targetName={item.name}
/>

      </div>

      {/* ================================================= */}
      {/* ADD TO CART MODAL */}
      {/* ================================================= */}

      <AddToCartModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() =>
          setSelectedItem(null)
        }
      />
    </div>
  );
}

export default MenuItemDetails;