import { useState } from "react";
import { apiPost } from "../api";
import "./Login.css";

function Login({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const switchMode = () => {
    setIsLogin((prev) => !prev);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // POST /login  → { success, message, user }
        const data = await apiPost("/login", {
          email: formData.email,
          password: formData.password,
        });
        onLoginSuccess(data.user);
      } else {
        // POST /signup → { success, message }
        await apiPost("/signup", formData);
        alert("Account created successfully! You can now log in.");
        setIsLogin(true);
        setError("");
      }
    } catch (err) {
      // Network failure (backend down) or backend error message (401/409/…)
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
          <h2>{isLogin ? "Welcome Back!" : "Create Account"}</h2>

          <p className="login-subtitle">
            {isLogin
              ? "Login to continue to Viraat Health Care"
              : "Create your account to get started"}
          </p>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
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

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {isLogin && (
              <div className="login-options">
                <label>
                  <input type="checkbox" />
                  Remember me
                </label>

                <button
                  type="button"
                  className="forgot-btn"
                  onClick={() => alert("Password reset feature coming soon!")}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Login →"
                  : "Create Account →"}
            </button>
          </form>

          <div className="switch-login">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button type="button" onClick={switchMode}>
              {isLogin ? " Sign Up" : " Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
