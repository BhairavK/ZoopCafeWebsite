import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api"
).replace(/\/$/, "");

/* -------------------------------------------------------------------------- */
/* API                                                                        */
/* -------------------------------------------------------------------------- */

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("zoop_token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
};

/* -------------------------------------------------------------------------- */
/* FORM                                                                       */
/* -------------------------------------------------------------------------- */

const getInitialFormState = () => ({
  categoryId: "",
  name: "",
  description: "",
  imageUrl: "",
  dietaryType: "VEG",
  isPopular: false,
  isAvailable: true,
  displayOrder: 0,

  variants: [
    {
      name: "Regular",
      price: "",
      isAvailable: true,
      displayOrder: 0,
    },
  ],

  comboItems: [],

  choiceGroups: [],
});

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const getPrice = (price) => {
  const value = Number(price);

  if (!Number.isFinite(value)) {
    return "—";
  }

  return `₹${value.toFixed(0)}`;
};

const getChoiceRangeText = (group) => {
  const min = Number(group?.minSelections ?? 0);
  const max = Number(group?.maxSelections ?? 0);

  if (min === max) {
    return `Choose ${min}`;
  }

  return `Choose ${min}–${max}`;
};

const getChoiceTypeLabel = (type) => {
  switch (type) {
    case "MOCKTAIL":
      return "Mocktail";

    case "SOFT_DRINK":
      return "Soft Drink";

    default:
      return "Custom";
  }
};

const getDietaryLabel = (type) => {
  switch (type) {
    case "NON_VEG":
      return "NON-VEG";

    case "EGG":
      return "EGG";

    default:
      return "VEG";
  }
};

const getDietaryClasses = (type) => {
  switch (type) {
    case "NON_VEG":
      return {
        badge:
          "border-red-500/30 bg-red-500/10 text-red-400",
        dot: "bg-red-500",
        soft:
          "border-red-900/40 bg-red-950/20",
      };

    case "EGG":
      return {
        badge:
          "border-amber-500/30 bg-amber-500/10 text-amber-400",
        dot: "bg-amber-400",
        soft:
          "border-amber-900/40 bg-amber-950/20",
      };

    default:
      return {
        badge:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        dot: "bg-emerald-500",
        soft:
          "border-emerald-900/40 bg-emerald-950/20",
      };
  }
};

const getChoiceTypeClasses = (type) => {
  switch (type) {
    case "MOCKTAIL":
      return {
        badge:
          "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
        icon: "🥤",
      };

    case "SOFT_DRINK":
      return {
        badge:
          "border-sky-500/30 bg-sky-500/10 text-sky-300",
        icon: "🥤",
      };

    default:
      return {
        badge:
          "border-violet-500/30 bg-violet-500/10 text-violet-300",
        icon: "⚙",
      };
  }
};

/*
 * Important:
 *
 * variantName is the underlying menu variant.
 * servingLabel is the portion promised by the combo.
 *
 * Therefore:
 *
 * Potato Pops / 20 / 10 Pieces
 * =>
 * Potato Pops · 10 Pieces
 *
 * French Fries / Regular
 * =>
 * French Fries
 */
const getComboItemLabel = (item) => {
  if (item?.servingLabel) {
    return `${item.name} · ${item.servingLabel}`;
  }

  if (
    item?.variantName &&
    item.variantName !== "Regular"
  ) {
    return `${item.name} · ${item.variantName}`;
  }

  return item?.name || "Unknown item";
};

const getQuantityLabel = (quantity) => {
  const value = Number(quantity);

  if (!Number.isFinite(value) || value <= 1) {
    return "";
  }

  return `${value}×`;
};

const inferChoiceType = (name) => {
  const value = String(name || "").toLowerCase();

  if (value.includes("mocktail")) {
    return "MOCKTAIL";
  }

  if (
    value.includes("soft drink") ||
    value.includes("softdrink")
  ) {
    return "SOFT_DRINK";
  }

  return "CUSTOM";
};

/* -------------------------------------------------------------------------- */
/* MAIN                                                                       */
/* -------------------------------------------------------------------------- */

export default function AdminCombos() {
  /* ---------------------------------------------------------------------- */
  /* DATA                                                                    */
  /* ---------------------------------------------------------------------- */

  const [combos, setCombos] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [availableMenuItems, setAvailableMenuItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------------------------------------------------------------- */
  /* FILTERS                                                                 */
  /* ---------------------------------------------------------------------- */

  const [search, setSearch] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState("ALL");

  /* ---------------------------------------------------------------------- */
  /* EDITOR                                                                  */
  /* ---------------------------------------------------------------------- */

  const [showEditor, setShowEditor] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [form, setForm] = useState(getInitialFormState());

  /* ---------------------------------------------------------------------- */
  /* DETAILS                                                                  */
  /* ---------------------------------------------------------------------- */

  const [detailsCombo, setDetailsCombo] = useState(null);

  /* ---------------------------------------------------------------------- */
  /* PICKERS                                                                  */
  /* ---------------------------------------------------------------------- */

  const [itemPickerIndex, setItemPickerIndex] =
    useState(null);

  const [choicePickerIndex, setChoicePickerIndex] =
    useState(null);

  const [pickerSearch, setPickerSearch] =
    useState("");

  /* ---------------------------------------------------------------------- */
  /* SUBMIT                                                                    */
  /* ---------------------------------------------------------------------- */

  const [submitting, setSubmitting] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* LOAD                                                                      */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        combosResponse,
        categoriesResponse,
        availableItemsResponse,
      ] = await Promise.all([
        apiRequest("/admin/combos"),
        apiRequest("/admin/menu/categories"),

        /*
         * IMPORTANT:
         *
         * This is the dedicated endpoint.
         *
         * It includes combo-exclusive products such as
         * mocktails that are intentionally hidden from
         * the public menu endpoint.
         */
        apiRequest("/admin/combos/available-items"),
      ]);

      setCombos(combosResponse.data || []);

      setMenuCategories(
        categoriesResponse.data || []
      );

      setAvailableMenuItems(
        availableItemsResponse.data || []
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to load combo management data."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* VARIANT MAP                                                              */
  /* ---------------------------------------------------------------------- */

  const variantMap = useMemo(() => {
    const map = new Map();

    availableMenuItems.forEach((item) => {
      map.set(Number(item.variantId), item);
    });

    return map;
  }, [availableMenuItems]);

  /* ---------------------------------------------------------------------- */
  /* FILTERED COMBOS                                                         */
  /* ---------------------------------------------------------------------- */

  const filteredCombos = useMemo(() => {
    const query = search.trim().toLowerCase();

    return combos.filter((combo) => {
      const matchesSearch =
        !query ||
        combo.name
          ?.toLowerCase()
          .includes(query) ||
        combo.description
          ?.toLowerCase()
          .includes(query);

      const matchesDietary =
        dietaryFilter === "ALL" ||
        combo.dietaryType === dietaryFilter;

      return matchesSearch && matchesDietary;
    });
  }, [combos, search, dietaryFilter]);

  /* ---------------------------------------------------------------------- */
  /* CREATE                                                                   */
  /* ---------------------------------------------------------------------- */

  const handleCreateCombo = () => {
    setEditingCombo(null);
    setForm(getInitialFormState());
    setShowEditor(true);
  };

  /* ---------------------------------------------------------------------- */
  /* EDIT                                                                     */
  /* ---------------------------------------------------------------------- */

  const handleEditCombo = async (combo) => {
    try {
      setSubmitting(true);

      const response = await apiRequest(
        `/admin/combos/${combo.id}`
      );

      const fullCombo = response.data;

      setEditingCombo(fullCombo);

      setForm({
        categoryId:
          fullCombo.categoryId || "",

        name:
          fullCombo.name || "",

        description:
          fullCombo.description || "",

        imageUrl:
          fullCombo.imageUrl || "",

        dietaryType:
          fullCombo.dietaryType || "VEG",

        isPopular:
          Boolean(fullCombo.isPopular),

        isAvailable:
          Boolean(fullCombo.isAvailable),

        displayOrder:
          Number(fullCombo.displayOrder || 0),

        variants:
          fullCombo.variants?.map(
            (variant, index) => ({
              name:
                variant.name || "",

              price:
                variant.price ?? "",

              isAvailable:
                variant.isAvailable ?? true,

              displayOrder:
                variant.displayOrder ?? index,
            })
          ) || [],

        comboItems:
          fullCombo.comboItems?.map(
            (item) => ({
              variantId:
                Number(item.variantId),

              quantity:
                Number(item.quantity) || 1,

              servingLabel:
                item.servingLabel || "",
            })
          ) || [],

        choiceGroups:
          fullCombo.choiceGroups?.map(
            (group, index) => ({
              name:
                group.name || "",

              type:
                group.type ||
                inferChoiceType(group.name),

              minSelections:
                Number(
                  group.minSelections ?? 1
                ),

              maxSelections:
                Number(
                  group.maxSelections ?? 1
                ),

              displayOrder:
                group.displayOrder ?? index,

              options:
                group.options?.map(
                  (option, optionIndex) => ({
                    variantId:
                      Number(option.variantId),

                    displayOrder:
                      option.displayOrder ??
                      optionIndex,
                  })
                ) || [],
            })
          ) || [],
      });

      setShowEditor(true);
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Failed to load combo."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* CLOSE EDITOR                                                             */
  /* ---------------------------------------------------------------------- */

  const closeEditor = () => {
    if (submitting) {
      return;
    }

    setShowEditor(false);
    setEditingCombo(null);
    setForm(getInitialFormState());
    setItemPickerIndex(null);
    setChoicePickerIndex(null);
    setPickerSearch("");
  };

  /* ---------------------------------------------------------------------- */
  /* FORM CHANGE                                                              */
  /* ---------------------------------------------------------------------- */

  const handleFormChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* ---------------------------------------------------------------------- */
  /* COMBO ITEMS                                                              */
  /* ---------------------------------------------------------------------- */

  const addComboItem = () => {
    setForm((previous) => ({
      ...previous,

      comboItems: [
        ...previous.comboItems,

        {
          variantId: "",
          quantity: 1,
          servingLabel: "",
        },
      ],
    }));
  };

  const removeComboItem = (index) => {
    setForm((previous) => ({
      ...previous,

      comboItems:
        previous.comboItems.filter(
          (_, currentIndex) =>
            currentIndex !== index
        ),
    }));
  };

  const updateComboItem = (
    index,
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,

      comboItems:
        previous.comboItems.map(
          (item, currentIndex) =>
            currentIndex === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        ),
    }));
  };

  /* ---------------------------------------------------------------------- */
  /* VARIANTS                                                                 */
  /* ---------------------------------------------------------------------- */

  const addVariant = () => {
    setForm((previous) => ({
      ...previous,

      variants: [
        ...previous.variants,

        {
          name: "",
          price: "",
          isAvailable: true,
          displayOrder:
            previous.variants.length,
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    setForm((previous) => ({
      ...previous,

      variants:
        previous.variants.filter(
          (_, currentIndex) =>
            currentIndex !== index
        ),
    }));
  };

  const updateVariant = (
    index,
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,

      variants:
        previous.variants.map(
          (variant, currentIndex) =>
            currentIndex === index
              ? {
                  ...variant,
                  [field]: value,
                }
              : variant
        ),
    }));
  };

  /* ---------------------------------------------------------------------- */
  /* CHOICE GROUPS                                                            */
  /* ---------------------------------------------------------------------- */

  const addChoiceGroup = () => {
    setForm((previous) => ({
      ...previous,

      choiceGroups: [
        ...previous.choiceGroups,

        {
          name: "",
          type: "CUSTOM",
          minSelections: 1,
          maxSelections: 1,
          displayOrder:
            previous.choiceGroups.length,
          options: [],
        },
      ],
    }));
  };

  const removeChoiceGroup = (index) => {
    setForm((previous) => ({
      ...previous,

      choiceGroups:
        previous.choiceGroups.filter(
          (_, currentIndex) =>
            currentIndex !== index
        ),
    }));
  };

  const updateChoiceGroup = (
    index,
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,

      choiceGroups:
        previous.choiceGroups.map(
          (group, currentIndex) =>
            currentIndex === index
              ? {
                  ...group,
                  [field]: value,
                }
              : group
        ),
    }));
  };

  /* ---------------------------------------------------------------------- */
  /* CHOICE PICKER                                                            */
  /* ---------------------------------------------------------------------- */

  const toggleChoiceOption = (
    groupIndex,
    variantId
  ) => {
    const id = Number(variantId);

    setForm((previous) => ({
      ...previous,

      choiceGroups:
        previous.choiceGroups.map(
          (group, index) => {
            if (
              index !== groupIndex
            ) {
              return group;
            }

            const exists =
              group.options.some(
                (option) =>
                  Number(
                    option.variantId
                  ) === id
              );

            if (exists) {
              return {
                ...group,

                options:
                  group.options.filter(
                    (option) =>
                      Number(
                        option.variantId
                      ) !== id
                  ),
              };
            }

            return {
              ...group,

              options: [
                ...group.options,

                {
                  variantId: id,
                  displayOrder:
                    group.options.length,
                },
              ],
            };
          }
        ),
    }));
  };

  /* ---------------------------------------------------------------------- */
  /* PICKER ITEMS                                                             */
  /* ---------------------------------------------------------------------- */

  const pickerItems = useMemo(() => {
    const query =
      pickerSearch.trim().toLowerCase();

    let items = availableMenuItems;

    if (choicePickerIndex !== null) {
      const group =
        form.choiceGroups[
          choicePickerIndex
        ];

      if (group?.type === "MOCKTAIL") {
        items = items.filter(
          (item) =>
            item.categoryName
              ?.toLowerCase()
              .includes("mocktail") ||
            item.name
              ?.toLowerCase()
              .includes("mocktail") ||
            item.isComboExclusive
        );
      }

      if (group?.type === "SOFT_DRINK") {
        items = items.filter(
          (item) =>
            item.categoryName
              ?.toLowerCase()
              .includes("soft") ||
            item.name
              ?.toLowerCase()
              .includes("soft")
        );
      }
    }

    if (!query) {
      return items;
    }

    return items.filter((item) => {
      return (
        item.name
          ?.toLowerCase()
          .includes(query) ||
        item.variantName
          ?.toLowerCase()
          .includes(query) ||
        item.categoryName
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [
    availableMenuItems,
    pickerSearch,
    choicePickerIndex,
    form.choiceGroups,
  ]);

  /* ---------------------------------------------------------------------- */
  /* SUBMIT                                                                   */
  /* ---------------------------------------------------------------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        categoryId:
          Number(form.categoryId),

        name:
          form.name.trim(),

        description:
          form.description.trim() ||
          null,

        imageUrl:
          form.imageUrl.trim() ||
          null,

        dietaryType:
          form.dietaryType,

        isPopular:
          Boolean(form.isPopular),

        isAvailable:
          Boolean(form.isAvailable),

        displayOrder:
          Number(form.displayOrder) || 0,

        variants:
          form.variants.map(
            (variant, index) => ({
              name:
                variant.name.trim(),

              price:
                Number(variant.price),

              isAvailable:
                Boolean(
                  variant.isAvailable
                ),

              displayOrder:
                index,
            })
          ),

        comboItems:
          form.comboItems.map(
            (item) => ({
              variantId:
                Number(item.variantId),

              quantity:
                Number(item.quantity) || 1,

              servingLabel:
                item.servingLabel?.trim() ||
                null,
            })
          ),

        choiceGroups:
          form.choiceGroups.map(
            (group, groupIndex) => ({
              name:
                group.name.trim(),

              type:
                group.type || "CUSTOM",

              minSelections:
                Number(
                  group.minSelections
                ),

              maxSelections:
                Number(
                  group.maxSelections
                ),

              displayOrder:
                groupIndex,

              options:
                group.options.map(
                  (
                    option,
                    optionIndex
                  ) => ({
                    variantId:
                      Number(
                        option.variantId
                      ),

                    displayOrder:
                      optionIndex,
                  })
                ),
            })
          ),
      };

      /* ---------------------------------------------------------------- */
      /* VALIDATION                                                        */
      /* ---------------------------------------------------------------- */

      if (!payload.categoryId) {
        throw new Error(
          "Please select a category."
        );
      }

      if (!payload.name) {
        throw new Error(
          "Combo name is required."
        );
      }

      if (
        payload.variants.length === 0
      ) {
        throw new Error(
          "Add at least one pricing variant."
        );
      }

      for (const variant of payload.variants) {
        if (!variant.name) {
          throw new Error(
            "Every pricing variant needs a name."
          );
        }

        if (
          !Number.isFinite(
            variant.price
          ) ||
          variant.price < 0
        ) {
          throw new Error(
            "Every pricing variant needs a valid price."
          );
        }
      }

      for (const item of payload.comboItems) {
        if (!item.variantId) {
          throw new Error(
            "Please select all combo items."
          );
        }

        if (item.quantity < 1) {
          throw new Error(
            "Combo item quantity must be at least 1."
          );
        }
      }

      for (const group of payload.choiceGroups) {
        if (!group.name) {
          throw new Error(
            "Every choice group needs a name."
          );
        }

        if (
          group.minSelections < 0 ||
          group.maxSelections < 1 ||
          group.minSelections >
            group.maxSelections
        ) {
          throw new Error(
            `Invalid selection range for "${group.name}".`
          );
        }

        if (group.options.length === 0) {
          throw new Error(
            `Add at least one option to "${group.name}".`
          );
        }

        const ids =
          group.options.map(
            (option) =>
              option.variantId
          );

        if (
          new Set(ids).size !==
          ids.length
        ) {
          throw new Error(
            `Duplicate options are not allowed in "${group.name}".`
          );
        }
      }

      /* ---------------------------------------------------------------- */
      /* API                                                                */
      /* ---------------------------------------------------------------- */

      if (editingCombo) {
        await apiRequest(
          `/admin/combos/${editingCombo.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
      } else {
        await apiRequest(
          "/admin/combos",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
      }

      await loadData();

      closeEditor();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Failed to save combo."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* AVAILABILITY                                                             */
  /* ---------------------------------------------------------------------- */

  const handleToggleAvailability = async (
    combo
  ) => {
    try {
      await apiRequest(
        `/admin/combos/${combo.id}`,
        {
          method: "PUT",

          body: JSON.stringify({
            isAvailable:
              !combo.isAvailable,
          }),
        }
      );

      await loadData();
    } catch (error) {
      alert(
        error.message ||
          "Failed to update availability."
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* DELETE                                                                   */
  /* ---------------------------------------------------------------------- */

  const handleDeleteCombo = async (
    combo
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${combo.name}"? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(
        `/admin/combos/${combo.id}`,
        {
          method: "DELETE",
        }
      );

      await loadData();
    } catch (error) {
      alert(
        error.message ||
          "Failed to delete combo."
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-black p-4 text-zinc-100 sm:p-6 lg:p-8">
      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                              */}
      {/* ------------------------------------------------------------------ */}

      <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-xl sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                Zoop Cafe
              </p>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Combo Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Build meal combinations, manage customer
              choices, pricing and availability.
            </p>
          </div>

          <button
            onClick={handleCreateCombo}
            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-500 active:scale-[0.98]"
          >
            + Create Combo
          </button>
        </div>

        {/* FILTERS */}

        <div className="mt-6 flex flex-col gap-3 border-t border-zinc-900 pt-5 lg:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search combos..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-red-600"
            />
          </div>

          <div className="flex rounded-xl border border-zinc-800 bg-black p-1">
            {[
              ["ALL", "All"],
              ["VEG", "Veg"],
              ["NON_VEG", "Non-Veg"],
              ["EGG", "Egg"],
            ].map(([value, label]) => {
              const active =
                dietaryFilter === value;

              const colors =
                getDietaryClasses(
                  value
                );

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setDietaryFilter(
                      value
                    )
                  }
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? value === "ALL"
                        ? "bg-zinc-800 text-white"
                        : colors.badge
                      : "text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ERROR                                                               */}
      {/* ------------------------------------------------------------------ */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-900/70 bg-red-950/20 px-4 py-4 text-sm text-red-400">
          <span>!</span>
          <span>{error}</span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* LOADING                                                             */}
      {/* ------------------------------------------------------------------ */}

      {loading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-[330px] animate-pulse rounded-2xl border border-zinc-900 bg-zinc-950"
              />
            )
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* EMPTY                                                               */}
      {/* ------------------------------------------------------------------ */}

      {!loading &&
        filteredCombos.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 py-20 text-center">
            <div className="mb-4 text-4xl">
              🍱
            </div>

            <h3 className="text-lg font-bold text-zinc-300">
              No combos found
            </h3>

            <p className="mt-2 text-sm text-zinc-600">
              Try changing your search or filter.
            </p>
          </div>
        )}

      {/* ------------------------------------------------------------------ */}
      {/* GRID                                                                */}
      {/* ------------------------------------------------------------------ */}

      {!loading &&
        filteredCombos.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCombos.map(
              (combo) => (
                <ComboCard
                  key={combo.id}
                  combo={combo}
                  onView={() =>
                    setDetailsCombo(combo)
                  }
                  onEdit={
                    handleEditCombo
                  }
                  onToggle={
                    handleToggleAvailability
                  }
                  onDelete={
                    handleDeleteCombo
                  }
                />
              )
            )}
          </div>
        )}

      {/* ------------------------------------------------------------------ */}
      {/* DETAILS MODAL                                                       */}
      {/* ------------------------------------------------------------------ */}

      {detailsCombo && (
        <ComboDetailsModal
          combo={detailsCombo}
          variantMap={variantMap}
          onClose={() =>
            setDetailsCombo(null)
          }
          onEdit={() => {
            setDetailsCombo(null);
            handleEditCombo(
              detailsCombo
            );
          }}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* EDITOR                                                              */}
      {/* ------------------------------------------------------------------ */}

      {showEditor && (
        <ComboEditorModal
          form={form}
          editingCombo={editingCombo}
          categories={menuCategories}
          variantMap={variantMap}
          submitting={submitting}
          onClose={closeEditor}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onAddItem={addComboItem}
          onRemoveItem={removeComboItem}
          onUpdateItem={
            updateComboItem
          }
          onOpenItemPicker={(index) => {
            setPickerSearch("");
            setItemPickerIndex(index);
          }}
          onAddChoiceGroup={
            addChoiceGroup
          }
          onRemoveChoiceGroup={
            removeChoiceGroup
          }
          onUpdateChoiceGroup={
            updateChoiceGroup
          }
          onOpenChoicePicker={(index) => {
            setPickerSearch("");
            setChoicePickerIndex(index);
          }}
          onAddVariant={addVariant}
          onRemoveVariant={removeVariant}
          onUpdateVariant={updateVariant}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ITEM PICKER                                                         */}
      {/* ------------------------------------------------------------------ */}

      {itemPickerIndex !== null && (
        <ItemPickerModal
          items={pickerItems}
          selectedId={
            form.comboItems[
              itemPickerIndex
            ]?.variantId
          }
          search={pickerSearch}
          setSearch={setPickerSearch}
          onClose={() =>
            setItemPickerIndex(null)
          }
          onSelect={(variantId) => {
            updateComboItem(
              itemPickerIndex,
              "variantId",
              Number(variantId)
            );

            setItemPickerIndex(null);
            setPickerSearch("");
          }}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* CHOICE PICKER                                                       */}
      {/* ------------------------------------------------------------------ */}

      {choicePickerIndex !== null && (
        <ChoicePickerModal
          group={
            form.choiceGroups[
              choicePickerIndex
            ]
          }
          items={pickerItems}
          selectedIds={
            form.choiceGroups[
              choicePickerIndex
            ]?.options?.map(
              (option) =>
                Number(option.variantId)
            ) || []
          }
          search={pickerSearch}
          setSearch={setPickerSearch}
          onClose={() => {
            setChoicePickerIndex(null);
            setPickerSearch("");
          }}
          onToggle={(variantId) =>
            toggleChoiceOption(
              choicePickerIndex,
              variantId
            )
          }
        />
      )}
    </div>
  );
}

/* ========================================================================== */
/* COMBO CARD                                                                 */
/* ========================================================================== */

function ComboCard({
  combo,
  onView,
  onEdit,
  onToggle,
  onDelete,
}) {
  const dietary =
    getDietaryClasses(
      combo.dietaryType
    );

  const fixedItems =
    combo.comboItems || [];

  const choiceGroups =
    combo.choiceGroups || [];

  const previewItems =
    fixedItems.slice(0, 4);

  const remainingItems =
    Math.max(
      fixedItems.length -
        previewItems.length,
      0
    );

  const primaryPrice =
    combo.variants?.[0]?.price;

  return (
    <div className="group flex min-h-[355px] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-2xl">
      {/* TOP ACCENT */}

      <div
        className={`h-1 w-full ${
          combo.dietaryType ===
          "NON_VEG"
            ? "bg-red-600"
            : combo.dietaryType ===
              "EGG"
            ? "bg-amber-400"
            : "bg-emerald-500"
        }`}
      />

      <div className="flex flex-1 flex-col p-5">
        {/* HEADER */}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${dietary.badge}`}
              >
                <span
                  className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${dietary.dot}`}
                />

                {getDietaryLabel(
                  combo.dietaryType
                )}
              </span>

              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  combo.isAvailable
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-zinc-700 bg-zinc-900 text-zinc-500"
                }`}
              >
                {combo.isAvailable
                  ? "Available"
                  : "Unavailable"}
              </span>
            </div>

            <h2 className="line-clamp-2 text-lg font-bold leading-6 text-white">
              {combo.name}
            </h2>

            {combo.description && (
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-600">
                {combo.description}
              </p>
            )}
          </div>

          <div className="shrink-0 rounded-xl border border-zinc-800 bg-black px-3 py-2 text-right">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
              From
            </p>

            <p className="text-lg font-bold text-red-400">
              {getPrice(
                primaryPrice
              )}
            </p>
          </div>
        </div>

        {/* ITEMS */}

        <div className="mt-5 flex-1">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              Included
            </p>

            <span className="text-[10px] text-zinc-700">
              {fixedItems.length} items
            </span>
          </div>

          {previewItems.length > 0 ? (
            <div className="space-y-1.5">
              {previewItems.map(
                (item, index) => (
                  <div
                    key={`${item.variantId}-${index}`}
                    className="flex items-center gap-2 rounded-lg bg-black/70 px-2.5 py-2"
                  >
                    {getQuantityLabel(
                      item.quantity
                    ) && (
                      <span className="shrink-0 text-[10px] font-bold text-red-400">
                        {getQuantityLabel(
                          item.quantity
                        )}
                      </span>
                    )}

                    <span className="min-w-0 truncate text-xs text-zinc-400">
                      {getComboItemLabel(
                        item
                      )}
                    </span>
                  </div>
                )
              )}

              {remainingItems > 0 && (
                <button
                  type="button"
                  onClick={onView}
                  className="px-2 text-xs font-semibold text-red-400 hover:text-red-300"
                >
                  + {remainingItems} more
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-700">
              No fixed items
            </p>
          )}
        </div>

        {/* CHOICES */}

        {choiceGroups.length > 0 && (
          <div className="mt-5 border-t border-zinc-900 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                Customer choices
              </p>

              <span className="text-[10px] text-zinc-700">
                {choiceGroups.length} group
                {choiceGroups.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {choiceGroups.map(
                (group, index) => {
                  const type =
                    getChoiceTypeClasses(
                      group.type
                    );

                  return (
                    <span
                      key={
                        group.id ||
                        index
                      }
                      className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold ${type.badge}`}
                    >
                      {type.icon}{" "}
                      {getChoiceTypeLabel(
                        group.type
                      )}{" "}
                      ×{" "}
                      {group.minSelections ===
                      group.maxSelections
                        ? group.minSelections
                        : `${group.minSelections}-${group.maxSelections}`}
                    </span>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* ACTIONS */}

        <div className="mt-5 flex gap-2 border-t border-zinc-900 pt-4">
          <button
            type="button"
            onClick={onView}
            className="flex-1 rounded-lg border border-zinc-800 bg-black px-3 py-2.5 text-xs font-semibold text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200"
          >
            View
          </button>

          <button
            type="button"
            onClick={() =>
              onToggle(combo)
            }
            className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
              combo.isAvailable
                ? "border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15"
                : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15"
            }`}
          >
            {combo.isAvailable
              ? "Disable"
              : "Enable"}
          </button>

          <button
            type="button"
            onClick={() =>
              onEdit(combo)
            }
            className="rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-500"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(combo)
            }
            className="rounded-lg border border-red-900/50 px-3 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-950/30"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* DETAILS MODAL                                                              */
/* ========================================================================== */

function ComboDetailsModal({
  combo,
  variantMap,
  onClose,
  onEdit,
}) {
  const dietary =
    getDietaryClasses(
      combo.dietaryType
    );

  return (
    <ModalShell
      onClose={onClose}
      size="max-w-3xl"
    >
      <div className="border-b border-zinc-800 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${dietary.badge}`}
              >
                {getDietaryLabel(
                  combo.dietaryType
                )}
              </span>

              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  combo.isAvailable
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-zinc-700 bg-zinc-900 text-zinc-500"
                }`}
              >
                {combo.isAvailable
                  ? "Available"
                  : "Unavailable"}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white sm:text-2xl">
              {combo.name}
            </h2>

            {combo.description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                {combo.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xl text-zinc-500 transition hover:bg-zinc-900 hover:text-zinc-200"
          >
            ×
          </button>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-5 sm:p-6">
        {/* FIXED ITEMS */}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-zinc-200">
                Included Items
              </h3>

              <p className="mt-1 text-xs text-zinc-600">
                Automatically included in every order.
              </p>
            </div>

            <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold text-zinc-500">
              {combo.comboItems?.length ||
                0}{" "}
              items
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {(combo.comboItems || []).map(
              (item, index) => {
                const quantity =
                  Number(
                    item.quantity
                  ) || 1;

                return (
                  <div
                    key={`${item.variantId}-${index}`}
                    className="rounded-xl border border-zinc-800 bg-black p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-300">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                          {item.servingLabel ||
                            (item.variantName !==
                              "Regular"
                              ? item.variantName
                              : "Standard serving")}
                        </p>
                      </div>

                      {quantity > 1 && (
                        <span className="shrink-0 rounded-md bg-red-950/30 px-2 py-1 text-[10px] font-bold text-red-400">
                          ×{quantity}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* CHOICES */}

        {combo.choiceGroups?.length > 0 && (
          <section className="mt-7 border-t border-zinc-900 pt-7">
            <div className="mb-4">
              <h3 className="font-bold text-zinc-200">
                Customer Choices
              </h3>

              <p className="mt-1 text-xs text-zinc-600">
                Options available when customers add this combo.
              </p>
            </div>

            <div className="space-y-3">
              {combo.choiceGroups.map(
                (group, index) => {
                  const type =
                    getChoiceTypeClasses(
                      group.type
                    );

                  return (
                    <div
                      key={
                        group.id ||
                        index
                      }
                      className="rounded-xl border border-zinc-800 bg-black p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-zinc-300">
                              {group.name ||
                                getChoiceTypeLabel(
                                  group.type
                                )}
                            </h4>

                            <span
                              className={`rounded-md border px-2 py-1 text-[9px] font-bold uppercase ${type.badge}`}
                            >
                              {type.icon}{" "}
                              {getChoiceTypeLabel(
                                group.type
                              )}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-zinc-600">
                            {getChoiceRangeText(
                              group
                            )}
                          </p>
                        </div>

                        <span className="text-xs text-zinc-600">
                          {group.options
                            ?.length || 0}{" "}
                          options
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(group.options || []).map(
                          (option, optionIndex) => {
                            const item =
                              variantMap.get(
                                Number(
                                  option.variantId
                                )
                              );

                            return (
                              <span
                                key={
                                  option.id ||
                                  `${option.variantId}-${optionIndex}`
                                }
                                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400"
                              >
                                {item?.name ||
                                  option.name ||
                                  "Unknown option"}

                                {item?.variantName &&
                                  item.variantName !==
                                    "Regular" && (
                                    <span className="ml-1 text-zinc-700">
                                      ·{" "}
                                      {
                                        item.variantName
                                      }
                                    </span>
                                  )}
                              </span>
                            );
                          }
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        )}

        {/* PRICING */}

        <section className="mt-7 border-t border-zinc-900 pt-7">
          <h3 className="mb-4 font-bold text-zinc-200">
            Pricing
          </h3>

          <div className="grid gap-2 sm:grid-cols-2">
            {(combo.variants || []).map(
              (variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black p-4"
                >
                  <span className="text-sm text-zinc-500">
                    {variant.name}
                  </span>

                  <span className="text-lg font-bold text-red-400">
                    {getPrice(
                      variant.price
                    )}
                  </span>
                </div>
              )
            )}
          </div>
        </section>
      </div>

      <div className="flex justify-end gap-2 border-t border-zinc-800 p-5 sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-400 hover:bg-zinc-800"
        >
          Close
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-500"
        >
          Edit Combo
        </button>
      </div>
    </ModalShell>
  );
}

/* ========================================================================== */
/* EDITOR MODAL                                                               */
/* ========================================================================== */

function ComboEditorModal({
  form,
  editingCombo,
  categories,
  variantMap,
  submitting,
  onClose,
  onChange,
  onSubmit,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onOpenItemPicker,
  onAddChoiceGroup,
  onRemoveChoiceGroup,
  onUpdateChoiceGroup,
  onOpenChoicePicker,
  onAddVariant,
  onRemoveVariant,
  onUpdateVariant,
}) {
  const dietary =
    getDietaryClasses(
      form.dietaryType
    );

  return (
    <ModalShell
      onClose={onClose}
      size="max-w-5xl"
    >
      <div className="border-b border-zinc-800 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
              Combo Builder
            </p>

            <h2 className="text-xl font-bold text-white">
              {editingCombo
                ? "Edit Combo"
                : "Create Combo"}
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              Configure the combo and everything customers can select.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xl text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
          >
            ×
          </button>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="max-h-[calc(100vh-9rem)] overflow-y-auto p-5 sm:p-6"
      >
        {/* BASIC */}

        <section>
          <SectionHeader
            title="Basic Information"
            description="Main information displayed for the combo."
          />

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Combo Name">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Family Feast Combo"
                required
                className={inputClass}
              />
            </Field>

            <Field label="Category">
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={onChange}
                required
                className={inputClass}
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Dietary Type">
              <div
                className={`rounded-xl border p-1 ${dietary.soft}`}
              >
                <select
                  name="dietaryType"
                  value={
                    form.dietaryType
                  }
                  onChange={onChange}
                  className="w-full rounded-lg bg-black px-3 py-2.5 text-sm text-zinc-200 outline-none"
                >
                  <option value="VEG">
                    Vegetarian
                  </option>

                  <option value="NON_VEG">
                    Non Vegetarian
                  </option>

                  <option value="EGG">
                    Egg
                  </option>
                </select>
              </div>
            </Field>

            <Field label="Display Order">
              <input
                type="number"
                name="displayOrder"
                min="0"
                value={
                  form.displayOrder
                }
                onChange={onChange}
                className={inputClass}
              />
            </Field>

            <Field
              label="Description"
              className="md:col-span-2"
            >
              <textarea
                name="description"
                value={
                  form.description
                }
                onChange={onChange}
                rows={2}
                placeholder="Optional combo description..."
                className={`${inputClass} resize-none`}
              />
            </Field>

            <Field
              label="Image URL"
              className="md:col-span-2"
            >
              <input
                type="text"
                name="imageUrl"
                value={
                  form.imageUrl
                }
                onChange={onChange}
                placeholder="Optional image URL..."
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* ITEMS */}

        <section className="mt-8 border-t border-zinc-900 pt-8">
          <div className="flex items-start justify-between gap-4">
            <SectionHeader
              title="Included Items"
              description="Items automatically included with every combo."
            />

            <button
              type="button"
              onClick={onAddItem}
              className={secondaryButtonClass}
            >
              + Add Item
            </button>
          </div>

          {form.comboItems.length ===
            0 && (
            <div className="mt-4">
              <EmptyBox text="No fixed items added yet." />
            </div>
          )}

          <div className="mt-4 space-y-2">
            {form.comboItems.map(
              (item, index) => {
                const selected =
                  variantMap.get(
                    Number(
                      item.variantId
                    )
                  );

                return (
                  <div
                    key={index}
                    className="rounded-xl border border-zinc-800 bg-black p-3"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-zinc-300">
                          {selected
                            ? selected.name
                            : "No item selected"}
                        </p>

                        {selected && (
                          <p className="mt-1 text-xs text-zinc-600">
                            {selected.variantName !==
                            "Regular"
                              ? selected.variantName
                              : selected.categoryName}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                          Qty
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={
                            item.quantity
                          }
                          onChange={(event) =>
                            onUpdateItem(
                              index,
                              "quantity",
                              event.target
                                .value
                            )
                          }
                          className="w-20 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-red-600"
                        />
                      </div>

                      <input
                        type="text"
                        value={
                          item.servingLabel ||
                          ""
                        }
                        onChange={(event) =>
                          onUpdateItem(
                            index,
                            "servingLabel",
                            event.target
                              .value
                          )
                        }
                        placeholder="Serving: 5 Pieces"
                        className="lg:w-52 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-red-600"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          onOpenItemPicker(
                            index
                          )
                        }
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                      >
                        {selected
                          ? "Change"
                          : "Select"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onRemoveItem(
                            index
                          )
                        }
                        className="rounded-lg px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* CHOICES */}

        <section className="mt-8 border-t border-zinc-900 pt-8">
          <div className="flex items-start justify-between gap-4">
            <SectionHeader
              title="Customer Choices"
              description="Optional products customers select while ordering the combo."
            />

            <button
              type="button"
              onClick={
                onAddChoiceGroup
              }
              className={secondaryButtonClass}
            >
              + Add Group
            </button>
          </div>

          {form.choiceGroups.length ===
            0 && (
            <div className="mt-4">
              <EmptyBox text="No customer choice groups configured." />
            </div>
          )}

          <div className="mt-4 space-y-3">
            {form.choiceGroups.map(
              (group, groupIndex) => {
                const type =
                  getChoiceTypeClasses(
                    group.type
                  );

                return (
                  <div
                    key={groupIndex}
                    className="rounded-xl border border-zinc-800 bg-black p-4"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-md border px-2 py-1 text-[9px] font-bold uppercase ${type.badge}`}
                            >
                              {type.icon}{" "}
                              {getChoiceTypeLabel(
                                group.type
                              )}
                            </span>

                            <span className="text-sm font-semibold text-zinc-300">
                              {group.name ||
                                "Unnamed group"}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-zinc-600">
                            {getChoiceRangeText(
                              group
                            )}{" "}
                            ·{" "}
                            {group.options
                              .length}{" "}
                            options
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            onOpenChoicePicker(
                              groupIndex
                            )
                          }
                          className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                        >
                          Manage Options
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onRemoveChoiceGroup(
                              groupIndex
                            )
                          }
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-3 border-t border-zinc-900 pt-4 md:grid-cols-[1.5fr_1fr_1fr]">
                        <Field label="Group Name">
                          <input
                            type="text"
                            value={
                              group.name
                            }
                            onChange={(
                              event
                            ) =>
                              onUpdateChoiceGroup(
                                groupIndex,
                                "name",
                                event.target
                                  .value
                              )
                            }
                            placeholder="Choose your Mocktail"
                            className={smallInputClass}
                          />
                        </Field>

                        <Field label="Type">
                          <select
                            value={
                              group.type ||
                              "CUSTOM"
                            }
                            onChange={(
                              event
                            ) =>
                              onUpdateChoiceGroup(
                                groupIndex,
                                "type",
                                event.target
                                  .value
                              )
                            }
                            className={smallInputClass}
                          >
                            <option value="MOCKTAIL">
                              Mocktail
                            </option>

                            <option value="SOFT_DRINK">
                              Soft Drink
                            </option>

                            <option value="CUSTOM">
                              Custom
                            </option>
                          </select>
                        </Field>

                        <div className="grid grid-cols-2 gap-2">
                          <Field label="Min">
                            <input
                              type="number"
                              min="0"
                              value={
                                group.minSelections
                              }
                              onChange={(
                                event
                              ) =>
                                onUpdateChoiceGroup(
                                  groupIndex,
                                  "minSelections",
                                  event.target
                                    .value
                                )
                              }
                              className={smallInputClass}
                            />
                          </Field>

                          <Field label="Max">
                            <input
                              type="number"
                              min="1"
                              value={
                                group.maxSelections
                              }
                              onChange={(
                                event
                              ) =>
                                onUpdateChoiceGroup(
                                  groupIndex,
                                  "maxSelections",
                                  event.target
                                    .value
                                )
                              }
                              className={smallInputClass}
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* PRICING */}

        <section className="mt-8 border-t border-zinc-900 pt-8">
          <div className="flex items-start justify-between gap-4">
            <SectionHeader
              title="Pricing"
              description="Price variants for this combo."
            />

            <button
              type="button"
              onClick={onAddVariant}
              className={secondaryButtonClass}
            >
              + Add Variant
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {form.variants.map(
              (variant, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-xl border border-zinc-800 bg-black p-3 sm:grid-cols-[1fr_180px_auto]"
                >
                  <input
                    type="text"
                    value={
                      variant.name
                    }
                    onChange={(event) =>
                      onUpdateVariant(
                        index,
                        "name",
                        event.target
                          .value
                      )
                    }
                    placeholder="Regular"
                    className={smallInputClass}
                  />

                  <input
                    type="number"
                    min="0"
                    value={
                      variant.price
                    }
                    onChange={(event) =>
                      onUpdateVariant(
                        index,
                        "price",
                        event.target
                          .value
                      )
                    }
                    placeholder="199"
                    className={smallInputClass}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      onRemoveVariant(
                        index
                      )
                    }
                    disabled={
                      form.variants
                        .length === 1
                    }
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Remove
                  </button>
                </div>
              )
            )}
          </div>
        </section>

        {/* SETTINGS */}

        <section className="mt-8 border-t border-zinc-900 pt-8">
          <SectionHeader
            title="Settings"
            description="Control the combo's visibility and popularity."
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ToggleCard
              checked={form.isAvailable}
              onChange={(checked) =>
                onChange({
                  target: {
                    name: "isAvailable",
                    type: "checkbox",
                    checked,
                  },
                })
              }
              title="Available"
              description="Customers can order this combo."
              activeClass="border-emerald-500/30 bg-emerald-500/5"
            />

            <ToggleCard
              checked={form.isPopular}
              onChange={(checked) =>
                onChange({
                  target: {
                    name: "isPopular",
                    type: "checkbox",
                    checked,
                  },
                })
              }
              title="Popular"
              description="Show this combo in popular dishes."
              activeClass="border-amber-500/30 bg-amber-500/5"
            />
          </div>
        </section>

        {/* FOOTER */}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-zinc-900 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-400 hover:bg-zinc-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/20 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : editingCombo
              ? "Update Combo"
              : "Create Combo"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ========================================================================== */
/* ITEM PICKER                                                                */
/* ========================================================================== */

function ItemPickerModal({
  items,
  selectedId,
  search,
  setSearch,
  onClose,
  onSelect,
}) {
  return (
    <ModalShell
      onClose={onClose}
      size="max-w-3xl"
      zIndex="z-[70]"
    >
      <div className="border-b border-zinc-800 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
              Fixed Item
            </p>

            <h3 className="mt-1 text-lg font-bold text-white">
              Select Menu Item
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xl text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
          >
            ×
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search item, variant or category..."
          className={`${inputClass} mt-4`}
          autoFocus
        />
      </div>

      <div className="max-h-[65vh] overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-600">
            No matching items found.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((item) => {
              const selected =
                Number(selectedId) ===
                Number(
                  item.variantId
                );

              const dietary =
                getDietaryClasses(
                  item.dietaryType
                );

              return (
                <button
                  type="button"
                  key={item.variantId}
                  onClick={() =>
                    onSelect(
                      item.variantId
                    )
                  }
                  className={`rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-red-600 bg-red-950/20"
                      : "border-zinc-800 bg-black hover:border-zinc-700 hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${dietary.dot}`}
                        />

                        <p className="truncate text-sm font-semibold text-zinc-300">
                          {item.name}
                        </p>
                      </div>

                      <p className="mt-1 text-xs text-zinc-600">
                        {item.variantName !==
                        "Regular"
                          ? item.variantName
                          : item.categoryName}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold text-zinc-500">
                        {getPrice(
                          item.price
                        )}
                      </p>

                      {selected && (
                        <p className="mt-1 text-[10px] font-bold text-red-400">
                          Selected
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.isComboExclusive && (
                      <span className="rounded-md border border-fuchsia-500/20 bg-fuchsia-500/5 px-1.5 py-0.5 text-[9px] font-semibold text-fuchsia-400">
                        Combo only
                      </span>
                    )}

                    {!item.itemIsAvailable && (
                      <span className="rounded-md border border-red-500/20 bg-red-500/5 px-1.5 py-0.5 text-[9px] font-semibold text-red-400">
                        Item unavailable
                      </span>
                    )}

                    {!item.variantIsAvailable && (
                      <span className="rounded-md border border-red-500/20 bg-red-500/5 px-1.5 py-0.5 text-[9px] font-semibold text-red-400">
                        Variant unavailable
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

/* ========================================================================== */
/* CHOICE PICKER                                                              */
/* ========================================================================== */

function ChoicePickerModal({
  group,
  items,
  selectedIds,
  search,
  setSearch,
  onClose,
  onToggle,
}) {
  const selectedSet =
    new Set(
      selectedIds.map(Number)
    );

  const type =
    getChoiceTypeClasses(
      group?.type
    );

  return (
    <ModalShell
      onClose={onClose}
      size="max-w-3xl"
      zIndex="z-[80]"
    >
      <div className="border-b border-zinc-800 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md border px-2 py-1 text-[9px] font-bold uppercase ${type.badge}`}
              >
                {type.icon}{" "}
                {getChoiceTypeLabel(
                  group?.type
                )}
              </span>
            </div>

            <h3 className="mt-2 text-lg font-bold text-white">
              Manage Options
            </h3>

            <p className="mt-1 text-xs text-zinc-600">
              {getChoiceRangeText(
                group || {}
              )}{" "}
              · {selectedIds.length} selected
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xl text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
          >
            ×
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search options..."
          className={`${inputClass} mt-4`}
          autoFocus
        />
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-600">
            No matching options found.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((item) => {
              const selected =
                selectedSet.has(
                  Number(
                    item.variantId
                  )
                );

              return (
                <button
                  type="button"
                  key={item.variantId}
                  onClick={() =>
                    onToggle(
                      item.variantId
                    )
                  }
                  className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-red-600 bg-red-950/20"
                      : "border-zinc-800 bg-black hover:border-zinc-700 hover:bg-zinc-900"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-300">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      {item.variantName !==
                      "Regular"
                        ? item.variantName
                        : item.categoryName}
                    </p>
                  </div>

                  <span
                    className={`ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                      selected
                        ? "border-red-500 bg-red-600 text-white"
                        : "border-zinc-700 text-zinc-700"
                    }`}
                  >
                    {selected
                      ? "✓"
                      : ""}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800 p-4">
        <p className="text-xs text-zinc-600">
          Selected options:{" "}
          <span className="font-bold text-zinc-300">
            {selectedIds.length}
          </span>
        </p>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-500"
        >
          Done
        </button>
      </div>
    </ModalShell>
  );
}

/* ========================================================================== */
/* GENERIC MODAL                                                              */
/* ========================================================================== */

function ModalShell({
  children,
  onClose,
  size = "max-w-3xl",
  zIndex = "z-50",
}) {
  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6`}
    >
      <div
        className={`w-full ${size} overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl`}
      >
        {children}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* SMALL UI                                                                   */
/* ========================================================================== */

const inputClass =
  "w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-red-600";

const smallInputClass =
  "w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-red-600";

const secondaryButtonClass =
  "rounded-lg border border-red-900/70 bg-red-950/20 px-3 py-2 text-xs font-bold text-red-400 transition hover:border-red-700 hover:bg-red-950/40";

function Field({
  label,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-zinc-600">
        {label}
      </label>

      {children}
    </div>
  );
}

function SectionHeader({
  title,
  description,
}) {
  return (
    <div>
      <h3 className="text-base font-bold text-zinc-200">
        {title}
      </h3>

      {description && (
        <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-600">
          {description}
        </p>
      )}
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-black p-6 text-center text-sm text-zinc-600">
      {text}
    </div>
  );
}

function ToggleCard({
  checked,
  onChange,
  title,
  description,
  activeClass,
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
        checked
          ? activeClass
          : "border-zinc-800 bg-black"
      }`}
    >
      <div>
        <p className="text-sm font-semibold text-zinc-300">
          {title}
        </p>

        <p className="mt-1 text-xs text-zinc-600">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(!checked)
        }
        className={`relative h-6 w-11 rounded-full transition ${
          checked
            ? "bg-emerald-600"
            : "bg-zinc-800"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </label>
  );
}