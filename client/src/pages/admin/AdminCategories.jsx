import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| API HELPER
|--------------------------------------------------------------------------
|
| Handles:
| - Authorization token
| - JSON headers
| - JSON responses
| - API errors
|
*/

const apiRequest = async (
  endpoint,
  options = {}
) => {
  const token =
    localStorage.getItem("zoop_token");

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

  const contentType =
    response.headers.get(
      "content-type"
    );

  let data;

  if (
    contentType &&
    contentType.includes(
      "application/json"
    )
  ) {
    data =
      await response.json();
  } else {
    const text =
      await response.text();

    throw new Error(
      text ||
        `Request failed with status ${response.status}`
    );
  }

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
| ADMIN CATEGORIES
|--------------------------------------------------------------------------
*/

export default function AdminCategories() {
  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingCategory,
    setEditingCategory,
  ] = useState(null);

  const [
    formData,
    setFormData,
  ] = useState({
    name: "",
    description: "",
    imageUrl: "",
    displayOrder: 0,
    isActive: true,
  });


  /*
  |--------------------------------------------------------------------------
  | FETCH CATEGORIES
  |--------------------------------------------------------------------------
  */

  const fetchCategories =
    async () => {
      try {
        setLoading(true);
        setError("");

        const result =
          await apiRequest(
            "/admin/menu/categories"
          );

        if (
          Array.isArray(result)
        ) {
          setCategories(result);

        } else if (
          Array.isArray(
            result.data
          )
        ) {
          setCategories(
            result.data
          );

        } else if (
          Array.isArray(
            result.categories
          )
        ) {
          setCategories(
            result.categories
          );

        } else {
          setCategories([]);
        }

      } catch (error) {
        console.error(
          "Error fetching categories:",
          error
        );

        setError(
          error.message
        );

        setCategories([]);

      } finally {
        setLoading(false);
      }
    };


  /*
  |--------------------------------------------------------------------------
  | INITIAL FETCH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchCategories();
  }, []);


  /*
  |--------------------------------------------------------------------------
  | FORM INPUT CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange =
    (event) => {
      const {
        name,
        value,
        type,
        checked,
      } = event.target;

      setFormData(
        (previous) => ({
          ...previous,

          [name]:
            type === "checkbox"
              ? checked
              : value,
        })
      );
    };


  /*
  |--------------------------------------------------------------------------
  | OPEN CREATE FORM
  |--------------------------------------------------------------------------
  */

  const handleCreateClick =
    () => {
      setEditingCategory(
        null
      );

      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        displayOrder:
          categories.length,
        isActive: true,
      });

      setShowForm(true);
    };


  /*
  |--------------------------------------------------------------------------
  | OPEN EDIT FORM
  |--------------------------------------------------------------------------
  */

  const handleEditClick =
    (category) => {
      setEditingCategory(
        category
      );

      setFormData({
        name:
          category.name || "",

        description:
          category.description ||
          "",

        imageUrl:
          category.imageUrl ||
          "",

        displayOrder:
          category.displayOrder ??
          0,

        isActive:
          category.isActive ??
          true,
      });

      setShowForm(true);
    };


  /*
  |--------------------------------------------------------------------------
  | CLOSE FORM
  |--------------------------------------------------------------------------
  */

  const handleCloseForm =
    () => {
      setShowForm(false);

      setEditingCategory(
        null
      );
    };


  /*
  |--------------------------------------------------------------------------
  | CREATE / UPDATE CATEGORY
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      try {
        setError("");

        const isEditing =
          editingCategory !==
          null;

        const endpoint =
          isEditing
            ? `/admin/menu/categories/${editingCategory.id}`
            : "/admin/menu/categories";

        const method =
          isEditing
            ? "PATCH"
            : "POST";

        const body = {
          name:
            formData.name.trim(),

          description:
            formData.description.trim() ===
            ""
              ? null
              : formData.description.trim(),

          imageUrl:
            formData.imageUrl.trim() ===
            ""
              ? null
              : formData.imageUrl.trim(),

          displayOrder:
            Number(
              formData.displayOrder
            ),

          ...(isEditing && {
            isActive:
              formData.isActive,
          }),
        };

        await apiRequest(
          endpoint,
          {
            method,

            body:
              JSON.stringify(
                body
              ),
          }
        );

        await fetchCategories();

        handleCloseForm();

      } catch (error) {
        console.error(
          "Error saving category:",
          error
        );

        setError(
          error.message
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | TOGGLE CATEGORY STATUS
  |--------------------------------------------------------------------------
  */

  const handleToggleActive =
    async (category) => {
      try {
        setError("");

        const result =
          await apiRequest(
            `/admin/menu/categories/${category.id}`,
            {
              method:
                "PATCH",

              body:
                JSON.stringify({
                  isActive:
                    !category.isActive,
                }),
            }
          );

        const updatedCategory =
          result.data ||
          result;

        setCategories(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                category.id
                  ? {
                      ...item,
                      ...updatedCategory,
                    }
                  : item
            )
        );

      } catch (error) {
        console.error(
          "Error updating category:",
          error
        );

        setError(
          error.message
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | DELETE CATEGORY
  |--------------------------------------------------------------------------
  */

  const handleDelete =
    async (category) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${category.name}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");

        await apiRequest(
          `/admin/menu/categories/${category.id}`,
          {
            method:
              "DELETE",
          }
        );

        setCategories(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                category.id
            )
        );

      } catch (error) {
        console.error(
          "Error deleting category:",
          error
        );

        setError(
          error.message
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-[#0b0c0f] text-white">

        <p className="text-zinc-400">
          Loading categories...
        </p>

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
            Categories
          </h1>

          <p className="mt-2 text-zinc-400">
            Create, edit and manage
            your menu categories.
          </p>

        </div>


        <button
          onClick={
            handleCreateClick
          }
          className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          + Add Category
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
      {/* EMPTY STATE */}
      {/* -------------------------------------------------------------- */}

      {categories.length ===
        0 && (

        <div className="rounded-2xl border border-zinc-800 bg-[#131519] p-16 text-center">

          <div className="mb-5 text-4xl">
            🗂️
          </div>

          <h2 className="text-xl font-semibold">

            No categories yet

          </h2>

          <p className="mt-2 text-zinc-500">

            Create your first category
            to start organizing your
            menu.

          </p>

          <button
            onClick={
              handleCreateClick
            }
            className="mt-6 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
          >

            + Create Category

          </button>

        </div>

      )}


      {/* -------------------------------------------------------------- */}
      {/* CATEGORY LIST */}
      {/* -------------------------------------------------------------- */}

      {categories.length >
        0 && (

        <div className="grid gap-5">

          {categories.map(
            (category) => (

              <div
                key={
                  category.id
                }
                className="rounded-2xl border border-zinc-800 bg-[#131519] p-5 transition hover:border-zinc-700"
              >


                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">


                  {/* -------------------------------------------------- */}
                  {/* CATEGORY INFO */}
                  {/* -------------------------------------------------- */}

                  <div className="flex min-w-0 gap-4">


                    {/* IMAGE */}

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-800 text-2xl">

                      {category.imageUrl ? (

                        <img
                          src={
                            category.imageUrl
                          }
                          alt={
                            category.name
                          }
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        "🍽️"

                      )}

                    </div>


                    {/* DETAILS */}

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-xl font-bold">

                          {
                            category.name
                          }

                        </h2>


                        {/* ORDER */}

                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">

                          Order{" "}

                          {
                            category.displayOrder
                          }

                        </span>


                        {/* STATUS */}

                        <button
                          onClick={() =>
                            handleToggleActive(
                              category
                            )
                          }
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            category.isActive
                              ? "border border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                              : "border border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >

                          {category.isActive
                            ? "Active"
                            : "Inactive"}

                        </button>

                      </div>


                      {/* DESCRIPTION */}

                      {category.description && (

                        <p className="mt-2 max-w-2xl text-sm text-zinc-400">

                          {
                            category.description
                          }

                        </p>

                      )}


                      {/* ITEM COUNT */}

                      <div className="mt-3">

                        <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-400">

                          {
                            category.itemCount ??
                            0
                          }{" "}

                          {(category.itemCount ??
                            0) === 1
                            ? "item"
                            : "items"}

                        </span>

                      </div>

                    </div>

                  </div>


                  {/* -------------------------------------------------- */}
                  {/* ACTIONS */}
                  {/* -------------------------------------------------- */}

                  <div className="flex shrink-0 flex-wrap gap-3">


                    {/* EDIT */}

                    <button
                      onClick={() =>
                        handleEditClick(
                          category
                        )
                      }
                      className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-700"
                    >

                      Edit

                    </button>


                    {/* DELETE */}

                    <button
                      onClick={() =>
                        handleDelete(
                          category
                        )
                      }
                      disabled={
                        (category.itemCount ??
                          0) > 0
                      }
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        (category.itemCount ??
                          0) > 0
                          ? "cursor-not-allowed bg-zinc-900 text-zinc-600"
                          : "border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      }`}
                      title={
                        (category.itemCount ??
                          0) > 0
                          ? "Remove or move all menu items before deleting this category"
                          : "Delete category"
                      }
                    >

                      Delete

                    </button>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}


      {/* -------------------------------------------------------------- */}
      {/* CREATE / EDIT MODAL */}
      {/* -------------------------------------------------------------- */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">


          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-800 bg-[#131519] shadow-2xl">


            {/* -------------------------------------------------------- */}
            {/* MODAL HEADER */}
            {/* -------------------------------------------------------- */}

            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">

              <div>

                <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-red-500">

                  Zoop Cafe

                </p>


                <h2 className="text-xl font-semibold text-white">

                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}

                </h2>


                <p className="mt-1 text-sm text-zinc-500">

                  {editingCategory
                    ? "Update the category details."
                    : "Create a new category for your menu."}

                </p>

              </div>


              <button
                onClick={
                  handleCloseForm
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-xl text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
              >

                ×

              </button>

            </div>


            {/* -------------------------------------------------------- */}
            {/* FORM */}
            {/* -------------------------------------------------------- */}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5 p-6"
            >


              {/* CATEGORY NAME */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-zinc-300">

                  Category Name *

                </label>


                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: Burgers"
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-[#0b0c0f] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
                />

              </div>


              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-zinc-300">

                  Description

                </label>


                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  rows={3}
                  placeholder="Optional description"
                  className="w-full resize-none rounded-xl border border-zinc-800 bg-[#0b0c0f] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
                />

              </div>


              {/* IMAGE URL */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-zinc-300">

                  Image URL

                </label>


                <input
                  type="text"
                  name="imageUrl"
                  value={
                    formData.imageUrl
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-xl border border-zinc-800 bg-[#0b0c0f] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
                />

              </div>


              {/* DISPLAY ORDER */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-zinc-300">

                  Display Order

                </label>


                <input
                  type="number"
                  name="displayOrder"
                  min="0"
                  value={
                    formData.displayOrder
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-[#0b0c0f] px-4 py-3 text-white outline-none transition focus:border-red-500"
                />


                <p className="mt-2 text-xs text-zinc-500">

                  Lower numbers appear first.

                </p>

              </div>


              {/* ACTIVE STATUS */}

              {editingCategory && (

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-[#0b0c0f] p-4 transition hover:border-zinc-700">

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={
                      formData.isActive
                    }
                    onChange={
                      handleChange
                    }
                    className="h-4 w-4 accent-red-600"
                  />


                  <div>

                    <p className="font-semibold text-white">

                      Category is active

                    </p>


                    <p className="text-sm text-zinc-500">

                      Inactive categories
                      can be hidden from
                      customers.

                    </p>

                  </div>

                </label>

              )}


              {/* ------------------------------------------------------ */}
              {/* FORM ACTIONS */}
              {/* ------------------------------------------------------ */}

              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-5">


                <button
                  type="button"
                  onClick={
                    handleCloseForm
                  }
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
                >

                  {editingCategory
                    ? "Save Changes"
                    : "Create Category"}

                </button>


              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}