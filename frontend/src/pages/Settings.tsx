import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme, THEME_OPTIONS } from "../hooks/useTheme";
import { api, ApiError } from "../api/client";
import type { User, YoutubeStatus } from "../types";

export default function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [youtubeStatus, setYoutubeStatus] = useState<YoutubeStatus | null>(null);
  const [youtubeMessage, setYoutubeMessage] = useState<string | null>(null);
  const [youtubeBusy, setYoutubeBusy] = useState(false);

  function refreshYoutubeStatus() {
    api.get<YoutubeStatus>("/api/youtube/status").then(setYoutubeStatus);
  }

  useEffect(() => {
    refreshYoutubeStatus();
    const youtubeParam = searchParams.get("youtube");
    if (youtubeParam === "connected") {
      setYoutubeMessage("✅ Verbonden met YouTube!");
    } else if (youtubeParam === "error") {
      setYoutubeMessage("Het verbinden is niet gelukt. Probeer het opnieuw.");
    }
    if (youtubeParam) {
      searchParams.delete("youtube");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleConnectYoutube() {
    setYoutubeBusy(true);
    setYoutubeMessage(null);
    try {
      const { url } = await api.get<{ url: string }>("/api/youtube/auth-url");
      window.location.href = url;
    } catch (err) {
      setYoutubeMessage(err instanceof ApiError ? err.message : "Kon niet verbinden met YouTube.");
      setYoutubeBusy(false);
    }
  }

  async function handleDisconnectYoutube() {
    setYoutubeBusy(true);
    try {
      await api.delete("/api/youtube/disconnect");
      refreshYoutubeStatus();
    } finally {
      setYoutubeBusy(false);
    }
  }

  async function handleSaveKey() {
    setSaving(true);
    setMessage(null);
    try {
      await api.put<User>("/api/auth/me", { openai_api_key: apiKey });
      setApiKey("");
      setMessage("✅ Sleutel opgeslagen!");
      await refreshUser();
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveKey() {
    setSaving(true);
    setMessage(null);
    try {
      await api.put<User>("/api/auth/me", { openai_api_key: null });
      setMessage("Sleutel verwijderd.");
      await refreshUser();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>⚙️ Instellingen</h1>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2>Profiel</h2>
        <p>Gebruikersnaam: {user?.username}</p>
        <p>E-mail: {user?.email}</p>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2>Weergave</h2>
        <div className="theme-picker">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={"theme-swatch" + (theme === option.value ? " active" : "")}
              data-theme-preview={option.value}
              onClick={() => setTheme(option.value)}
            >
              <span className="theme-swatch-icon">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem", display: "grid", gap: "0.75rem" }}>
        <h2>🤖 GPT tips</h2>
        <p>
          {user?.has_openai_key ? "✅ Sleutel ingesteld" : "Nog geen sleutel ingesteld"} — plak hier een OpenAI API-sleutel
          zodat je bij een project om GPT-tips kunt vragen.
        </p>
        <input
          type="password"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={handleSaveKey} disabled={saving || !apiKey.trim()}>
            Opslaan
          </button>
          {user?.has_openai_key && (
            <button className="ghost" onClick={handleRemoveKey} disabled={saving}>
              Verwijderen
            </button>
          )}
        </div>
        {message && <p>{message}</p>}
      </div>

      <div className="card" style={{ marginBottom: "1.5rem", display: "grid", gap: "0.75rem" }}>
        <h2>▶️ YouTube</h2>
        {youtubeStatus?.connected ? (
          <>
            <p>✅ Verbonden met kanaal: <strong>{youtubeStatus.channel_title}</strong></p>
            <div>
              <button className="ghost" onClick={handleDisconnectYoutube} disabled={youtubeBusy}>
                Loskoppelen
              </button>
            </div>
          </>
        ) : (
          <>
            <p>Niet verbonden — koppel je YouTube-kanaal om gepubliceerde projecten aan je echte video's te linken.</p>
            <div>
              <button onClick={handleConnectYoutube} disabled={youtubeBusy}>
                {youtubeBusy ? "Bezig..." : "Verbind met YouTube"}
              </button>
            </div>
          </>
        )}
        {youtubeMessage && <p>{youtubeMessage}</p>}
      </div>

      <button className="danger" onClick={logout}>
        Uitloggen
      </button>
    </div>
  );
}
