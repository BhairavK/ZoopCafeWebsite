import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Button from "../ui/Button";
import StarRating from "./StarRating";
import { createReview } from "../../api/reviewApi";

function ReviewModal({
  isOpen,
  onClose,
  restaurantId,
  menuItemId,
  targetName = "this",
  onSuccess,
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setComment("");
      setLoading(false);
      setError("");
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setLoading(true);

    try {
      const response = await createReview({
        ...(restaurantId !== undefined &&
          restaurantId !== null && {
            restaurantId,
          }),

        ...(menuItemId !== undefined &&
          menuItemId !== null && {
            menuItemId,
          }),

        rating,
        comment: comment.trim(),
      });

      setSuccess(true);

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error(
        "Failed to submit review:",
        error
      );

      setError(
        error.message ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-t-2xl border border-white/10 bg-[#161616] shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#D92323]">
              Customer Review
            </p>

            <h2 className="heading-font mt-1 text-2xl font-bold uppercase tracking-wide text-white">
              Write a Review
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-full p-2 text-gray-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close review modal"
          >
            <X size={21} />
          </button>
        </div>

        {success ? (
          /* Success state */
          <div className="px-5 py-10 text-center sm:px-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#D92323]/10">
              <span className="text-2xl text-[#D92323]">
                ✓
              </span>
            </div>

            <h3 className="heading-font mt-5 text-2xl font-bold uppercase text-white">
              Review Submitted
            </h3>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-400">
              Thanks for sharing your experience at{" "}
              {targetName}. Your review is waiting for
              approval and will appear publicly once it
              has been approved.
            </p>

            <div className="mt-7">
              <Button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Form */
          <form
            onSubmit={handleSubmit}
            className="px-5 py-6 sm:px-6"
          >
            {/* Target */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                How was your experience with
              </p>

              <h3 className="mt-1 text-lg font-semibold text-white">
                {targetName}?
              </h3>
            </div>

            {/* Rating */}
            <div className="mt-7 flex flex-col items-center">
              <StarRating
                value={rating}
                onChange={setRating}
                size={32}
              />

              <p className="mt-3 text-xs text-gray-500">
                {rating === 0
                  ? "Tap a star to rate"
                  : `${rating} out of 5`}
              </p>
            </div>

            {/* Comment */}
            <div className="mt-7">
              <label
                htmlFor="review-comment"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Your review
                <span className="ml-1 text-gray-500">
                  (optional)
                </span>
              </label>

              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
                maxLength={1000}
                rows={5}
                placeholder="Tell us about your experience..."
                disabled={loading}
                className="w-full resize-none rounded-lg border border-white/10 bg-[#101010] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-gray-600 focus:border-[#D92323]/60 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="mt-1 text-right text-xs text-gray-600">
                {comment.length}/1000
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading || rating === 0}
                className="w-full sm:w-auto"
              >
                {loading
                  ? "Submitting..."
                  : "Submit Review"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ReviewModal;