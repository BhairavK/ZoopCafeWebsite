const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

export const getMenu = async () => {
  const response = await fetch(
    `${API_URL}/menu`
  );

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Invalid response from server"
    );
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result?.message ||
        "Failed to load menu"
    );
  }

  return result.data;
};