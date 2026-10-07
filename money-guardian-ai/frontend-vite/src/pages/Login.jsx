import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Backend endpoint:
      // POST /api/auth/login?email=...&password=...

      const response = await api.post("/auth/login", null, {
        params: {
          email: cleanEmail,
          password: password,
        },
      });

      console.log("LOGIN RESPONSE:", response.data);

      const data = response.data;

      const token = data?.access_token;
      const user = data?.user;

      if (!token) {
        throw new Error("No access token returned by server.");
      }

      // Save authentication token
      localStorage.setItem("token", token);
      localStorage.setItem("access_token", token);
      localStorage.setItem("moneyGuardianToken", token);

      // Save user profile
      const profile = {
        id: user?.id,
        name:
          user?.name ||
          user?.full_name ||
          "Your Profile",
        email:
          user?.email ||
          cleanEmail,
      };

      localStorage.setItem(
        "moneyGuardianProfile",
        JSON.stringify(profile)
      );

      // Notify other parts of the application
      window.dispatchEvent(new Event("storage"));

      console.log("LOGIN SUCCESS");
      console.log("USER:", profile);

      // Go to dashboard/home
      navigate("/", { replace: true });
    } catch (requestError) {
      console.error("LOGIN ERROR:", requestError);

      if (requestError?.response) {
        const status = requestError.response.status;

        const detail = requestError.response.data?.detail;
        const message = requestError.response.data?.message;

        if (status === 401) {
          setError("Invalid email or password.");
        } else if (status === 422) {
          setError("Invalid login request.");
        } else if (typeof detail === "string") {
          setError(detail);
        } else if (typeof message === "string") {
          setError(message);
        } else {
          setError(
            `Login failed. Server returned status ${status}.`
          );
        }
      } else if (
        requestError?.code === "ERR_NETWORK" ||
        requestError?.message === "Network Error"
      ) {
        setError(
          "Cannot connect to the backend. Please make sure the backend is running on port 8001."
        );
      } else {
        setError(
          requestError?.message ||
            "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-background-orb auth-orb-one" />
      <div className="auth-background-orb auth-orb-two" />

      <div className="auth-container">

        {/* BRAND */}
        <div className="auth-brand">
          <div className="auth-brand-mark">
            MG
          </div>

          <div>
            <strong>
              Money Guardian
            </strong>

            <span>
              AI Finance
            </span>
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="auth-card">

          <div className="auth-card-header">
            <span className="auth-eyebrow">
              WELCOME BACK
            </span>

            <h1>
              Login to your account
            </h1>

            <p>
              Access your personalized
              financial dashboard and AI
              insights.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="auth-error">
              <span className="auth-error-icon">
                !
              </span>

              <div>
                <strong>
                  Login failed
                </strong>

                <span>
                  {error}
                </span>
              </div>
            </div>
          )}

          {/* FORM */}
          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}
            <div className="auth-field">
              <label htmlFor="login-email">
                Email
              </label>

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="auth-field">
              <label htmlFor="login-password">
                Password
              </label>

              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-button-spinner" />
                  Signing in...
                </>
              ) : (
                "Login"
              )}
            </button>

          </form>

          {/* DIVIDER */}
          <div className="auth-divider">
            <span />
            <em>or</em>
            <span />
          </div>

          {/* SIGNUP */}
          <div className="auth-signup">
            <span>
              Don&apos;t have an account?
            </span>

            <Link to="/signup">
              Create account
            </Link>
          </div>

          {/* GUEST */}
          <Link
            to="/"
            className="auth-back-link"
          >
            ← Continue as guest
          </Link>

        </div>

        <p className="auth-footer">
          Money Guardian AI · Understand
          your money, don&apos;t just track it.
        </p>

      </div>
    </div>
  );
}

export default Login;

