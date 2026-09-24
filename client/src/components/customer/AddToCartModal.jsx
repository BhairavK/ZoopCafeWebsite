import {
  Minus,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "../../context/CartContext";

function AddToCartModal({
  item,
  isOpen,
  onClose,
}) {
  const { addToCart } = useCart();

  const [selectedVariantId, setSelectedVariantId] =
    useState("");

  const [selectedChoices, setSelectedChoices] =
    useState({});

  const [quantity, setQuantity] =
    useState(1);

  const [error, setError] =
    useState("");

  const variants = useMemo(() => {
    return (item?.variants || []).filter(
      (variant) =>
        variant.isAvailable !== false
    );
  }, [item]);

  const choiceGroups = useMemo(() => {
    return (
      item?.choiceGroups ||
      item?.comboChoiceGroups ||
      []
    ).filter(
      (group) =>
        group.isAvailable !== false
    );
  }, [item]);

  const isCombo =
    item?.type === "COMBO";

  useEffect(() => {
    if (!isOpen || !item) {
      return;
    }

    setError("");
    setQuantity(1);

    const firstVariant =
      variants[0];

    setSelectedVariantId(
      firstVariant?.id || ""
    );

    const initialChoices = {};

    choiceGroups.forEach(
      (group) => {
        initialChoices[group.id] = [];
      }
    );

    setSelectedChoices(
      initialChoices
    );
  }, [
    isOpen,
    item,
    variants,
    choiceGroups,
  ]);

  if (!isOpen || !item) {
    return null;
  }

  const selectedVariant =
    variants.find(
      (variant) =>
        variant.id ===
        selectedVariantId
    );

  const unitPrice =
    Number(
      selectedVariant?.price || 0
    );

  /*
   * -----------------------------------------
   * OPTION HELPERS
   * -----------------------------------------
   *
   * Public menu API shape:
   *
   * {
   *   id: 275,
   *   variantId: 187,
   *   name: "Blue Mojito",
   *   variantName: "Regular"
   * }
   */

  const getOptionId = (option) => {
    return (
      option?.variantId ??
      option?.menuItemVariantId ??
      option?.id
    );
  };

  const getOptionName = (option) => {
    return (
      option?.name ||
      option?.menuItem?.name ||
      option?.menuItemVariant?.menuItem?.name ||
      "Option"
    );
  };

  const getOptionVariantName = (option) => {
    return (
      option?.variantName ||
      option?.variant?.name ||
      option?.menuItemVariant?.name ||
      ""
    );
  };

  /*
   * -----------------------------------------
   * GROUP LIMIT HELPERS
   * -----------------------------------------
   */

  const getMinSelections = (group) => {
    return Number(
      group?.minSelections ??
      group?.minChoices ??
      group?.min ??
      0
    );
  };

  const getMaxSelections = (group) => {
    return Number(
      group?.maxSelections ??
      group?.maxChoices ??
      group?.max ??
      1
    );
  };

  /*
   * -----------------------------------------
   * CHOICE SELECTION
   * -----------------------------------------
   */

  const handleChoiceChange = (
    group,
    optionId
  ) => {
    setError("");

    const current =
      selectedChoices[group.id] || [];

    const max =
      getMaxSelections(group);

    /*
     * Single-selection group.
     */

    if (max === 1) {
      setSelectedChoices(
        (previous) => ({
          ...previous,
          [group.id]: [
            optionId,
          ],
        })
      );

      return;
    }

    /*
     * Multiple-selection group.
     *
     * Duplicate IDs are intentionally
     * allowed, so the same mocktail can
     * be selected twice.
     */

    if (
      current.length >= max
    ) {
      return;
    }

    setSelectedChoices(
      (previous) => ({
        ...previous,
        [group.id]: [
          ...(previous[group.id] || []),
          optionId,
        ],
      })
    );
  };

  /*
   * Remove one occurrence.
   */

  const handleRemoveChoice = (
    groupId,
    optionId
  ) => {
    setError("");

    setSelectedChoices(
      (previous) => {
        const current =
          previous[groupId] || [];

        const index =
          current.indexOf(optionId);

        if (index === -1) {
          return previous;
        }

        const next = [
          ...current,
        ];

        next.splice(index, 1);

        return {
          ...previous,
          [groupId]: next,
        };
      }
    );
  };

  /*
   * -----------------------------------------
   * VALIDATE CHOICES
   * -----------------------------------------
   */

  const validateChoices = () => {
    for (const group of choiceGroups) {
      const selected =
        selectedChoices[group.id] || [];

      const min =
        getMinSelections(group);

      const max =
        getMaxSelections(group);

      if (
        selected.length < min
      ) {
        return `Please choose at least ${min} option${
          min === 1 ? "" : "s"
        } for ${group.name}.`;
      }

      if (
        selected.length > max
      ) {
        return `You can choose at most ${max} option${
          max === 1 ? "" : "s"
        } for ${group.name}.`;
      }
    }

    return null;
  };

  /*
   * -----------------------------------------
   * BUILD CHOICES FOR ORDER
   * -----------------------------------------
   */

  const buildChoices = () => {
    return choiceGroups
      .map((group) => {
        const optionIds =
          selectedChoices[group.id] || [];

        if (
          optionIds.length === 0
        ) {
          return null;
        }

        return {
          choiceGroupId:
            group.id,

          optionIds: [
            ...optionIds,
          ],
        };
      })
      .filter(Boolean);
  };

  /*
   * -----------------------------------------
   * BUILD CHOICE DISPLAY DETAILS
   * -----------------------------------------
   */

  const buildChoiceDetails = () => {
    return choiceGroups
      .map((group) => {
        const optionIds =
          selectedChoices[group.id] || [];

        if (
          optionIds.length === 0
        ) {
          return null;
        }

        const options =
          optionIds
            .map((optionId) => {
              const option =
                group.options?.find(
                  (candidate) =>
                    getOptionId(
                      candidate
                    ) === optionId
                );

              if (!option) {
                return null;
              }

              return {
                optionId,

                name:
                  getOptionName(
                    option
                  ),

                variantName:
                  getOptionVariantName(
                    option
                  ),
              };
            })
            .filter(Boolean);

        return {
          choiceGroupId:
            group.id,

          groupName:
            group.name,

          options,
        };
      })
      .filter(Boolean);
  };

  /*
   * -----------------------------------------
   * BUILD COMBO SNAPSHOT
   * -----------------------------------------
   *
   * Public API already gives us:
   *
   * comboItem.name
   * comboItem.variantName
   * comboItem.quantity
   * comboItem.servingLabel
   */

  const buildComboItems = () => {
    if (!isCombo) {
      return [];
    }

    return (
      item.comboItems || []
    ).map(
      (comboItem, index) => ({
        id:
          comboItem.id ??
          `${comboItem.variantId}-${index}`,

        itemName:
          comboItem.name ||
          "Item",

        variantName:
          comboItem.variantName ||
          "",

        quantity:
          Number(
            comboItem.quantity || 1
          ),

        servingLabel:
          comboItem.servingLabel ||
          null,
      })
    );
  };

  /*
   * -----------------------------------------
   * ADD TO CART
   * -----------------------------------------
   */

  const handleAddToCart = () => {
    setError("");

    if (!selectedVariant) {
      setError(
        "Please select an available option."
      );

      return;
    }

    const choiceError =
      validateChoices();

    if (choiceError) {
      setError(choiceError);
      return;
    }

    const choices =
      buildChoices();

    const choiceDetails =
      buildChoiceDetails();

    addToCart({
      itemId: item.id,

      itemName: item.name,

      itemType: item.type,

      variantId:
        selectedVariant.id,

      variantName:
        selectedVariant.name,

      unitPrice,

      quantity,

      choices,

      choiceDetails,

      comboItems:
        buildComboItems(),
    });

    onClose();
  };

  /*
   * -----------------------------------------
   * RENDER
   * -----------------------------------------
   */

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-white/10 bg-[#151515] shadow-2xl sm:max-w-2xl sm:rounded-2xl">

        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-white/10 bg-[#151515]/95 px-5 py-4 backdrop-blur sm:px-6">

          <div className="min-w-0">

            <p className="text-[10px] uppercase tracking-[0.25em] text-[#D92323]">
              {isCombo
                ? "Customize Combo"
                : "Choose Options"}
            </p>

            <h2 className="heading-font mt-1 truncate text-2xl uppercase tracking-wide text-white">
              {item.name}
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-4 rounded-md p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>

        </div>

        <div className="space-y-7 p-5 sm:p-6">

          {/* VARIANTS */}

          {variants.length > 1 && (
            <section>

              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Choose Variant
              </p>

              <div className="grid gap-2 sm:grid-cols-2">

                {variants.map(
                  (variant) => {
                    const active =
                      selectedVariantId ===
                      variant.id;

                    return (
                      <button
                        key={
                          variant.id
                        }
                        type="button"
                        onClick={() =>
                          setSelectedVariantId(
                            variant.id
                          )
                        }
                        className={`flex items-center justify-between rounded-lg border p-3 text-left transition ${
                          active
                            ? "border-[#D92323] bg-[#D92323]/10"
                            : "border-white/10 bg-black/10 hover:border-white/20"
                        }`}
                      >

                        <p
                          className={`text-sm font-medium ${
                            active
                              ? "text-white"
                              : "text-gray-400"
                          }`}
                        >
                          {variant.name ||
                            "Regular"}
                        </p>

                        <span className="heading-font text-lg text-[#D92323]">
                          ₹
                          {Number(
                            variant.price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </button>
                    );
                  }
                )}

              </div>

            </section>
          )}

          {/* FIXED COMBO CONTENT */}

          {isCombo &&
            item.comboItems?.length >
              0 && (
              <section>

                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Included In Combo
                </p>

                <div className="space-y-2 rounded-lg border border-white/10 bg-black/10 p-4">

                  {item.comboItems.map(
                    (comboItem, index) => (
                      <div
                        key={
                          comboItem.id ??
                          `${comboItem.variantId}-${index}`
                        }
                        className="flex items-start justify-between gap-4 text-sm"
                      >

                        <div className="min-w-0">

                          <p className="text-gray-300">
                            {comboItem.name ||
                              "Item"}
                          </p>

                          {comboItem.variantName &&
                            comboItem.variantName !==
                              "Regular" && (
                              <p className="text-xs text-gray-600">
                                {
                                  comboItem.variantName
                                }
                              </p>
                            )}

                        </div>

                        <div className="shrink-0 text-right">

                          <p className="text-gray-400">
                            ×
                            {Number(
                              comboItem.quantity ||
                                1
                            )}
                          </p>

                          {comboItem.servingLabel && (
                            <p className="text-[11px] text-gray-600">
                              {
                                comboItem.servingLabel
                              }
                            </p>
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>

              </section>
            )}

          {/* CHOICE GROUPS */}

          {choiceGroups.map(
            (group) => {
              const selected =
                selectedChoices[
                  group.id
                ] || [];

              const min =
                getMinSelections(group);

              const max =
                getMaxSelections(group);

              return (
                <section
                  key={group.id}
                >

                  <div className="mb-3 flex items-end justify-between gap-3">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                        {group.name}
                      </p>

                      <p className="mt-1 text-[11px] text-gray-600">
                        {min === max
                          ? `Choose ${min} ${
                              min === 1
                                ? "option"
                                : "options"
                            }`
                          : `Choose ${min}–${max}`}
                      </p>

                    </div>

                    <span
                      className={`text-xs ${
                        selected.length >=
                        min
                          ? "text-green-500"
                          : "text-gray-600"
                      }`}
                    >
                      {
                        selected.length
                      }
                      /
                      {max}
                    </span>

                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">

                    {group.options
                      ?.filter(
                        (option) =>
                          option?.isAvailable !==
                            false
                      )
                      .map(
                        (option) => {
                          const optionId =
                            getOptionId(
                              option
                            );

                          const count =
                            selected.filter(
                              (id) =>
                                id ===
                                optionId
                            ).length;

                          const optionName =
                            getOptionName(
                              option
                            );

                          const variantName =
                            getOptionVariantName(
                              option
                            );

                          const disabled =
                            selected.length >=
                              max &&
                            count === 0;

                          return (
                            <div
                              key={
                                optionId
                              }
                              className={`flex items-center justify-between gap-3 rounded-lg border p-3 transition ${
                                count > 0
                                  ? "border-[#D92323] bg-[#D92323]/10"
                                  : "border-white/10 bg-black/10"
                              }`}
                            >

                              <div className="min-w-0">

                                <p
                                  className={`text-sm ${
                                    count > 0
                                      ? "text-white"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {
                                    optionName
                                  }
                                </p>

                                {variantName &&
                                  variantName !==
                                    "Regular" && (
                                    <p className="text-[11px] text-gray-600">
                                      {
                                        variantName
                                      }
                                    </p>
                                  )}

                              </div>

                              <div className="flex shrink-0 items-center gap-1">

                                <button
                                  type="button"
                                  disabled={
                                    count ===
                                    0
                                  }
                                  onClick={() =>
                                    handleRemoveChoice(
                                      group.id,
                                      optionId
                                    )
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-gray-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  <Minus
                                    size={
                                      13
                                    }
                                  />
                                </button>

                                <span className="flex h-7 min-w-7 items-center justify-center text-xs text-white">
                                  {count}
                                </span>

                                <button
                                  type="button"
                                  disabled={
                                    disabled
                                  }
                                  onClick={() =>
                                    handleChoiceChange(
                                      group,
                                      optionId
                                    )
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-gray-500 transition hover:border-[#D92323] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  <Plus
                                    size={
                                      13
                                    }
                                  />
                                </button>

                              </div>

                            </div>
                          );
                        }
                      )}

                  </div>

                </section>
              );
            }
          )}

          {/* QUANTITY */}

          <section>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Quantity
            </p>

            <div className="flex items-center">

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    (value) =>
                      Math.max(
                        1,
                        value - 1
                      )
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-l-md border border-white/10 text-gray-500 transition hover:text-white"
              >
                <Minus size={15} />
              </button>

              <span className="flex h-10 min-w-12 items-center justify-center border-y border-white/10 bg-black/10 text-sm text-white">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    (value) =>
                      Math.min(
                        100,
                        value + 1
                      )
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-r-md border border-white/10 text-gray-500 transition hover:text-white"
              >
                <Plus size={15} />
              </button>

            </div>

          </section>

          {/* ERROR */}

          {error && (
            <div className="rounded-lg border border-[#D92323]/40 bg-[#D92323]/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* ACTIONS */}

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row">

            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-white/10 px-5 py-3 text-sm font-bold uppercase tracking-wide text-gray-400 transition hover:border-white/20 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                handleAddToCart
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#D92323] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#ef2929]"
            >
              Add to Cart

              <span className="text-white/60">
                ·
              </span>

              ₹
              {(
                unitPrice *
                quantity
              ).toLocaleString(
                "en-IN"
              )}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default AddToCartModal;