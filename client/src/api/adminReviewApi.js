import apiFetch from "./apiClient";

export const getAdminReviews = async (status = "") => {
  const endpoint = status
    ? `/admin/reviews?status=${status}`
    : "/admin/reviews";

  const response = await apiFetch(endpoint);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to fetch reviews"
    );
  }

  return result.data || [];
};

export const updateAdminReviewStatus = async (
  reviewId,
  status
) => {
  const response = await apiFetch(
    `/admin/reviews/${reviewId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to update review status"
    );
  }

  return result.data;
};