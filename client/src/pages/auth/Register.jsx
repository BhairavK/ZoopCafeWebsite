import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";


function Register() {
  const navigate = useNavigate();

  const { register } = useAuth();


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");


  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");


    const trimmedName = name.trim();
    const trimmedEmail =
      email.trim().toLowerCase();


    if (trimmedName.length < 2) {
      setError(
        "Name must contain at least 2 characters."
      );
      return;
    }


    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }


    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }


    setLoading(true);


    try {

      await register({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });


      /*
       * Registration succeeds.
       * User can now login.
       */

      navigate(
        `/login?registered=true`,
        {
          replace: true,
        }
      );

    } catch (error) {

      setError(
        error.message ||
        "Unable to create account. Please try again."
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
              Join Zoop
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Create your account and start ordering.
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

            {/* Name */}

            <div>

              <label
                htmlFor="register-name"
                className="mb-2 block text-sm text-white/70"
              >
                Full Name
              </label>

              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
                autoComplete="name"
                required
                minLength={2}
                disabled={loading}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-[#D92323] disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>


            {/* Email */}

            <div>

              <label
                htmlFor="register-email"
                className="mb-2 block text-sm text-white/70"
              >
                Email Address
              </label>

              <input
                id="register-email"
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
                htmlFor="register-password"
                className="mb-2 block text-sm text-white/70"
              >
                Password
              </label>

              <div className="relative">

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  minLength={6}
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

              <p className="mt-2 text-xs text-white/35">
                Minimum 6 characters
              </p>

            </div>


            {/* Confirm Password */}

            <div>

              <label
                htmlFor="register-confirm-password"
                className="mb-2 block text-sm text-white/70"
              >
                Confirm Password
              </label>

              <div className="relative">

                <input
                  id="register-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 pr-12 text-white outline-none transition placeholder:text-white/25 focus:border-[#D92323] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition hover:text-white"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showConfirmPassword ? (
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
                ? "Creating Account..."
                : "Create Account"}

            </button>

          </form>


          {/* Login */}

          <p className="mt-7 text-center text-sm text-white/50">

            Already have an account?{" "}

            <Link
              to="/login"
              className="font-medium text-[#D92323] hover:underline"
            >
              Login
            </Link>

          </p>

        </div>

      </div>

    </main>
  );
}

export default Register;