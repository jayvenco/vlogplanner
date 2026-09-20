import { useRef, useState } from "react";
import { ApiError } from "../api/client";

interface Props {
  label: string;
  busyLabel?: string;
  accept?: string;
  className?: string;
  disabled?: boolean;
  onFile: (file: File) => Promise<void> | void;
}

export default function FileUploadButton({
  label,
  busyLabel,
  accept = "image/*",
  className = "secondary",
  disabled,
  onFile,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await onFile(file);
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : "Uploaden is mislukt");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="file-upload">
      <input ref={inputRef} type="file" accept={accept} hidden onChange={handleChange} />
      <button type="button" className={className} disabled={busy || disabled} onClick={() => inputRef.current?.click()}>
        {busy && busyLabel ? busyLabel : label}
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
