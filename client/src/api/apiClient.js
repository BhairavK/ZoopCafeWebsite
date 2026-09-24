const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";


export const apiFetch = async (
  endpoint,
  options = {}
) => {
  const token =
    localStorage.getItem(
      "zoop_token"
    );

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  return fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );
};


export default apiFetch;