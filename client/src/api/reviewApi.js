const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

const getToken = () => {
  return localStorage.getItem("zoop_token");
};

const getAuthHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

/*
|--------------------------------------------------------------------------
| CREATE REVIEW
|--------------------------------------------------------------------------
| Restaurant:
| {
|   restaurantId: 1,
|   rating: 5,
|   comment: "Amazing food!"
| }
|
| Menu item:
| {
|   menuItemId: 29,
|   rating: 4,
|   comment: "Really good pizza"
| }
|--------------------------------------------------------------------------
*/

export const createReview = async ({
  restaurantId,
  menuItemId,
  rating,
  comment,
}) => {
  const response = await fetch(
    `${API_URL}/reviews`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...(restaurantId !== undefined &&
          restaurantId !== null && {
            restaurantId,
          }),

        ...(menuItemId !== undefined &&
          menuItemId !== null && {
            menuItemId,
          }),

        rating,
        comment,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to submit review"
    );
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| GET RESTAURANT REVIEWS
|--------------------------------------------------------------------------
*/

export const getRestaurantReviews = async (
  restaurantId
) => {
  const response = await fetch(
    `${API_URL}/reviews/restaurant?restaurantId=${restaurantId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch restaurant reviews"
    );
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| GET MENU ITEM REVIEWS
|--------------------------------------------------------------------------
*/

export const getMenuItemReviews = async (
  menuItemId
) => {
  const response = await fetch(
    `${API_URL}/reviews/item/${menuItemId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch menu item reviews"
    );
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| GET MY REVIEWS
|--------------------------------------------------------------------------
*/

export const getMyReviews = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(
    `${API_URL}/reviews/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch your reviews"
    );
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| UPDATE REVIEW
|--------------------------------------------------------------------------
*/

export const updateReview = async (
  reviewId,
  { rating, comment }
) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(
    `${API_URL}/reviews/${reviewId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        rating,
        comment,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update review"
    );
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| DELETE REVIEW
|--------------------------------------------------------------------------
*/

export const deleteReview = async (reviewId) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(
    `${API_URL}/reviews/${reviewId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to delete review"
    );
  }

  return data;
};