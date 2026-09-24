import { Star } from "lucide-react";

function StarRating({
  value = 0,
  onChange,
  size = 20,
  readOnly = false,
}) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div
      className="flex items-center gap-1"
      role={!readOnly ? "radiogroup" : undefined}
      aria-label={
        readOnly
          ? `${value} out of 5 stars`
          : "Select a rating"
      }
    >
      {stars.map((star) => {
        const filled = star <= value;

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (!readOnly && onChange) {
                onChange(star);
              }
            }}
            className={[
              "transition-all duration-150",
              readOnly
                ? "cursor-default"
                : "cursor-pointer hover:scale-110",
            ].join(" ")}
            aria-label={`${star} star${
              star > 1 ? "s" : ""
            }`}
          >
            <Star
              size={size}
              strokeWidth={1.8}
              className={
                filled
                  ? "fill-[#D92323] text-[#D92323]"
                  : "text-gray-600"
              }
            />
          </button>
        );
      })}
    </div>
  );
}

export default StarRating;