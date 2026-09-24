import { Plus, Star } from "lucide-react";
import { Link } from "react-router-dom";

function MenuItemCard({
  item,
  onAddToCart,
}) {
  const availableVariants = (
    item.variants || []
  ).filter(
    (variant) =>
      variant.isAvailable !== false
  );

  const lowestPrice =
    availableVariants.length > 0
      ? Math.min(
          ...availableVariants.map(
            (variant) =>
              Number(variant.price)
          )
        )
      : null;

  const isAvailable =
    item.isAvailable !== false &&
    availableVariants.length > 0;

  const isCombo =
    item.type === "COMBO";

  const dietaryLabel =
    item.dietaryType === "NON_VEG"
      ? "Non-Veg"
      : item.dietaryType === "VEG"
        ? "Veg"
        : item.dietaryType === "EGG"
          ? "Egg"
          : null;

  return (
    <article
      className={`group overflow-hidden rounded-xl border border-white/10 bg-[#161616] transition duration-300 ${
        isAvailable
          ? "hover:-translate-y-1 hover:border-white/20 hover:shadow-xl"
          : "opacity-60"
      }`}
    >
      {/* ================================================= */}
      {/* ITEM DETAILS LINK */}
      {/* ================================================= */}

      <Link
        to={`/menu/item/${item.id}`}
        className="block cursor-pointer"
      >
        {/* ================================================= */}
        {/* IMAGE */}
        {/* ================================================= */}

        <div className="relative aspect-[4/3] overflow-hidden bg-[#202020]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="heading-font text-3xl uppercase tracking-wider text-white/10">
                Zoop
              </span>
            </div>
          )}

          {/* Dietary badge */}

          {dietaryLabel && (
            <div className="absolute left-3 top-3">
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  item.dietaryType === "VEG"
                    ? "border-green-500/30 bg-green-500/10 text-green-400"
                    : item.dietaryType === "NON_VEG"
                      ? "border-red-500/30 bg-red-500/10 text-red-400"
                      : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                }`}
              >
                {dietaryLabel}
              </span>
            </div>
          )}

          {/* Popular */}

          {item.isPopular && (
            <div className="absolute right-3 top-3">
              <span className="flex items-center gap-1 rounded-full border border-yellow-400/20 bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-400 backdrop-blur-sm">
                <Star
                  size={11}
                  fill="currentColor"
                />
                Popular
              </span>
            </div>
          )}

          {/* Combo badge */}

          {isCombo && (
            <div className="absolute bottom-3 left-3">
              <span className="rounded-full bg-[#D92323] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Combo
              </span>
            </div>
          )}
        </div>

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="heading-font text-2xl uppercase tracking-wide text-white transition-colors group-hover:text-[#D92323]">
                {item.name}
              </h3>

              {item.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                  {item.description}
                </p>
              )}
            </div>

            {lowestPrice !== null && (
              <div className="shrink-0 text-right">
                <p className="text-[10px] uppercase tracking-wider text-gray-600">
                  From
                </p>

                <p className="heading-font text-xl text-[#D92323]">
                  ₹
                  {lowestPrice.toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Combo preview */}

          {isCombo &&
            item.comboItems?.length > 0 && (
              <div className="mt-4 rounded-lg border border-white/5 bg-black/20 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Includes
                </p>

                <div className="mt-2 space-y-1">
                  {item.comboItems
                    .slice(0, 4)
                    .map((comboItem, index) => (
                      <div
                        key={
                          comboItem.id ||
                          `${comboItem.variantId}-${index}`
                        }
                        className="flex items-start justify-between gap-3 text-xs"
                      >
                        <span className="text-gray-400">
                          {comboItem.name ||
                            "Item"}
                        </span>

                        <span className="shrink-0 text-gray-600">
                          {comboItem.quantity > 1
                            ? `${comboItem.quantity} × `
                            : ""}
                          {comboItem.servingLabel ||
                            comboItem.variantName ||
                            ""}
                        </span>
                      </div>
                    ))}

                  {item.comboItems.length >
                    4 && (
                    <p className="pt-1 text-[11px] text-gray-600">
                      +
                      {item.comboItems.length -
                        4}{" "}
                      more items
                    </p>
                  )}
                </div>
              </div>
            )}
        </div>
      </Link>

      {/* ================================================= */}
      {/* BOTTOM / CART ACTION */}
      {/* ================================================= */}

      <div className="px-5 pb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            {availableVariants.length ===
            1 ? (
              <p className="text-xs text-gray-600">
                {availableVariants[0].name ||
                  "Regular"}
              </p>
            ) : (
              <p className="text-xs text-gray-600">
                {availableVariants.length}{" "}
                options available
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={!isAvailable}
            onClick={() =>
              onAddToCart(item)
            }
            className="flex shrink-0 items-center gap-2 rounded-md bg-[#D92323] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#ef2929] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-600"
          >
            <Plus size={16} />

            {isAvailable
              ? isCombo
                ? "Choose"
                : "Add"
              : "Unavailable"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default MenuItemCard;