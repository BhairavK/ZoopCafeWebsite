const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| HELPER
|--------------------------------------------------------------------------
*/

const adminRequest = async (
  endpoint,
  {
    method = "GET",
    body,
  } = {}
) => {
  const token =
    localStorage.getItem("zoop_token");

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method,

      headers: {
        "Content-Type": "application/json",

        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },

      ...(body && {
        body: JSON.stringify(body),
      }),
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message:
        "Invalid response received from server",
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong"
    );
  }

  return data;
};


/*
|--------------------------------------------------------------------------
| GET ALL CATEGORIES
|--------------------------------------------------------------------------
*/

export const getAdminCategories = async () => {
  return adminRequest(
    "/admin/menu/categories"
  );
};


/*
|--------------------------------------------------------------------------
| CREATE CATEGORY
|--------------------------------------------------------------------------
*/

export const createAdminCategory = async (
  categoryData
) => {
  return adminRequest(
    "/admin/menu/categories",
    {
      method: "POST",
      body: categoryData,
    }
  );
};


/*
|--------------------------------------------------------------------------
| UPDATE CATEGORY
|--------------------------------------------------------------------------
*/

export const updateAdminCategory = async (
  categoryId,
  categoryData
) => {
  return adminRequest(
    `/admin/menu/categories/${categoryId}`,
    {
      method: "PATCH",
      body: categoryData,
    }
  );
};


/*
|--------------------------------------------------------------------------
| DELETE CATEGORY
|--------------------------------------------------------------------------
*/

export const deleteAdminCategory = async (
  categoryId
) => {
  return adminRequest(
    `/admin/menu/categories/${categoryId}`,
    {
      method: "DELETE",
    }
  );
};