import { useState } from "react";
import { apiPost } from "../api";
import "./Login.css";

function Login({ onLoginSuccess, initialMessage = "" }) {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    otp: "",
    remember: false,
  });
  const [error, setError] = useState(initialMessage);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const switchMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setError("");
    setNotice("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      if (mode === "login") {
        const data = await apiPost("/login", {
          email: formData.email,
          password: formData.password,
          remember: formData.remember,
        });
        onLoginSuccess(data.user);
      } else if (mode === "signup") {
        await apiPost("/signup", formData);
        setMode("login");
        setNotice("Account created successfully. You can now log in.");
      } else if (mode === "forgot") {
        const data = await apiPost("/forgot-password", { email: formData.email });
        setMode("reset");
        setNotice(data.message);
      } else {
        await apiPost("/reset-password", {
          email: formData.email,
          otp: formData.otp,
          password: formData.password,
        });
        setMode("login");
        setFormData((prev) => ({ ...prev, password: "", otp: "" }));
        setNotice("Password reset successfully. Please log in.");
      }
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Could not reach the server. Make sure the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side */}
        <div className="login-info">
          <div className="login-logo">💧</div>

          <h1>
            VIRAAT <span>HEALTH CARE</span>
          </h1>

          <p className="tagline">AI-Powered Healthcare Solutions</p>

          <div className="login-description">
            <h2>
              Smart Healthcare.
              <br />
              Smarter Future.
            </h2>

            <p>
              Use AI-powered technology to explore
              innovative fingerprint-based blood group
              detection.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="login-box">
          <h2>
            {mode === "login"
              ? "Welcome Back!"
              : mode === "signup"
                ? "Create Account"
                : mode === "forgot"
                  ? "Reset Password"
                  : "Enter Reset Code"}
          </h2>

          <p className="login-subtitle">
            {mode === "login"
              ? "Login to continue to Viraat Health Care"
              : mode === "signup"
                ? "Create your account to get started"
                : mode === "forgot"
                  ? "We will email a one-time reset code to your account."
                  : "Enter the six-digit code and choose a new password."}
          </p>

          {notice && (
            <div className="login-notice" role="status">
              {notice}
            </div>
          )}
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="input-group">
                <label htmlFor="full_name">Full Name</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {mode !== "reset" && (
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {mode === "reset" && (
              <>
                <div className="input-group">
                  <label htmlFor="reset-email">Email Address</label>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="otp">Six-digit reset code</label>
                  <input
                    id="otp"
                    name="otp"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={formData.otp}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            {(mode === "login" || mode === "signup" || mode === "reset") && (
              <div className="input-group">
                <label htmlFor="password">
                  {mode === "reset" ? "New Password" : "Password"}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={mode === "login" ? undefined : 6}
                  maxLength={256}
                  required
                />
              </div>
            )}

            {mode === "login" && (
              <div className="login-options">
                <label>
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  className="forgot-btn"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                    setNotice("");
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Login →"
                  : mode === "signup"
                    ? "Create Account →"
                    : mode === "forgot"
                      ? "Send reset code →"
                      : "Reset Password →"}
            </button>
          </form>

          {mode === "login" || mode === "signup" ? (
            <div className="switch-login">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
              <button type="button" onClick={switchMode}>
                {mode === "login" ? " Sign Up" : " Login"}
              </button>
            </div>
          ) : (
            <div className="switch-login">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setNotice("");
                }}
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
