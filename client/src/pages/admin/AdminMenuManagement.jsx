import { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| INITIAL FORM STATE
|--------------------------------------------------------------------------
*/

const getInitialFormState = () => ({
  categoryId: "",
  name: "",
  description: "",
  imageUrl: "",
  type: "PRODUCT",
  dietaryType: "VEG",
  isPopular: false,
  isAvailable: true,
  displayOrder: 0,
});

/*
|--------------------------------------------------------------------------
| API HELPER
|--------------------------------------------------------------------------
*/

const apiRequest = async (
  endpoint,
  options = {}
) => {
  const token = localStorage.getItem(
    "zoop_token"
  );

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type":
          "application/json",

        ...(token && {
          Authorization:
            `Bearer ${token}`,
        }),

        ...options.headers,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong"
    );
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function AdminMenuManagement() {
  const [items, setItems] = useState([]);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("ALL");

  /*
  |--------------------------------------------------------------------------
  | MODAL STATES
  |--------------------------------------------------------------------------
  */

  const [showItemModal, setShowItemModal] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState(null);

  const [itemForm, setItemForm] =
    useState(
      getInitialFormState()
    );

  /*
  |--------------------------------------------------------------------------
  | VARIANT STATES
  |--------------------------------------------------------------------------
  */

  const [newVariant, setNewVariant] =
    useState({
      name: "",
      price: "",
      isAvailable: true,
      displayOrder: 0,
    });

  const [editingVariant, setEditingVariant] =
    useState(null);

  const [variantForm, setVariantForm] =
    useState({
      name: "",
      price: "",
      isAvailable: true,
      displayOrder: 0,
    });

  /*
  |--------------------------------------------------------------------------
  | SUBMIT LOADING
  |--------------------------------------------------------------------------
  */

  const [submitting, setSubmitting] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        itemsResponse,
        categoriesResponse,
      ] = await Promise.all([
        apiRequest(
          "/admin/menu/items"
        ),

        apiRequest(
          "/admin/menu/categories"
        ),
      ]);

      setItems(
        itemsResponse.data || []
      );

      setCategories(
        categoriesResponse.data || []
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to load menu"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN CREATE ITEM MODAL
  |--------------------------------------------------------------------------
  */

  const handleCreateItem = () => {
    setEditingItem(null);

    setItemForm(
      getInitialFormState()
    );

    setNewVariant({
      name: "",
      price: "",
      isAvailable: true,
      displayOrder: 0,
    });

    setEditingVariant(null);

    setShowItemModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN EDIT ITEM MODAL
  |--------------------------------------------------------------------------
  */

  const handleEditItem = async (item) => {
    try {
      setSubmitting(true);

      /*
      |----------------------------------------------------------------------
      | GET LATEST ITEM DATA
      |----------------------------------------------------------------------
      */

      const response =
        await apiRequest(
          `/admin/menu/items/${item.id}`
        );

      const fullItem =
        response.data;

      setEditingItem(fullItem);

      setItemForm({
        categoryId:
          fullItem.categoryId || "",

        name:
          fullItem.name || "",

        description:
          fullItem.description || "",

        imageUrl:
          fullItem.imageUrl || "",

        type:
          fullItem.type ||
          "PRODUCT",

        dietaryType:
          fullItem.dietaryType ||
          "VEG",

        isPopular:
          Boolean(
            fullItem.isPopular
          ),

        isAvailable:
          Boolean(
            fullItem.isAvailable
          ),

        displayOrder:
          fullItem.displayOrder || 0,
      });

      setNewVariant({
        name: "",
        price: "",
        isAvailable: true,
        displayOrder: 0,
      });

      setEditingVariant(null);

      setShowItemModal(true);
    } catch (error) {
      alert(
        error.message ||
          "Failed to load menu item"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE MODAL
  |--------------------------------------------------------------------------
  */

  const closeModal = () => {
    setShowItemModal(false);

    setEditingItem(null);

    setEditingVariant(null);

    setItemForm(
      getInitialFormState()
    );
  };

  /*
  |--------------------------------------------------------------------------
  | ITEM FORM CHANGE
  |--------------------------------------------------------------------------
  */

  const handleItemFormChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setItemForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE / UPDATE MENU ITEM
  |--------------------------------------------------------------------------
  */

  const handleItemSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSubmitting(true);

      setError("");

      const payload = {
        categoryId: Number(
          itemForm.categoryId
        ),

        name:
          itemForm.name.trim(),

        description:
          itemForm.description.trim() ||
          null,

        imageUrl:
          itemForm.imageUrl.trim() ||
          null,

        type:
          itemForm.type,

        dietaryType:
          itemForm.dietaryType,

        isPopular:
          itemForm.isPopular,

        isAvailable:
          itemForm.isAvailable,

        displayOrder:
          Number(
            itemForm.displayOrder
          ),
      };

      if (editingItem) {
        await apiRequest(
          `/admin/menu/items/${editingItem.id}`,
          {
            method: "PATCH",

            body:
              JSON.stringify(
                payload
              ),
          }
        );
      } else {
        await apiRequest(
          "/admin/menu/items",
          {
            method: "POST",

            body:
              JSON.stringify(
                payload
              ),
          }
        );
      }

      await loadData();

      closeModal();
    } catch (error) {
      alert(
        error.message ||
          "Failed to save menu item"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE ITEM
  |--------------------------------------------------------------------------
  */

  const handleDeleteItem = async (
    item
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${item.name}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(
        `/admin/menu/items/${item.id}`,
        {
          method: "DELETE",
        }
      );

      await loadData();
    } catch (error) {
      alert(
        error.message ||
          "Failed to delete menu item"
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | TOGGLE ITEM AVAILABILITY
  |--------------------------------------------------------------------------
  */

  const handleAvailabilityToggle =
    async (item) => {
      try {
        await apiRequest(
          `/admin/menu/items/${item.id}/availability`,
          {
            method: "PATCH",

            body: JSON.stringify({
              isAvailable:
                !item.isAvailable,
            }),
          }
        );

        await loadData();
      } catch (error) {
        alert(
          error.message ||
            "Failed to update availability"
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | TOGGLE POPULAR
  |--------------------------------------------------------------------------
  */

  const handlePopularToggle =
    async (item) => {
      try {
        await apiRequest(
          `/admin/menu/items/${item.id}`,
          {
            method: "PATCH",

            body: JSON.stringify({
              isPopular:
                !item.isPopular,
            }),
          }
        );

        await loadData();
      } catch (error) {
        alert(
          error.message ||
            "Failed to update popularity"
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | ADD VARIANT
  |--------------------------------------------------------------------------
  */

  const handleAddVariant =
    async (event) => {
      event.preventDefault();

      if (!editingItem) {
        return;
      }

      try {
        setSubmitting(true);

        await apiRequest(
          `/admin/menu/items/${editingItem.id}/variants`,
          {
            method: "POST",

            body: JSON.stringify({
              name:
                newVariant.name.trim(),

              price:
                Number(
                  newVariant.price
                ),

              isAvailable:
                newVariant.isAvailable,

              displayOrder:
                Number(
                  newVariant.displayOrder
                ),
            }),
          }
        );

        /*
        |--------------------------------------------------------------------
        | RELOAD CURRENT ITEM
        |--------------------------------------------------------------------
        */

        const response =
          await apiRequest(
            `/admin/menu/items/${editingItem.id}`
          );

        setEditingItem(
          response.data
        );

        setNewVariant({
          name: "",
          price: "",
          isAvailable: true,
          displayOrder: 0,
        });

        await loadData();
      } catch (error) {
        alert(
          error.message ||
            "Failed to add variant"
        );
      } finally {
        setSubmitting(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | START EDIT VARIANT
  |--------------------------------------------------------------------------
  */

  const startEditVariant = (
    variant
  ) => {
    setEditingVariant(
      variant
    );

    setVariantForm({
      name:
        variant.name || "",

      price:
        variant.price ?? "",

      isAvailable:
        Boolean(
          variant.isAvailable
        ),

      displayOrder:
        variant.displayOrder || 0,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | CANCEL VARIANT EDIT
  |--------------------------------------------------------------------------
  */

  const cancelEditVariant = () => {
    setEditingVariant(null);

    setVariantForm({
      name: "",
      price: "",
      isAvailable: true,
      displayOrder: 0,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE VARIANT
  |--------------------------------------------------------------------------
  */

  const handleUpdateVariant =
    async (event) => {
      event.preventDefault();

      if (!editingVariant) {
        return;
      }

      try {
        setSubmitting(true);

        await apiRequest(
          `/admin/menu/variants/${editingVariant.id}`,
          {
            method: "PATCH",

            body: JSON.stringify({
              name:
                variantForm.name.trim(),

              price:
                Number(
                  variantForm.price
                ),

              isAvailable:
                variantForm.isAvailable,

              displayOrder:
                Number(
                  variantForm.displayOrder
                ),
            }),
          }
        );

        const response =
          await apiRequest(
            `/admin/menu/items/${editingItem.id}`
          );

        setEditingItem(
          response.data
        );

        cancelEditVariant();

        await loadData();
      } catch (error) {
        alert(
          error.message ||
            "Failed to update variant"
        );
      } finally {
        setSubmitting(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | DELETE VARIANT
  |--------------------------------------------------------------------------
  */

  const handleDeleteVariant =
    async (variant) => {
      const confirmed =
        window.confirm(
          `Delete variant "${variant.name}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        await apiRequest(
          `/admin/menu/variants/${variant.id}`,
          {
            method: "DELETE",
          }
        );

        const response =
          await apiRequest(
            `/admin/menu/items/${editingItem.id}`
          );

        setEditingItem(
          response.data
        );

        await loadData();
      } catch (error) {
        alert(
          error.message ||
            "Failed to delete variant"
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | FILTER ITEMS
  |--------------------------------------------------------------------------
  */

  const filteredItems =
    items.filter((item) => {
      const searchMatches =
        item.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        item.categoryName
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const categoryMatches =
        selectedCategory ===
          "ALL" ||
        Number(item.categoryId) ===
          Number(
            selectedCategory
          );

      return (
        searchMatches &&
        categoryMatches
      );
    });

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c0f] p-8 text-white">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-red-500" />

            <p className="text-zinc-400">
              Loading menu...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#0b0c0f] p-6 text-white md:p-8">

      {/* -------------------------------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------------------------------- */}

      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-red-500">
            Zoop Cafe
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Menu Management
          </h1>

          <p className="mt-2 text-zinc-400">
            Create, edit and manage
            your cafe menu.
          </p>
        </div>

        <button
          onClick={
            handleCreateItem
          }
          className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          + Add Menu Item
        </button>

      </div>

      {/* -------------------------------------------------------------- */}
      {/* ERROR */}
      {/* -------------------------------------------------------------- */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* FILTERS */}
      {/* -------------------------------------------------------------- */}

      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_250px]">

        <input
          type="text"
          placeholder="Search menu items..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-zinc-800 bg-[#131519] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
        />

        <select
          value={
            selectedCategory
          }
          onChange={(event) =>
            setSelectedCategory(
              event.target.value
            )
          }
          className="rounded-xl border border-zinc-800 bg-[#131519] px-4 py-3 text-white outline-none focus:border-red-500"
        >
          <option value="ALL">
            All Categories
          </option>

          {categories.map(
            (category) => (
              <option
                key={
                  category.id
                }
                value={
                  category.id
                }
              >
                {category.name}
              </option>
            )
          )}
        </select>

      </div>

      {/* -------------------------------------------------------------- */}
      {/* MENU ITEMS */}
      {/* -------------------------------------------------------------- */}

      {filteredItems.length ===
      0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#131519] p-16 text-center">

          <h2 className="text-xl font-semibold">
            No menu items found
          </h2>

          <p className="mt-2 text-zinc-500">
            Create your first menu
            item to get started.
          </p>

          <button
            onClick={
              handleCreateItem
            }
            className="mt-6 rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
          >
            + Add Menu Item
          </button>

        </div>
      ) : (
        <div className="grid gap-5">

          {filteredItems.map(
            (item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-zinc-800 bg-[#131519] p-5 transition hover:border-zinc-700"
              >

                {/* -------------------------------------------------- */}
                {/* ITEM HEADER */}
                {/* -------------------------------------------------- */}

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                  <div className="flex gap-4">

                    {/* IMAGE */}

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-800 text-2xl">

                      {item.imageUrl ? (
                        <img
                          src={
                            item.imageUrl
                          }
                          alt={
                            item.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "🍽️"
                      )}

                    </div>

                    {/* ITEM INFO */}

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-xl font-bold">
                          {item.name}
                        </h2>

                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">
                          {
                            item.categoryName
                          }
                        </span>

                      </div>

                      {item.description && (
                        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                          {
                            item.description
                          }
                        </p>
                      )}

                      {/* TAGS */}

                      <div className="mt-3 flex flex-wrap gap-2">

                        <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-400">
                          {item.type}
                        </span>

                        <span className="rounded-md border border-green-500/20 bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
                          {
                            item.dietaryType
                          }
                        </span>

                        {item.isPopular && (
                          <span className="rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-xs font-semibold text-yellow-400">
                            ⭐ Popular
                          </span>
                        )}

                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            item.isAvailable
                              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : "border border-red-500/20 bg-red-500/10 text-red-400"
                          }`}
                        >
                          {item.isAvailable
                            ? "Available"
                            : "Unavailable"}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* ------------------------------------------------ */}
                  {/* ACTIONS */}
                  {/* ------------------------------------------------ */}

                  <div className="flex flex-wrap gap-2">

                    <button
                      onClick={() =>
                        handlePopularToggle(
                          item
                        )
                      }
                      className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:border-yellow-500 hover:text-yellow-400"
                    >
                      {item.isPopular
                        ? "★ Popular"
                        : "☆ Make Popular"}
                    </button>

                    <button
                      onClick={() =>
                        handleAvailabilityToggle(
                          item
                        )
                      }
                      className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:border-emerald-500"
                    >
                      {item.isAvailable
                        ? "Disable"
                        : "Enable"}
                    </button>

                    <button
                      onClick={() =>
                        handleEditItem(
                          item
                        )
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-700"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteItem(
                          item
                        )
                      }
                      className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      Delete
                    </button>

                  </div>

                </div>

                {/* -------------------------------------------------- */}
                {/* VARIANTS */}
                {/* -------------------------------------------------- */}

                <div className="mt-6 border-t border-zinc-800 pt-5">

                  <div className="mb-3 flex items-center justify-between">

                    <h3 className="font-semibold">
                      Variants
                    </h3>

                    <span className="text-sm text-zinc-500">
                      {
                        item.variants
                          ?.length || 0
                      }{" "}
                      variants
                    </span>

                  </div>

                  {!item.variants ||
                  item.variants
                    .length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      No variants added.
                      Click Edit to add
                      variants.
                    </p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">

                      {item.variants.map(
                        (
                          variant
                        ) => (
                          <div
                            key={
                              variant.id
                            }
                            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#0d0f12] px-4 py-3"
                          >

                            <div>

                              <p className="font-medium">
                                {
                                  variant.name
                                }
                              </p>

                              <p className="text-sm font-semibold text-red-400">
                                ₹
                                {Number(
                                  variant.price
                                ).toFixed(
                                  2
                                )}
                              </p>

                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                variant.isAvailable
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {variant.isAvailable
                                ? "Available"
                                : "Unavailable"}
                            </span>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </div>

              </div>
            )
          )}

        </div>
      )}

      {/* ============================================================ */}
      {/* ITEM MODAL */}
      {/* ============================================================ */}

      {showItemModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">

          <div className="mx-auto my-8 max-w-5xl rounded-2xl border border-zinc-800 bg-[#131519] shadow-2xl">

            {/* ------------------------------------------------------ */}
            {/* MODAL HEADER */}
            {/* ------------------------------------------------------ */}

            <div className="flex items-center justify-between border-b border-zinc-800 p-6">

              <div>

                <h2 className="text-2xl font-bold">
                  {editingItem
                    ? `Edit ${editingItem.name}`
                    : "Create Menu Item"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {editingItem
                    ? "Update item details and manage variants."
                    : "Create a new menu item."}
                </p>

              </div>

              <button
                onClick={
                  closeModal
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-xl hover:bg-zinc-700"
              >
                ×
              </button>

            </div>

            {/* ------------------------------------------------------ */}
            {/* ITEM FORM */}
            {/* ------------------------------------------------------ */}

            <form
              onSubmit={
                handleItemSubmit
              }
              className="p-6"
            >

              <div className="grid gap-5 md:grid-cols-2">

                {/* ITEM NAME */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Item Name
                  </label>

                  <input
                    required
                    type="text"
                    name="name"
                    value={
                      itemForm.name
                    }
                    onChange={
                      handleItemFormChange
                    }
                    placeholder="Example: Fried Chicken"
                    className="w-full rounded-xl border border-zinc-700 bg-[#0d0f12] px-4 py-3 outline-none focus:border-red-500"
                  />

                </div>

                {/* CATEGORY */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Category
                  </label>

                  <select
                    required
                    name="categoryId"
                    value={
                      itemForm.categoryId
                    }
                    onChange={
                      handleItemFormChange
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-[#0d0f12] px-4 py-3 outline-none focus:border-red-500"
                  >

                    <option value="">
                      Select Category
                    </option>

                    {categories.map(
                      (
                        category
                      ) => (
                        <option
                          key={
                            category.id
                          }
                          value={
                            category.id
                          }
                        >
                          {
                            category.name
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* TYPE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Item Type
                  </label>

                  <select
                    name="type"
                    value={
                      itemForm.type
                    }
                    onChange={
                      handleItemFormChange
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-[#0d0f12] px-4 py-3 outline-none focus:border-red-500"
                  >

                    <option value="PRODUCT">
                      Product
                    </option>

                    <option value="COMBO">
                      Combo
                    </option>

                  </select>

                </div>

                {/* DIETARY */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Dietary Type
                  </label>

                  <select
                    name="dietaryType"
                    value={
                      itemForm.dietaryType
                    }
                    onChange={
                      handleItemFormChange
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-[#0d0f12] px-4 py-3 outline-none focus:border-red-500"
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

                {/* IMAGE URL */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Image URL
                  </label>

                  <input
                    type="text"
                    name="imageUrl"
                    value={
                      itemForm.imageUrl
                    }
                    onChange={
                      handleItemFormChange
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-zinc-700 bg-[#0d0f12] px-4 py-3 outline-none focus:border-red-500"
                  />

                </div>

                {/* DISPLAY ORDER */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Display Order
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="displayOrder"
                    value={
                      itemForm.displayOrder
                    }
                    onChange={
                      handleItemFormChange
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-[#0d0f12] px-4 py-3 outline-none focus:border-red-500"
                  />

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Description
                </label>

                <textarea
                  rows="4"
                  name="description"
                  value={
                    itemForm.description
                  }
                  onChange={
                    handleItemFormChange
                  }
                  placeholder="Describe this menu item..."
                  className="w-full resize-none rounded-xl border border-zinc-700 bg-[#0d0f12] px-4 py-3 outline-none focus:border-red-500"
                />

              </div>

              {/* CHECKBOXES */}

              <div className="mt-5 flex flex-wrap gap-6">

                <label className="flex cursor-pointer items-center gap-3">

                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={
                      itemForm.isAvailable
                    }
                    onChange={
                      handleItemFormChange
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm">
                    Available
                  </span>

                </label>

                <label className="flex cursor-pointer items-center gap-3">

                  <input
                    type="checkbox"
                    name="isPopular"
                    checked={
                      itemForm.isPopular
                    }
                    onChange={
                      handleItemFormChange
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm">
                    Mark as Popular
                  </span>

                </label>

              </div>

              {/* SUBMIT */}

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="rounded-xl border border-zinc-700 px-5 py-3 font-medium hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="rounded-xl bg-red-600 px-6 py-3 font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingItem
                    ? "Save Changes"
                    : "Create Item"}
                </button>

              </div>

            </form>

            {/* ====================================================== */}
            {/* VARIANT MANAGEMENT */}
            {/* ====================================================== */}

            {editingItem && (
              <div className="border-t border-zinc-800 p-6">

                <div className="mb-6">

                  <h2 className="text-xl font-bold">
                    Variant Management
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Add, edit or remove
                    variants for{" "}
                    {
                      editingItem.name
                    }.
                  </p>

                </div>

                {/* -------------------------------------------------- */}
                {/* CURRENT VARIANTS */}
                {/* -------------------------------------------------- */}

                <div className="mb-8 space-y-3">

                  {editingItem.variants
                    ?.length === 0 && (
                    <p className="rounded-xl border border-zinc-800 bg-[#0d0f12] p-4 text-sm text-zinc-500">
                      No variants yet.
                    </p>
                  )}

                  {editingItem.variants?.map(
                    (
                      variant
                    ) => (

                      <div
                        key={
                          variant.id
                        }
                        className="rounded-xl border border-zinc-800 bg-[#0d0f12] p-4"
                      >

                        {editingVariant?.id ===
                        variant.id ? (

                          /* EDIT VARIANT */

                          <form
                            onSubmit={
                              handleUpdateVariant
                            }
                            className="grid gap-3 md:grid-cols-4"
                          >

                            <input
                              required
                              type="text"
                              value={
                                variantForm.name
                              }
                              onChange={(
                                event
                              ) =>
                                setVariantForm(
                                  (
                                    previous
                                  ) => ({
                                    ...previous,
                                    name:
                                      event
                                        .target
                                        .value,
                                  })
                                )
                              }
                              placeholder="Variant name"
                              className="rounded-lg border border-zinc-700 bg-[#131519] px-3 py-2 outline-none focus:border-red-500"
                            />

                            <input
                              required
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                variantForm.price
                              }
                              onChange={(
                                event
                              ) =>
                                setVariantForm(
                                  (
                                    previous
                                  ) => ({
                                    ...previous,
                                    price:
                                      event
                                        .target
                                        .value,
                                  })
                                )
                              }
                              placeholder="Price"
                              className="rounded-lg border border-zinc-700 bg-[#131519] px-3 py-2 outline-none focus:border-red-500"
                            />

                            <label className="flex items-center gap-2">

                              <input
                                type="checkbox"
                                checked={
                                  variantForm.isAvailable
                                }
                                onChange={(
                                  event
                                ) =>
                                  setVariantForm(
                                    (
                                      previous
                                    ) => ({
                                      ...previous,
                                      isAvailable:
                                        event
                                          .target
                                          .checked,
                                    })
                                  )
                                }
                              />

                              <span className="text-sm">
                                Available
                              </span>

                            </label>

                            <div className="flex gap-2">

                              <button
                                type="submit"
                                disabled={
                                  submitting
                                }
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-700"
                              >
                                Save
                              </button>

                              <button
                                type="button"
                                onClick={
                                  cancelEditVariant
                                }
                                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm"
                              >
                                Cancel
                              </button>

                            </div>

                          </form>

                        ) : (

                          /* DISPLAY VARIANT */

                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                            <div className="flex items-center gap-6">

                              <div>

                                <p className="font-semibold">
                                  {
                                    variant.name
                                  }
                                </p>

                                <p className="text-sm text-red-400">
                                  ₹
                                  {Number(
                                    variant.price
                                  ).toFixed(
                                    2
                                  )}
                                </p>

                              </div>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  variant.isAvailable
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {variant.isAvailable
                                  ? "Available"
                                  : "Unavailable"}
                              </span>

                            </div>

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  startEditVariant(
                                    variant
                                  )
                                }
                                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteVariant(
                                    variant
                                  )
                                }
                                className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                              >
                                Delete
                              </button>

                            </div>

                          </div>

                        )}

                      </div>

                    )
                  )}

                </div>

                {/* -------------------------------------------------- */}
                {/* ADD VARIANT */}
                {/* -------------------------------------------------- */}

                <div className="rounded-xl border border-zinc-800 bg-[#0d0f12] p-5">

                  <h3 className="mb-4 font-semibold">
                    Add New Variant
                  </h3>

                  <form
                    onSubmit={
                      handleAddVariant
                    }
                    className="grid gap-4 md:grid-cols-4"
                  >

                    {/* NAME */}

                    <input
                      required
                      type="text"
                      placeholder="Example: 4 pc"
                      value={
                        newVariant.name
                      }
                      onChange={(
                        event
                      ) =>
                        setNewVariant(
                          (
                            previous
                          ) => ({
                            ...previous,
                            name:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className="rounded-lg border border-zinc-700 bg-[#131519] px-4 py-3 outline-none focus:border-red-500"
                    />

                    {/* PRICE */}

                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={
                        newVariant.price
                      }
                      onChange={(
                        event
                      ) =>
                        setNewVariant(
                          (
                            previous
                          ) => ({
                            ...previous,
                            price:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className="rounded-lg border border-zinc-700 bg-[#131519] px-4 py-3 outline-none focus:border-red-500"
                    />

                    {/* AVAILABILITY */}

                    <label className="flex items-center gap-3 rounded-lg border border-zinc-700 px-4 py-3">

                      <input
                        type="checkbox"
                        checked={
                          newVariant.isAvailable
                        }
                        onChange={(
                          event
                        ) =>
                          setNewVariant(
                            (
                              previous
                            ) => ({
                              ...previous,
                              isAvailable:
                                event
                                  .target
                                  .checked,
                            })
                          )
                        }
                      />

                      <span className="text-sm">
                        Available
                      </span>

                    </label>

                    {/* BUTTON */}

                    <button
                      type="submit"
                      disabled={
                        submitting
                      }
                      className="rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                      + Add Variant
                    </button>

                  </form>

                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}