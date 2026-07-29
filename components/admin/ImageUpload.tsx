import React, { useState } from 'react';
import { uploadImage } from '../../lib/content/storage';

const ImageUpload: React.FC<{
  value: string | null;
  folder: string;
  onChange: (url: string) => void;
}> = ({ value, folder, onChange }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      {value && <img src={value} alt="" className="h-24 rounded-lg object-cover" />}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif,application/pdf"
        onChange={onFile}
        disabled={busy}
      />
      {busy && <p className="text-sm text-gray-400">Uploading…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default ImageUpload;
