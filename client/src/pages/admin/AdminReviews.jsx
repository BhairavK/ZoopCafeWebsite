import { useEffect, useState } from "react";
import {
  getAdminReviews,
  updateAdminReviewStatus,
} from "../../api/adminReviewApi";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= rating
              ? "text-yellow-400"
              : "text-zinc-700"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    APPROVED:
      "border-green-500/30 bg-green-500/10 text-green-400",
    REJECTED:
      "border-red-500/30 bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
        styles[status] || "border-zinc-700 bg-zinc-800 text-zinc-400"
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(dateString) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminReviews(selectedStatus);
      setReviews(data);
    } catch (err) {
      setError(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [selectedStatus]);

  const handleStatusChange = async (reviewId, status) => {
    try {
      setActionLoading(reviewId);
      setError("");

      await updateAdminReviewStatus(reviewId, status);

      await loadReviews();
    } catch (err) {
      setError(
        err.message || "Failed to update review status"
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#111111] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D92323]">
              Management
            </p>

            <h1 className="heading-font mt-1 text-3xl uppercase tracking-wide sm:text-4xl">
              Customer Reviews
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Review customer feedback and approve or reject
              submissions before they appear publicly.
            </p>
          </div>

          <button
            onClick={loadReviews}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↻
            <span className="ml-2">
              {loading ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => {
            const active =
              selectedStatus === filter.value;

            return (
              <button
                key={filter.value || "ALL"}
                onClick={() =>
                  setSelectedStatus(filter.value)
                }
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-[#D92323] bg-[#D92323] text-white"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading ? (
          <div className="rounded-xl border border-zinc-800 bg-[#181818] p-10 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-[#D92323]" />

            <p className="text-sm text-zinc-400">
              Loading reviews...
            </p>
          </div>
        ) : reviews.length === 0 ? (
          /* =====================================================
              EMPTY
          ===================================================== */

          <div className="rounded-xl border border-zinc-800 bg-[#181818] px-6 py-14 text-center">
            <div className="mb-4 text-4xl">★</div>

            <h2 className="text-lg font-semibold text-white">
              No reviews found
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              There are no reviews matching the selected
              filter.
            </p>
          </div>
        ) : (
          /* =====================================================
              REVIEWS
          ===================================================== */

          <div className="space-y-4">
            {reviews.map((review) => {
              const isActionLoading =
                actionLoading === review.id;

              return (
                <article
                  key={review.id}
                  className="overflow-hidden rounded-xl border border-zinc-800 bg-[#181818]"
                >
                  {/* ===============================
                      TOP SECTION
                  =============================== */}

                  <div className="flex flex-col gap-4 border-b border-zinc-800 p-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-semibold text-white">
                          {review.user?.name || "Unknown Customer"}
                        </h2>

                        <StatusBadge
                          status={review.status}
                        />
                      </div>

                      <p className="mt-1 break-all text-sm text-zinc-500">
                        {review.user?.email || "-"}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-1 lg:items-end">
                      <StarRating rating={review.rating} />

                      <span className="text-xs text-zinc-500">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* ===============================
                      REVIEW CONTENT
                  =============================== */}

                  <div className="p-5">
                    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">

                      <div>
                        {/* Target */}

                        <div className="mb-4">
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                            Reviewed
                          </p>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-semibold uppercase text-zinc-400">
                              {review.target?.type ===
                              "RESTAURANT"
                                ? "Restaurant"
                                : "Menu Item"}
                            </span>

                            <span className="font-medium text-zinc-200">
                              {review.target?.name ||
                                "Unknown"}
                            </span>
                          </div>
                        </div>

                        {/* Comment */}

                        <div>
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                            Customer Comment
                          </p>

                          {review.comment ? (
                            <p className="max-w-4xl whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                              {review.comment}
                            </p>
                          ) : (
                            <p className="text-sm italic text-zinc-600">
                              No comment provided.
                            </p>
                          )}
                        </div>

                        {/* Date */}

                        <p className="mt-5 text-xs text-zinc-600">
                          Submitted{" "}
                          {formatDate(review.createdAt)}
                        </p>
                      </div>

                      {/* ===============================
                          ACTIONS
                      =============================== */}

                      <div className="flex flex-col gap-2 lg:min-w-[150px]">
                        {review.status !== "APPROVED" && (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                review.id,
                                "APPROVED"
                              )
                            }
                            disabled={isActionLoading}
                            className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isActionLoading
                              ? "Updating..."
                              : "Approve"}
                          </button>
                        )}

                        {review.status !== "REJECTED" && (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                review.id,
                                "REJECTED"
                              )
                            }
                            disabled={isActionLoading}
                            className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isActionLoading
                              ? "Updating..."
                              : "Reject"}
                          </button>
                        )}

                        {review.status !== "PENDING" && (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                review.id,
                                "PENDING"
                              )
                            }
                            disabled={isActionLoading}
                            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-400 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isActionLoading
                              ? "Updating..."
                              : "Set Pending"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}