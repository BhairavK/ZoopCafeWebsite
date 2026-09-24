import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useCart } from "../../context/CartContext";

import CategoryTabs from "../../components/customer/CategoryTabs";
import MenuItemCard from "../../components/customer/MenuItemCard";
import SectionTitle from "../../components/ui/SectionTitle";
import { getMenu } from "../../api/menuApi";
import AddToCartModal from "../../components/customer/AddToCartModal";

function Menu() {
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState("ALL");

  const [dietaryFilter, setDietaryFilter] =
    useState("ALL");

  const [search, setSearch] = useState("");

  const [popularOnly, setPopularOnly] =
    useState(false);

  const [loading, setLoading] = useState(true);
  
  const [selectedItem, setSelectedItem] =
  useState(null);

  const { items, itemCount, cartTotal } =
  useCart();

  const [error, setError] = useState("");

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMenu();

        /*
         * Our backend returns the active categories
         * and their menu items.
         *
         * Support both:
         * data = [...]
         * and
         * data = { categories: [...] }
         */
        const menuCategories = Array.isArray(data)
          ? data
          : data?.categories || [];

        setCategories(menuCategories);
      } catch (err) {
        console.error("Menu loading error:", err);

        setError(
          err.message || "Unable to load menu"
        );
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  const allItems = useMemo(() => {
  return categories.flatMap((category) =>
    (category.items || category.menuItems || []).map(
      (item) => ({
        ...item,
        categoryId: String(category.id),
        categoryName: category.name,
      })
    )
  );
}, [categories]);

  const filteredItems = useMemo(() => {
  const searchTerm = search.trim().toLowerCase();

  return allItems.filter((item) => {
    // Category filter
    if (
      selectedCategory !== "ALL" &&
      item.categoryId !== String(selectedCategory)
    ) {
      return false;
    }

    // Dietary filter
    if (
      dietaryFilter !== "ALL" &&
      item.dietaryType !== dietaryFilter
    ) {
      return false;
    }

    // Popular filter
    if (
      popularOnly &&
      !item.isPopular
    ) {
      return false;
    }

    // Search filter
    if (
      searchTerm &&
      !item.name?.toLowerCase().includes(searchTerm)
    ) {
      return false;
    }

    return true;
  });
}, [
  allItems,
  selectedCategory,
  dietaryFilter,
  popularOnly,
  search,
]);

  const handleAddToCart = (item) => {
    setSelectedItem(item);

    /*
     * For now we only verify that the
     * correct item reaches this point.
     *
     * Next we'll open the variant /
     * combo-selection modal here.
     */
  };

  return (
    <div className="min-h-screen px-5 py-16 sm:px-8 lg:px-10">
        <div className="text-center text-sm text-gray-400">
  Cart: {itemCount} items · ₹{cartTotal}
</div>

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <SectionTitle
          eyebrow="Fresh from the kitchen"
          title="Our Menu"
          description="Choose from our favourites, discover something new, and build your perfect order."
        />

        {/* Controls */}
        <div className="mt-12 space-y-5">

          {/* Search */}
          <div className="relative mx-auto max-w-2xl">

            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search dishes..."
              className="h-12 w-full rounded-md border border-white/10 bg-[#151515]/90 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#D92323]"
            />

          </div>

          {/* Categories */}
          {!loading && categories.length > 0 && (
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2">

            <div className="mr-1 flex items-center gap-2 text-gray-500">
              <SlidersHorizontal size={16} />

              <span className="text-xs uppercase tracking-wider">
                Filter
              </span>
            </div>

            {[
              ["ALL", "All"],
              ["VEG", "Veg"],
              ["NON_VEG", "Non-Veg"],
              ["EGG", "Egg"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() =>
                  setDietaryFilter(value)
                }
                className={`rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wide transition ${
                  dietaryFilter === value
                    ? "border-[#D92323] bg-[#D92323] text-white"
                    : "border-white/10 text-gray-500 hover:border-white/30 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}

            <button
              onClick={() =>
                setPopularOnly((prev) => !prev)
              }
              className={`rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wide transition ${
                popularOnly
                  ? "border-[#D92323] bg-[#D92323] text-white"
                  : "border-white/10 text-gray-500 hover:border-white/30 hover:text-white"
              }`}
            >
              Popular
            </button>

          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-5 py-16 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-xl border border-white/5 bg-[#151515]"
                >
                  <div className="aspect-[4/3] bg-white/5" />

                  <div className="space-y-3 p-5">
                    <div className="h-6 w-2/3 rounded bg-white/5" />
                    <div className="h-4 w-full rounded bg-white/5" />
                    <div className="h-4 w-1/2 rounded bg-white/5" />
                  </div>
                </div>
              )
            )}

          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-20 text-center">

            <h3 className="heading-font text-3xl uppercase text-white">
              Something went wrong
            </h3>

            <p className="mt-3 text-sm text-gray-500">
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-md bg-[#D92323] px-6 py-3 heading-font uppercase"
            >
              Try Again
            </button>

          </div>
        )}

        {/* Results */}
        {!loading &&
          !error &&
          filteredItems.length === 0 && (
            <div className="py-20 text-center">

              <h3 className="heading-font text-3xl uppercase text-white">
                No dishes found
              </h3>

              <p className="mt-3 text-sm text-gray-500">
                Try changing your search or filters.
              </p>

            </div>
          )}

        {/* Menu grid */}
        {!loading &&
          !error &&
          filteredItems.length > 0 && (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

      </div>
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

export default Menu;