import { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import type { RecommendationResult, TargetAge, TrendCategory, TrendsData } from "../types";

type Tab = "trending" | "recommendation";

export default function Trends() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("trending");
  const [categories, setCategories] = useState<TrendCategory[]>([]);
  const [category, setCategory] = useState("22");
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [targetAge, setTargetAge] = useState<TargetAge>("13-17");
  const [theme, setTheme] = useState("");
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  useEffect(() => {
    api.get<TrendCategory[]>("/api/trends/categories").then(setCategories);
  }, []);

  function loadTrends() {
    setLoadingTrends(true);
    setError(null);
    api
      .get<TrendsData>(`/api/trends?region=NL&category=${category}`)
      .then(setTrends)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Kon trends niet ophalen."))
      .finally(() => setLoadingTrends(false));
  }

  useEffect(() => {
    if (tab === "trending") loadTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, category]);

  async function handleRecommend(e: React.FormEvent) {
    e.preventDefault();
    if (!theme.trim()) return;
    setLoadingRec(true);
    setRecError(null);
    try {
      const result = await api.post<RecommendationResult>("/api/recommendations", { target_age: targetAge, theme });
      setRecommendation(result);
    } catch (err) {
      setRecError(err instanceof ApiError ? err.message : "Kon geen aanbeveling ophalen.");
    } finally {
      setLoadingRec(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>{t.trends.pageTitle}</h1>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button className={tab === "trending" ? "" : "ghost"} onClick={() => setTab("trending")}>
          {t.trends.tabTrending}
        </button>
        <button className={tab === "recommendation" ? "" : "ghost"} onClick={() => setTab("recommendation")}>
          {t.trends.tabRecommendation}
        </button>
      </div>

      {tab === "trending" && (
        <div>
          <div className="card" style={{ marginBottom: "1.5rem", display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <label>
              {t.trends.category}{" "}
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="secondary" onClick={loadTrends} disabled={loadingTrends}>
              {t.trends.refresh}
            </button>
          </div>

          {error && <p className="error-text card">{error}</p>}

          {trends && (
            <>
              <div className="card" style={{ marginBottom: "1.5rem" }}>
                <strong>{t.trends.trendingKeywords}</strong>
                <div className="kanban-card-chips">
                  {trends.keywords.map((keyword) => (
                    <span key={keyword} className="chip">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="trend-video-grid">
                {trends.videos.map((video) => (
                  <div key={video.video_id} className="card trend-video-card">
                    {video.thumbnail && <img src={video.thumbnail} alt={video.title} />}
                    <strong>{video.title}</strong>
                    <p className="trend-video-meta">
                      {video.channel_title} · {video.view_count.toLocaleString()} {t.trends.views} ·{" "}
                      {video.view_velocity.toLocaleString()} {t.trends.perDay}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "recommendation" && (
        <div>
          <form onSubmit={handleRecommend} className="card" style={{ marginBottom: "1.5rem", display: "grid", gap: "0.75rem" }}>
            <label>
              {t.trends.recTargetAge}{" "}
              <select value={targetAge} onChange={(e) => setTargetAge(e.target.value as TargetAge)}>
                {(["13-17", "18-24", "25-34", "35+"] as TargetAge[]).map((age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
            </label>
            <input
              type="text"
              placeholder={t.trends.recThemePlaceholder}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              required
            />
            <button type="submit" disabled={loadingRec}>
              {t.trends.recSubmit}
            </button>
          </form>

          {recError && <p className="error-text card">{recError}</p>}

          {recommendation && (
            <div className="card" style={{ display: "grid", gap: "1rem" }}>
              <div>
                <strong>{t.trends.recSuggestedIdeas}</strong>
                <ul>
                  {recommendation.suggested_ideas.map((idea) => (
                    <li key={idea}>{idea}</li>
                  ))}
                </ul>
              </div>
              {recommendation.suggested_template && (
                <p>
                  <strong>{t.trends.recSuggestedTemplate}:</strong> {recommendation.suggested_template.icon}{" "}
                  {recommendation.suggested_template.name}
                </p>
              )}
              <p>
                <strong>{t.trends.recToneLength}:</strong> {recommendation.tone_and_length}
              </p>
              <p>
                <strong>{t.trends.recReasoning}:</strong> {recommendation.reasoning}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
