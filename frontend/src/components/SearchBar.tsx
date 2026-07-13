import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import type { SearchResults } from "../types";
import { useDebouncedCallback } from "../hooks/useDebouncedCallback";

export default function SearchBar() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);

  const search = useDebouncedCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    const data = await api.get<SearchResults>(`/api/search?q=${encodeURIComponent(q)}`);
    setResults(data);
  }, 400);

  function handleChange(value: string) {
    setQuery(value);
    setOpen(true);
    search(value);
  }

  const hasResults =
    results && (results.projects.length > 0 || results.ideas.length > 0 || results.tasks.length > 0);

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder={t.search.placeholder}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && query.length >= 2 && (
        <div className="search-results card">
          {!hasResults && <p>{t.search.noResults}</p>}
          {results && results.projects.length > 0 && (
            <div>
              <strong>{t.search.projects}</strong>
              {results.projects.map((p) => (
                <Link key={p.id} to={`/projecten/${p.id}`} className="search-result-item">
                  🎬 {p.title}
                </Link>
              ))}
            </div>
          )}
          {results && results.ideas.length > 0 && (
            <div>
              <strong>{t.search.ideas}</strong>
              {results.ideas.map((i) => (
                <Link key={i.id} to="/ideeen" className="search-result-item">
                  💡 {i.title}
                </Link>
              ))}
            </div>
          )}
          {results && results.tasks.length > 0 && (
            <div>
              <strong>{t.search.tasks}</strong>
              {results.tasks.map((taskItem) => (
                <Link key={taskItem.id} to="/taken" className="search-result-item">
                  📋 {taskItem.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
