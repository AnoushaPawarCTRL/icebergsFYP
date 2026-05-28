import React, { useState } from "react";
import "./Login.css";

interface LoginProps {
  onBack: () => void;
  onLoginSuccess?: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onBack, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    // TODO: replace with real auth call
    await new Promise((res) => setTimeout(res, 800));
    setLoading(false);
    onLoginSuccess?.(email);
  };

  return (
    <div className="login-root">
      <div className="login-bg-grid" aria-hidden="true" />
      <div className="login-bg-glow" aria-hidden="true" />

      {/* Nav */}
      <nav className="login-nav">
        <button className="login-logo-btn" onClick={onBack} aria-label="Back to home">
          <img src="/src/assets/logo.png" alt="CryoAI" className="logo-img" />
        </button>
      </nav>

      {/* Card */}
      <main className="login-main">
        <div className="login-card">
          <div className="login-card-header">
            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">Sign in to your CryoAI account</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="field-input"
                placeholder="you@organisation.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="field-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <a href="#" className="forgot-link">
                Forgot password?
              </a>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className={`btn-login-submit ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" aria-label="Signing in…" />
              ) : (
                "SIGN IN"
              )}
            </button>
          </form>

          <div className="login-card-footer">
            <span>Don't have an account?</span>
            <a href="#" className="register-link">
              Create one free
            </a>
          </div>
        </div>

        {/* Decorative iceberg shard */}
        <div className="login-deco" aria-hidden="true">
          <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
            <polygon
              points="100,0 180,80 160,180 100,240 40,180 20,80"
              fill="url(#shardGrad)"
              opacity="0.18"
            />
            <polygon
              points="100,20 165,85 148,170 100,220 52,170 35,85"
              fill="url(#shardGrad2)"
              opacity="0.12"
            />
            <defs>
              <linearGradient id="shardGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#b8eefb" />
                <stop offset="100%" stopColor="#4aa8d0" />
              </linearGradient>
              <linearGradient id="shardGrad2" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8f6fc" />
                <stop offset="100%" stopColor="#3a8ab0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </main>
    </div>
  );
};

export default Login;