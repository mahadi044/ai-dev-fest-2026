import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    setError("");
    setSuccess("");

    if (!cleanName || !cleanEmail || !password) {
      setError(
        "Please fill in all required fields."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
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
      /*
       * Money Guardian backend signup.
       * Using query parameters to match the
       * current auth API style.
       */
      const response = await api.post(
        "/auth/signup",
        null,
        {
          params: {
            name: cleanName,
            email: cleanEmail,
            password,
          },
        }
      );

      console.log(
        "SIGNUP RESPONSE:",
        response.data
      );

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 900);
    } catch (requestError) {
      console.error(
        "SIGNUP ERROR:",
        requestError
      );

      const status =
        requestError?.response?.status;

      const detail =
        requestError?.response?.data?.detail;

      const message =
        requestError?.response?.data?.message;

      if (status === 400) {
        setError(
          typeof detail === "string"
            ? detail
            : "An account with this email may already exist."
        );
      } else if (status === 422) {
        setError(
          "Please check your name, email, and password."
        );
      } else if (
        typeof detail === "string"
      ) {
        setError(detail);
      } else if (
        typeof message === "string"
      ) {
        setError(message);
      } else if (
        requestError?.message ===
        "Network Error"
      ) {
        setError(
          "Cannot connect to the backend. Please make sure the backend is running."
        );
      } else {
        setError(
          "Account creation failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page signup-page">
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

        {/* CARD */}
        <div className="auth-card">

          <div className="auth-card-header">
            <span className="auth-eyebrow">
              GET STARTED
            </span>

            <h1>
              Create your account
            </h1>

            <p>
              Start understanding your money
              with Money Guardian AI.
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
                  Something went wrong
                </strong>

                <span>
                  {error}
                </span>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="auth-success">
              <span className="auth-success-icon">
                ✓
              </span>

              <span>
                {success}
              </span>
            </div>
          )}

          {/* FORM */}
          <form
            className="auth-form signup-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}
            <div className="auth-field">
              <label htmlFor="signup-name">
                Full name
              </label>

              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(
                    event.target.value
                  );

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Mahadi Mukit"
                autoComplete="name"
                required
              />
            </div>

            {/* EMAIL */}
            <div className="auth-field">
              <label htmlFor="signup-email">
                Email
              </label>

              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value
                  );

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
              <label htmlFor="signup-password">
                Password
              </label>

              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value
                  );

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="auth-field">
              <label htmlFor="signup-confirm-password">
                Confirm password
              </label>

              <input
                id="signup-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(
                    event.target.value
                  );

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-button-spinner" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>

          </form>

          {/* LOGIN */}
          <div className="auth-divider">
            <span />
            <em>or</em>
            <span />
          </div>

          <div className="auth-signup">
            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Login
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

export default Signup;