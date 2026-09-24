import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import MenuItemCard from "./MenuItemCard";
import SectionTitle from "../ui/SectionTitle";
import { getMenu } from "../../api/menuApi";

function PopularDishes() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPopularItems = async () => {
      try {
        const data = await getMenu();

        const categories = Array.isArray(data)
          ? data
          : data?.categories || [];

        const popular = categories
          .flatMap(
            (category) =>
              category.items ||
              category.menuItems ||
              []
          )
          .filter(
            (item) =>
              item.isPopular &&
              item.isAvailable !== false
          )
          .slice(0, 3);

        setItems(popular);
      } catch (error) {
        console.error(
          "Failed to load popular dishes:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadPopularItems();
  }, []);

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-white/5 px-5 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">

        <SectionTitle
          eyebrow="Customer favourites"
          title="Popular Dishes"
          description="Some of the dishes our customers keep coming back for."
        />

        {loading ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-xl border border-white/5 bg-[#151515]"
              >
                <div className="aspect-[4/3] bg-white/5" />

                <div className="space-y-3 p-5">
                  <div className="h-6 w-2/3 rounded bg-white/5" />
                  <div className="h-4 w-full rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAddToCart={() =>
                  navigate("/menu")
                }
              />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            to="/menu"
            className="flex items-center gap-2 heading-font text-lg uppercase tracking-wide text-white transition hover:text-[#D92323]"
          >
            View Full Menu
            <ArrowRight size={19} />
          </Link>
        </div>

      </div>
    </section>
  );
}

export default PopularDishes;