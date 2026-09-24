import { motion } from "framer-motion";

function CategoryTabs({
  categories,
  selectedCategory,
  onCategoryChange,
}) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex min-w-max items-center justify-center gap-2 px-2 sm:gap-3">

        <button
          onClick={() => onCategoryChange("ALL")}
          className={`rounded-md px-5 py-2.5 heading-font text-lg uppercase tracking-wide transition ${
            selectedCategory === "ALL"
              ? "bg-[#D92323] text-white"
              : "border border-white/10 bg-black/20 text-gray-400 hover:border-[#D92323]/50 hover:text-white"
          }`}
        >
          All
        </button>

        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileTap={{
              scale: 0.96,
            }}
            onClick={() =>
              onCategoryChange(String(category.id))
            }
            className={`rounded-md px-5 py-2.5 heading-font text-lg uppercase tracking-wide transition ${
              selectedCategory === String(category.id)
                ? "bg-[#D92323] text-white"
                : "border border-white/10 bg-black/20 text-gray-400 hover:border-[#D92323]/50 hover:text-white"
            }`}
          >
            {category.name}
          </motion.button>
        ))}

      </div>
    </div>
  );
}

export default CategoryTabs;