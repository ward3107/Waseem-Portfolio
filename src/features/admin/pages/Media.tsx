import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Trash2, Upload, Loader2, Check } from 'lucide-react';
import Topbar from '@/features/admin/layout/Topbar';
import Skeleton from '@/features/admin/primitives/Skeleton';
import { listAssets, deleteAssets, type MediaAsset } from '@/lib/content/media';
import { uploadImage } from '@/lib/content/storage';
import { toastError, toastSaved, toastDeleted } from '@/lib/adminToast';
import { useConfirm } from '@/shared/hooks/useConfirm';

/** Format bytes into "12 KB" / "1.9 MB" etc. */
const fmtBytes = (n: number): string => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const Media: React.FC = () => {
  const confirm = useConfirm();
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const load = () => listAssets().then(setAssets).catch((err) => toastError(err, 'Could not load assets'));

  useEffect(() => {
    load();
  }, []);

  const totalSize = useMemo(
    () => (assets ?? []).reduce((s, a) => s + a.size, 0),
    [assets]
  );

  const toggleSelect = (path: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const copyUrl = async (asset: MediaAsset) => {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopiedPath(asset.path);
      setTimeout(() => setCopiedPath((p) => (p === asset.path ? null : p)), 1200);
    } catch (err) {
      toastError(err, 'Copy failed');
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    const ok = await confirm({
      title: `Delete ${selected.size} file${selected.size === 1 ? '' : 's'}?`,
      body: 'This does not check whether the files are still referenced by any project or certificate.',
      danger: true,
    });
    if (!ok) return;
    try {
      const paths = Array.from(selected);
      await deleteAssets(paths);
      setAssets((prev) => prev?.filter((a) => !selected.has(a.path)) ?? null);
      setSelected(new Set());
      toastDeleted(`${paths.length} file${paths.length === 1 ? '' : 's'}`);
    } catch (err) {
      toastError(err, 'Delete failed');
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadImage(file, 'media');
      }
      toastSaved(`${files.length} file${files.length === 1 ? '' : 's'}`);
      await load();
    } catch (err) {
      toastError(err, 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Topbar
        title="Media"
        actions={
          selected.size > 0 ? (
            <button
              type="button"
              onClick={deleteSelected}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-500"
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete {selected.size}
            </button>
          ) : (
            <span className="text-xs text-zinc-500 dark:text-zinc-500">
              {assets ? `${assets.length} files · ${fmtBytes(totalSize)}` : ''}
            </span>
          )
        }
      />

      <div
        className="p-4 sm:p-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!uploading) handleFiles(e.dataTransfer.files);
        }}
      >
        <label
          htmlFor="media-upload"
          className="mb-4 flex items-center justify-center gap-2 py-6 rounded-md border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-brand-purple cursor-pointer transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin text-brand-purple" aria-hidden="true" />
              <span className="text-sm text-zinc-500">Uploading…</span>
            </>
          ) : (
            <>
              <Upload size={16} className="text-zinc-400" aria-hidden="true" />
              <span className="text-sm text-zinc-500">Drop files anywhere or click to upload</span>
            </>
          )}
          <input
            id="media-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,application/pdf"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
            className="sr-only"
          />
        </label>

        {assets === null && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}
          </div>
        )}

        {assets && assets.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-500 text-center py-8">
            No files yet. Upload above or from a project&apos;s editor.
          </p>
        )}

        {assets && assets.length > 0 && (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {assets.map((asset) => {
              const isSelected = selected.has(asset.path);
              const isImage = /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(asset.name);
              return (
                <li
                  key={asset.path}
                  className={`group relative rounded-md overflow-hidden border ${
                    isSelected ? 'border-brand-purple ring-2 ring-brand-purple' : 'border-zinc-200 dark:border-zinc-800'
                  } bg-white dark:bg-zinc-900`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSelect(asset.path)}
                    className="w-full aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden"
                    aria-label={`${isSelected ? 'Deselect' : 'Select'} ${asset.name}`}
                  >
                    {isImage ? (
                      <img src={asset.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-xs font-mono text-zinc-500 uppercase">
                        {asset.name.split('.').pop()}
                      </span>
                    )}
                  </button>
                  <div className="p-2 text-[10px] text-zinc-500 dark:text-zinc-500 space-y-0.5">
                    <p className="truncate font-medium text-zinc-700 dark:text-zinc-300" title={asset.name}>
                      {asset.name}
                    </p>
                    <p>{fmtBytes(asset.size)}</p>
                  </div>
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => copyUrl(asset)}
                      aria-label="Copy URL"
                      title="Copy URL"
                      className="p-1 rounded-full bg-black/60 text-white hover:bg-zinc-800"
                    >
                      {copiedPath === asset.path ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
};

export default Media;
