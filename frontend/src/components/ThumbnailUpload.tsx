import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import FileUploadButton from "./FileUploadButton";

interface Props {
  projectId: number;
  thumbnailPath: string | null;
  onUploaded: (path: string) => void;
}

export default function ThumbnailUpload({ projectId, thumbnailPath, onUploaded }: Props) {
  const { t } = useLanguage();

  async function handleFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const data = await api.post<{ thumbnail_path: string }>(`/api/projects/${projectId}/thumbnail`, formData);
    onUploaded(data.thumbnail_path);
  }

  return (
    <div className="thumbnail-upload">
      {thumbnailPath ? (
        <img src={thumbnailPath} alt="Thumbnail" className="thumbnail-preview" />
      ) : (
        <div className="thumbnail-preview thumbnail-placeholder" />
      )}
      <FileUploadButton label={t.thumbnail.choose} busyLabel={t.thumbnail.uploading} onFile={handleFile} />
    </div>
  );
}
