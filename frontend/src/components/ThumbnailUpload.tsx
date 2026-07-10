import { useRef, useState } from "react";
import { getToken } from "../api/client";

interface Props {
  projectId: number;
  thumbnailPath: string | null;
  onUploaded: (path: string) => void;
}

export default function ThumbnailUpload({ projectId, thumbnailPath, onUploaded }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`/api/projects/${projectId}/thumbnail`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Uploaden is mislukt");
      }
      const data = await response.json();
      onUploaded(data.thumbnail_path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Uploaden is mislukt");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="thumbnail-upload">
      {thumbnailPath ? (
        <img src={thumbnailPath} alt="Thumbnail" className="thumbnail-preview" />
      ) : (
        <div className="thumbnail-preview thumbnail-placeholder">🖼️</div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
      <button className="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
        {uploading ? "Bezig met uploaden..." : "📷 Thumbnail kiezen"}
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
