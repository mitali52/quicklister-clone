'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api/client';
import type { ListingMedia } from '@/lib/api/listing-media.api';
import {
  useListingMedia,
  useUploadListingMedia,
  useReorderListingMedia,
  useDeleteListingMedia,
} from '../_hooks/useListingMedia';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGES = 20;

interface ListingMediaManagerProps {
  listingId: string;
  canViewMedia: boolean;
  canManageMedia: boolean;
}

// ── Single media card ─────────────────────────────────────────────────────────

interface MediaCardProps {
  media: ListingMedia;
  index: number;
  total: number;
  isOwner: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function MediaCard({
  media,
  index,
  total,
  isOwner,
  onMoveUp,
  onMoveDown,
  onDelete,
  isDeleting,
}: MediaCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const imageUrl = media.url.startsWith('/')
    ? `${API_URL}${media.url}`
    : media.url;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm',
        media.isPrimary && 'ring-2 ring-blue-500 ring-offset-1',
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-slate-100">
        <Image
          src={imageUrl}
          alt={`Listing photo ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {media.isPrimary && (
          <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
            Cover
          </span>
        )}
      </div>

      {/* Info row */}
      <div className="px-3 py-2 text-xs text-slate-500">
        <span className="block truncate font-mono">{media.filename}</span>
        <span>{(media.sizeBytes / 1024).toFixed(0)} KB · {media.mimeType.split('/')[1]?.toUpperCase()}</span>
      </div>

      {/* Owner controls */}
      {isOwner && (
        <div className="border-t border-slate-100 px-3 py-2">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="flex-1 text-xs text-red-600">Delete this image?</span>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-slate-500 underline"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={onDelete}
                className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {/* Move up */}
              <button
                type="button"
                disabled={index === 0}
                onClick={onMoveUp}
                aria-label="Move image earlier"
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              {/* Move down */}
              <button
                type="button"
                disabled={index === total - 1}
                onClick={onMoveDown}
                aria-label="Move image later"
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              <span className="flex-1" />
              {/* Delete */}
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete image"
                className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Upload zone ───────────────────────────────────────────────────────────────

interface UploadZoneProps {
  listingId: string;
  count: number;
}

function UploadZone({ listingId, count }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const upload = useUploadListingMedia(listingId);

  const apiError = upload.error instanceof ApiError ? upload.error.message : null;
  const displayError = clientError ?? apiError ?? (upload.isError ? 'Upload failed. Please try again.' : null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setClientError(null);

    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setClientError(`"${file.name}" is not a supported image type (JPEG, PNG, WebP only).`);
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setClientError(`"${file.name}" exceeds the 10 MB size limit.`);
        return;
      }
      await upload.mutateAsync(file);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const atLimit = count >= MAX_IMAGES;

  return (
    <div>
      <div
        role="button"
        tabIndex={atLimit ? -1 : 0}
        aria-label="Upload images"
        aria-disabled={atLimit}
        onClick={() => !atLimit && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !atLimit) {
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          atLimit
            ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-50'
            : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50',
        )}
      >
        <svg
          className={cn('h-8 w-8', atLimit ? 'text-slate-400' : 'text-slate-400')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <div>
          <p className="text-sm font-medium text-slate-700">
            {upload.isPending ? 'Uploading…' : atLimit ? 'Image limit reached' : 'Click to upload images'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            JPEG, PNG, WebP · Max 10 MB · Up to {MAX_IMAGES} images ({count}/{MAX_IMAGES} used)
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        className="sr-only"
        onChange={(e) => void handleFiles(e.target.files)}
        aria-hidden="true"
      />

      {displayError && (
        <p className="mt-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ListingMediaManager({ listingId, canViewMedia, canManageMedia }: ListingMediaManagerProps) {
  const { data: media = [], isLoading, error } = useListingMedia(listingId, canViewMedia);
  const reorder = useReorderListingMedia(listingId);
  const deleteMedia = useDeleteListingMedia(listingId);

  if (!canViewMedia) {
    return null;
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= media.length) return;

    const reordered = [...media];
    const temp = reordered[index];
    const swap = reordered[swapIndex];
    if (!temp || !swap) return;

    reordered[index] = swap;
    reordered[swapIndex] = temp;

    const items = reordered.map((m, i) => ({ id: m.id, sortOrder: i }));
    void reorder.mutateAsync(items);
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">Photos</h2>
        {media.length > 0 && (
          <span className="text-xs text-slate-500">
            {media.length} / {MAX_IMAGES} · first photo is cover
          </span>
        )}
      </div>

      {isLoading && (
        <div className="grid animate-pulse grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((k) => (
            <div key={k} className="aspect-[4/3] rounded-xl bg-slate-200" />
          ))}
        </div>
      )}

      {error !== null && !isLoading && (
        <p className="text-sm text-red-600">Failed to load photos. Please refresh.</p>
      )}

      {!isLoading && (
        <div className="space-y-4">
          {media.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {media.map((item, index) => (
                <MediaCard
                  key={item.id}
                  media={item}
                  index={index}
                  total={media.length}
                  isOwner={canManageMedia}
                  onMoveUp={() => moveItem(index, 'up')}
                  onMoveDown={() => moveItem(index, 'down')}
                  onDelete={() => void deleteMedia.mutateAsync(item.id)}
                  isDeleting={deleteMedia.isPending && deleteMedia.variables === item.id}
                />
              ))}
            </div>
          )}

          {media.length === 0 && !canManageMedia && (
            <p className="text-center text-sm text-slate-500">No photos added yet.</p>
          )}

          {canManageMedia && (
            <UploadZone listingId={listingId} count={media.length} />
          )}
        </div>
      )}
    </section>
  );
}
