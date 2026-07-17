import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme, THEME_OPTIONS } from "../hooks/useTheme";
import { api, ApiError } from "../api/client";
import type { LLMProvider, User, YoutubeStatus } from "../types";

const PROVIDER_OPTIONS: { value: LLMProvider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic (Claude)" },
  { value: "custom", label: "Custom endpoint" },
];

export default function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [provider, setProvider] = useState<LLMProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState("");
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [youtubeStatus, setYoutubeStatus] = useState<YoutubeStatus | null>(null);
  const [youtubeMessage, setYoutubeMessage] = useState<string | null>(null);
  const [youtubeBusy, setYoutubeBusy] = useState(false);

  const [youtubeClientId, setYoutubeClientId] = useState("");
  const [youtubeClientSecret, setYoutubeClientSecret] = useState("");
  const [youtubeRedirectUri, setYoutubeRedirectUri] = useState("");
  const [savingYoutubeConfig, setSavingYoutubeConfig] = useState(false);

  const [youtubeApiKey, setYoutubeApiKey] = useState("");
  const [savingYoutubeApiKey, setSavingYoutubeApiKey] = useState(false);

  useEffect(() => {
    if (user?.llm_provider) setProvider(user.llm_provider);
    if (user?.llm_model) setModel(user.llm_model);
    if (user?.llm_custom_endpoint) setCustomEndpoint(user.llm_custom_endpoint);
    if (user?.youtube_client_id) setYoutubeClientId(user.youtube_client_id);
    if (user?.youtube_redirect_uri) setYoutubeRedirectUri(user.youtube_redirect_uri);
  }, [user]);

  function refreshYoutubeStatus() {
    api.get<YoutubeStatus>("/api/youtube/status").then(setYoutubeStatus);
  }

  useEffect(() => {
    refreshYoutubeStatus();
    const youtubeParam = searchParams.get("youtube");
    if (youtubeParam === "connected") {
      setYoutubeMessage("Verbonden met YouTube!");
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

  async function handleSaveYoutubeConfig() {
    setSavingYoutubeConfig(true);
    try {
      await api.put<User>("/api/auth/me", {
        youtube_client_id: youtubeClientId,
        youtube_client_secret: youtubeClientSecret,
        youtube_redirect_uri: youtubeRedirectUri,
      });
      setYoutubeClientSecret("");
      await refreshUser();
    } finally {
      setSavingYoutubeConfig(false);
    }
  }

  async function handleRemoveYoutubeConfig() {
    setSavingYoutubeConfig(true);
    try {
      await api.put<User>("/api/auth/me", {
        youtube_client_id: null,
        youtube_client_secret: null,
        youtube_redirect_uri: null,
      });
      setYoutubeClientId("");
      setYoutubeClientSecret("");
      setYoutubeRedirectUri("");
      await refreshUser();
    } finally {
      setSavingYoutubeConfig(false);
    }
  }

  async function handleSaveYoutubeApiKey() {
    setSavingYoutubeApiKey(true);
    try {
      await api.put<User>("/api/auth/me", { youtube_api_key: youtubeApiKey });
      setYoutubeApiKey("");
      await refreshUser();
    } finally {
      setSavingYoutubeApiKey(false);
    }
  }

  async function handleRemoveYoutubeApiKey() {
    setSavingYoutubeApiKey(true);
    try {
      await api.put<User>("/api/auth/me", { youtube_api_key: null });
      setYoutubeApiKey("");
      await refreshUser();
    } finally {
      setSavingYoutubeApiKey(false);
    }
  }

  async function handleSaveKey() {
    setSaving(true);
    setMessage(null);
    try {
      await api.put<User>("/api/auth/me", {
        llm_provider: provider,
        llm_api_key: apiKey,
        llm_model: model || null,
        llm_custom_endpoint: provider === "custom" ? customEndpoint : null,
      });
      setApiKey("");
      setMessage(`${t.common.save}!`);
      await refreshUser();
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveKey() {
    setSaving(true);
    setMessage(null);
    try {
      await api.put<User>("/api/auth/me", {
        llm_provider: null,
        llm_api_key: null,
        llm_model: null,
        llm_custom_endpoint: null,
      });
      setApiKey("");
      setModel("");
      setCustomEndpoint("");
      setMessage(null);
      await refreshUser();
    } finally {
      setSaving(false);
    }
  }

  async function handleVerifyKey() {
    setVerifying(true);
    setMessage(null);
    try {
      const result = await api.post<{ ok: boolean; message: string }>("/api/auth/llm/verify", {
        llm_provider: provider,
        llm_api_key: apiKey,
        llm_model: model || null,
        llm_custom_endpoint: provider === "custom" ? customEndpoint : null,
      });
      setMessage(result.message);
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : t.projectTemplate.askAiError);
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>{t.settings.title}</h1>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2>{t.settings.profileTitle}</h2>
        <p>
          {t.settings.username}: {user?.username}
        </p>
        <p>
          {t.settings.email}: {user?.email}
        </p>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2>{t.settings.displayTitle}</h2>
        <div className="theme-picker">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={"theme-swatch" + (theme === option.value ? " active" : "")}
              data-theme-preview={option.value}
              onClick={() => setTheme(option.value)}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2>{t.settings.languageTitle}</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className={language === "nl" ? "" : "ghost"} onClick={() => setLanguage("nl")}>
            {t.settings.dutch}
          </button>
          <button className={language === "en" ? "" : "ghost"} onClick={() => setLanguage("en")}>
            {t.settings.english}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem", display: "grid", gap: "0.75rem" }}>
        <h2>{t.settings.aiTitle}</h2>
        <p>{user?.has_llm_key ? t.settings.aiKeySet : t.settings.aiKeyNotSet}</p>

        <label>
          {t.settings.aiProvider}:{" "}
          <select value={provider} onChange={(e) => setProvider(e.target.value as LLMProvider)}>
            {PROVIDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <input
          type="password"
          placeholder={t.settings.aiKeyPlaceholder}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <input
          type="text"
          placeholder={t.settings.aiModelPlaceholder}
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
        {provider === "custom" && (
          <input
            type="text"
            placeholder={t.settings.aiCustomEndpointPlaceholder}
            value={customEndpoint}
            onChange={(e) => setCustomEndpoint(e.target.value)}
          />
        )}

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button onClick={handleSaveKey} disabled={saving || !apiKey.trim()}>
            {t.settings.aiSave}
          </button>
          <button className="ghost" onClick={handleVerifyKey} disabled={verifying || !apiKey.trim()}>
            {verifying ? t.settings.aiVerifying : t.settings.aiVerify}
          </button>
          {user?.has_llm_key && (
            <button className="ghost" onClick={handleRemoveKey} disabled={saving}>
              {t.settings.aiRemove}
            </button>
          )}
        </div>
        {message && <p>{message}</p>}
      </div>

      <div className="card" style={{ marginBottom: "1.5rem", display: "grid", gap: "0.75rem" }}>
        <h2>{t.settings.youtubeTitle}</h2>
        <p className="template-hint">{t.settings.youtubeOauthHint}</p>
        <input
          type="text"
          placeholder={t.settings.youtubeClientIdPlaceholder}
          value={youtubeClientId}
          onChange={(e) => setYoutubeClientId(e.target.value)}
        />
        <input
          type="password"
          placeholder={t.settings.youtubeClientSecretPlaceholder}
          value={youtubeClientSecret}
          onChange={(e) => setYoutubeClientSecret(e.target.value)}
        />
        <input
          type="text"
          placeholder={t.settings.youtubeRedirectUriPlaceholder}
          value={youtubeRedirectUri}
          onChange={(e) => setYoutubeRedirectUri(e.target.value)}
        />
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            onClick={handleSaveYoutubeConfig}
            disabled={savingYoutubeConfig || !youtubeClientId.trim() || !youtubeRedirectUri.trim()}
          >
            {t.settings.youtubeOauthSave}
          </button>
          {user?.has_youtube_oauth_config && (
            <button className="ghost" onClick={handleRemoveYoutubeConfig} disabled={savingYoutubeConfig}>
              {t.settings.youtubeOauthRemove}
            </button>
          )}
        </div>

        {youtubeStatus?.connected ? (
          <>
            <p>
              {t.settings.youtubeConnected} <strong>{youtubeStatus.channel_title}</strong>
            </p>
            <div>
              <button className="ghost" onClick={handleDisconnectYoutube} disabled={youtubeBusy}>
                {t.settings.youtubeDisconnect}
              </button>
            </div>
          </>
        ) : (
          <>
            <p>{t.settings.youtubeNotConnected}</p>
            <div>
              <button onClick={handleConnectYoutube} disabled={youtubeBusy}>
                {youtubeBusy ? t.settings.youtubeConnecting : t.settings.youtubeConnect}
              </button>
            </div>
          </>
        )}
        {youtubeMessage && <p>{youtubeMessage}</p>}
      </div>

      <div className="card" style={{ marginBottom: "1.5rem", display: "grid", gap: "0.75rem" }}>
        <h2>{t.settings.youtubeApiKeyTitle}</h2>
        <p>{user?.has_youtube_api_key ? t.settings.youtubeApiKeySet : t.settings.youtubeApiKeyNotSet}</p>
        <input
          type="password"
          placeholder={t.settings.youtubeApiKeyPlaceholder}
          value={youtubeApiKey}
          onChange={(e) => setYoutubeApiKey(e.target.value)}
        />
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button onClick={handleSaveYoutubeApiKey} disabled={savingYoutubeApiKey || !youtubeApiKey.trim()}>
            {t.settings.youtubeApiKeySave}
          </button>
          {user?.has_youtube_api_key && (
            <button className="ghost" onClick={handleRemoveYoutubeApiKey} disabled={savingYoutubeApiKey}>
              {t.settings.youtubeApiKeyRemove}
            </button>
          )}
        </div>
      </div>

      <button className="danger" onClick={logout}>
        {t.settings.logout}
      </button>
    </div>
  );
}
