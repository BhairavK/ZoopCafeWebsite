import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";

import StarRating from "./StarRating";
import {
  getRestaurantReviews,
  getMenuItemReviews,
} from "../../api/reviewApi";

function ReviewList({
  restaurantId,
  menuItemId,
  title = "Customer Reviews",
}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    setError("");

    try {
      let response;

      if (
        restaurantId !== undefined &&
        restaurantId !== null
      ) {
        response = await getRestaurantReviews(
          restaurantId
        );
      } else if (
        menuItemId !== undefined &&
        menuItemId !== null
      ) {
        response = await getMenuItemReviews(
          menuItemId
        );
      } else {
        throw new Error(
          "ReviewList requires restaurantId or menuItemId"
        );
      }

      setReviews(response.data || []);
    } catch (error) {
      console.error(
        "Failed to load reviews:",
        error
      );

      setError(
        error.message ||
          "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [restaurantId, menuItemId]);

  if (loading) {
    return (
      <section className="py-10">
        <div className="flex items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-[#D92323]" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-6 text-center">
          <p className="text-sm text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={loadReviews}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-300 transition hover:text-white"
          >
            <RefreshCcw size={15} />
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10">
      {/* Heading */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#D92323]">
            What customers say
          </p>

          <h2 className="heading-font mt-1 text-3xl font-bold uppercase tracking-wide text-white">
            {title}
          </h2>
        </div>

        {reviews.length > 0 && (
          <p className="shrink-0 text-sm text-gray-500">
            {reviews.length}{" "}
            {reviews.length === 1
              ? "review"
              : "reviews"}
          </p>
        )}
      </div>

      {/* Empty */}
      {reviews.length === 0 ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-[#161616] px-5 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <span className="text-xl text-gray-500">
              ★
            </span>
          </div>

          <h3 className="heading-font mt-4 text-xl font-bold uppercase text-white">
            No Reviews Yet
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Be the first to share your experience.
          </p>
        </div>
      ) : (
        /* Reviews */
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-white/10 bg-[#161616] p-5 transition-colors hover:border-white/15"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">
                    {review.user?.name || "Customer"}
                  </p>

                  <div className="mt-2">
                    <StarRating
                      value={review.rating}
                      readOnly
                      size={17}
                    />
                  </div>
                </div>

                <time
                  dateTime={review.createdAt}
                  className="shrink-0 text-xs text-gray-600"
                >
                  {formatReviewDate(
                    review.createdAt
                  )}
                </time>
              </div>

              {review.comment && (
                <p className="mt-4 text-sm leading-6 text-gray-400">
                  "{review.comment}"
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function formatReviewDate(date) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export default ReviewList;