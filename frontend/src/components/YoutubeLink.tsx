import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import type { Project, YoutubeStats, YoutubeStatus, YoutubeVideo } from "../types";

interface Props {
  project: Project;
  onLinked: (video: { youtube_video_id: string | null; youtube_video_title: string | null }) => void;
}

export default function YoutubeLink({ project, onLinked }: Props) {
  const [status, setStatus] = useState<YoutubeStatus | null>(null);
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [stats, setStats] = useState<YoutubeStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<YoutubeStatus>("/api/youtube/status").then(setStatus);
  }, []);

  useEffect(() => {
    if (project.youtube_video_id) {
      api
        .get<YoutubeStats>(`/api/projects/${project.id}/youtube-stats`)
        .then(setStats)
        .catch(() => setStats(null));
    }
  }, [project.id, project.youtube_video_id]);

  async function loadVideos() {
    setLoadingVideos(true);
    setError(null);
    try {
      const data = await api.get<YoutubeVideo[]>("/api/youtube/videos");
      setVideos(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kon video's niet ophalen.");
    } finally {
      setLoadingVideos(false);
    }
  }

  async function handleSelect(video: YoutubeVideo) {
    const updated = await api.put<Project>(`/api/projects/${project.id}/youtube`, {
      youtube_video_id: video.video_id,
      youtube_video_title: video.title,
    });
    onLinked({ youtube_video_id: updated.youtube_video_id, youtube_video_title: updated.youtube_video_title });
  }

  async function handleUnlink() {
    const updated = await api.put<Project>(`/api/projects/${project.id}/youtube`, {
      youtube_video_id: null,
      youtube_video_title: null,
    });
    onLinked({ youtube_video_id: updated.youtube_video_id, youtube_video_title: updated.youtube_video_title });
  }

  if (status === null) {
    return null;
  }

  if (!status.connected) {
    return (
      <div className="card youtube-link">
        <h3>▶️ YouTube</h3>
        <p>
          Verbind eerst je YouTube-kanaal bij <Link to="/instellingen">Instellingen</Link> om deze video te koppelen.
        </p>
      </div>
    );
  }

  return (
    <div className="card youtube-link">
      <h3>▶️ YouTube</h3>
      {project.youtube_video_id ? (
        <div className="youtube-linked">
          <p>
            Gekoppeld aan: <strong>{project.youtube_video_title}</strong>
          </p>
          {stats && (
            <p>
              👁️ {stats.view_count ?? "?"} keer bekeken · 👍 {stats.like_count ?? "?"} likes
            </p>
          )}
          <button className="ghost" onClick={handleUnlink}>
            Loskoppelen
          </button>
        </div>
      ) : (
        <div>
          <p>Kies de video die bij dit project hoort:</p>
          <button className="secondary" onClick={loadVideos} disabled={loadingVideos}>
            {loadingVideos ? "Laden..." : "Toon mijn video's"}
          </button>
          {error && <p className="error-text">{error}</p>}
          {videos.length > 0 && (
            <div className="youtube-video-list">
              {videos.map((video) => (
                <button key={video.video_id} className="youtube-video-item" onClick={() => handleSelect(video)}>
                  {video.thumbnail && <img src={video.thumbnail} alt={video.title} />}
                  <span>{video.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
