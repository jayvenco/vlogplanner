import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { ApiError } from "../api/client";

export default function Register() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(username, email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.auth.registerFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1>{t.auth.registerTitle}</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t.auth.username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder={t.auth.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t.auth.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? t.auth.creatingAccount : t.auth.createAccount}
          </button>
        </form>
        <p>
          {t.auth.haveAccount} <Link to="/inloggen">{t.auth.loginHere}</Link>
        </p>
      </div>
    </div>
  );
}
