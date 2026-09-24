import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../api/authApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(() => {
    return localStorage.getItem("zoop_token");
  });

  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Load existing session
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await getCurrentUser(token);

        setUser(response.data);
      } catch (error) {
        console.error(
          "Failed to restore session:",
          error
        );

        localStorage.removeItem(
          "zoop_token"
        );

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const login = async ({
    email,
    password,
  }) => {
    const response = await loginUser({
      email,
      password,
    });

    const {
      token: newToken,
      user: loggedInUser,
    } = response.data;

    localStorage.setItem(
      "zoop_token",
      newToken
    );

    setToken(newToken);
    setUser(loggedInUser);

    return {
      token: newToken,
      user: loggedInUser,
    };
  };

  /*
  |--------------------------------------------------------------------------
  | REGISTER
  |--------------------------------------------------------------------------
  */

  const register = async ({
    name,
    email,
    password,
  }) => {
    const response = await registerUser({
      name,
      email,
      password,
    });

    return response;
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const logout = () => {
    localStorage.removeItem(
      "zoop_token"
    );

    setToken(null);
    setUser(null);
  };

  /*
  |--------------------------------------------------------------------------
  | CONTEXT VALUE
  |--------------------------------------------------------------------------
  */

  const value = {
    user,
    token,
    loading,

    isAuthenticated: Boolean(user),

    /*
    | Role helpers
    */

    isAdmin:
      user?.role === "ADMIN",

    isCustomer:
      user?.role === "CUSTOMER",

    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}