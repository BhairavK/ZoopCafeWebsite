import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";


function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  /*
   * If another page sends the user to login,
   * we can return them there after login.
   *
   * Example:
   * /login?redirect=/checkout
   */

  const redirectPath =
    new URLSearchParams(location.search).get(
      "redirect"
    ) || "/menu";


  const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    const data = await login({
      email,
      password,
    });

    if (data.user.role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/menu");
    }

  } catch (error) {
    setError(
      error.message ||
      "Login failed"
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0b0b] px-5 py-10">

      {/* Background glow */}

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D92323]/10 blur-[140px]" />


      <div className="relative w-full max-w-md">

        {/* Logo */}

        <Link
          to="/"
          className="mb-10 flex flex-col items-center"
        >

          <span className="heading-font text-5xl font-extrabold tracking-wide text-white">
            ZOOP
          </span>

          <span className="mt-1 text-[10px] font-medium tracking-[0.5em] text-[#D92323]">
            CAFE
          </span>

        </Link>


        {/* Card */}

        <div className="rounded-2xl border border-white/10 bg-[#111111]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">

          <div className="mb-8 text-center">

            <h1 className="heading-font text-3xl uppercase text-white">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Login to order your favorite food.
            </p>

          </div>


          {/* Error */}

          {error && (

            <div
              role="alert"
              className="mb-5 rounded-lg border border-[#D92323]/40 bg-[#D92323]/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>

          )}


          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}

            <div>

              <label
                htmlFor="login-email"
                className="mb-2 block text-sm text-white/70"
              >
                Email Address
              </label>

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={loading}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-[#D92323] disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>


            {/* Password */}

            <div>

              <label
                htmlFor="login-password"
                className="mb-2 block text-sm text-white/70"
              >
                Password
              </label>

              <div className="relative">

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 pr-12 text-white outline-none transition placeholder:text-white/25 focus:border-[#D92323] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition hover:text-white"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}

                </button>

              </div>

            </div>


            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D92323] py-3.5 heading-font text-lg uppercase text-white transition hover:bg-[#ef3030] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading && (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              )}

              {loading
                ? "Logging In..."
                : "Login"}

            </button>

          </form>


          {/* Register */}

          <p className="mt-7 text-center text-sm text-white/50">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-medium text-[#D92323] hover:underline"
            >
              Create one
            </Link>

          </p>

        </div>

      </div>

    </main>
  );
}

export default Login;