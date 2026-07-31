import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import DragList from './DragList';
import { uploadImage, deleteImageByUrl } from '@/lib/content/storage';
import { toastError, toastSaved } from '@/lib/adminToast';

/**
 * Multi-image field with drag-reorder + drop-zone.
 * - First image is the "Cover" (badge shown).
 * - Uploads use the shared storage helper (MIME allow-list + 5 MB cap).
 * - Removing an image also purges it from Supabase Storage.
 */
const ImageGallery: React.FC<{
  value: string[];
  folder: string;
  onChange: (urls: string[]) => void;
}> = ({ value, folder, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImage(file, folder);
        uploaded.push(url);
      }
      onChange([...value, ...uploaded]);
      toastSaved(`${uploaded.length} image${uploaded.length === 1 ? '' : 's'}`);
    } catch (err) {
      toastError(err, 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeAt = async (idx: number) => {
    const url = value[idx];
    onChange(value.filter((_, i) => i !== idx));
    // Best-effort storage cleanup — don't block the UI on failure.
    void deleteImageByUrl(url).catch(() => undefined);
  };

  // Adapt string[] into { id, url } for DragList (id must be a string).
  const dragItems = value.map((url, i) => ({ id: `${i}::${url}`, url }));

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <DragList
            items={dragItems}
            onReorder={(next) => onChange(next.map((n) => n.url))}
            renderItem={(item, h) => (
              <li
                ref={h.ref}
                style={h.style}
                {...h.attributes}
                {...h.listeners}
                className={`group relative aspect-[4/3] rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 cursor-grab active:cursor-grabbing ${
                  h.isDragging ? 'ring-2 ring-brand-purple' : ''
                }`}
              >
                <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                {dragItems[0].id === item.id && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-brand-purple text-white text-[10px] font-semibold uppercase tracking-wider">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAt(value.indexOf(item.url));
                  }}
                  aria-label="Remove image"
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </li>
            )}
          />
        </ul>
      )}

      {/* Drop zone */}
      <label
        htmlFor="admin-image-upload"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!uploading) handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 p-6 rounded-md border-2 border-dashed cursor-pointer transition-colors ${
          uploading
            ? 'border-brand-purple bg-brand-purple/5'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-brand-purple hover:bg-zinc-50 dark:hover:bg-zinc-900'
        }`}
      >
        {uploading ? (
          <>
            <Loader2 size={20} className="animate-spin text-brand-purple" aria-hidden="true" />
            <span className="text-xs text-zinc-500">Uploading…</span>
          </>
        ) : (
          <>
            <Upload size={20} className="text-zinc-400" aria-hidden="true" />
            <span className="text-xs text-zinc-500">
              Drop images here or click to upload
              <br />
              PNG · JPEG · WebP · AVIF · PDF, up to 5 MB
            </span>
          </>
        )}
        <input
          ref={fileRef}
          id="admin-image-upload"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,application/pdf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
          disabled={uploading}
        />
      </label>
    </div>
  );
};

export default ImageGallery;
