const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const getToken = () => {
  return localStorage.getItem("zoop_token");
};

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| CATEGORIES
|--------------------------------------------------------------------------
*/

export const getAdminCategories = async () => {
  return request("/admin/menu/categories");
};

/*
|--------------------------------------------------------------------------
| MENU ITEMS
|--------------------------------------------------------------------------
*/

export const getAdminMenuItems = async () => {
  return request("/admin/menu/items");
};

export const getAdminMenuItemById = async (id) => {
  return request(`/admin/menu/items/${id}`);
};

export const createAdminMenuItem = async (menuItemData) => {
  return request("/admin/menu/items", {
    method: "POST",

    body: JSON.stringify(menuItemData),
  });
};

export const updateAdminMenuItem = async (
  id,
  menuItemData
) => {
  return request(`/admin/menu/items/${id}`, {
    method: "PATCH",

    body: JSON.stringify(menuItemData),
  });
};

export const deleteAdminMenuItem = async (id) => {
  return request(`/admin/menu/items/${id}`, {
    method: "DELETE",
  });
};

/*
|--------------------------------------------------------------------------
| ITEM AVAILABILITY
|--------------------------------------------------------------------------
*/

export const updateMenuItemAvailability = async (
  id,
  isAvailable
) => {
  return request(
    `/admin/menu/items/${id}/availability`,
    {
      method: "PATCH",

      body: JSON.stringify({
        isAvailable,
      }),
    }
  );
};

/*
|--------------------------------------------------------------------------
| VARIANTS
|--------------------------------------------------------------------------
*/

export const createMenuItemVariant = async (
  menuItemId,
  variantData
) => {
  return request(
    `/admin/menu/items/${menuItemId}/variants`,
    {
      method: "POST",

      body: JSON.stringify(variantData),
    }
  );
};

export const updateMenuItemVariant = async (
  variantId,
  variantData
) => {
  return request(
    `/admin/menu/variants/${variantId}`,
    {
      method: "PATCH",

      body: JSON.stringify(variantData),
    }
  );
};

export const deleteMenuItemVariant = async (
  variantId
) => {
  return request(
    `/admin/menu/variants/${variantId}`,
    {
      method: "DELETE",
    }
  );
};

export const updateVariantAvailability = async (
  variantId,
  isAvailable
) => {
  return request(
    `/admin/menu/variants/${variantId}/availability`,
    {
      method: "PATCH",

      body: JSON.stringify({
        isAvailable,
      }),
    }
  );
};