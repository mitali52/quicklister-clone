'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useUpdateAvatar } from '../_hooks/useProfile';
import { type UserProfile } from '@/lib/api/users.api';

interface AvatarUploadProps {
  profile: UserProfile;
}

export function AvatarUpload({ profile }: Readonly<AvatarUploadProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const updateAvatar = useUpdateAvatar();

  const initials = profile.fullName
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }

    setError(null);
    setSaved(false);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!selectedFile) return;
    setError(null);

    /*
     * TODO: Replace this placeholder with the real S3 direct-upload flow once
     * the storage presign endpoint (POST /storage/presign) is available:
     *
     *   const { uploadUrl, publicUrl } = await apiPost('/storage/presign', {
     *     fileName: selectedFile.name,
     *     contentType: selectedFile.type,
     *     folder: 'avatars',
     *   });
     *   await fetch(uploadUrl, { method: 'PUT', body: selectedFile,
     *     headers: { 'Content-Type': selectedFile.type } });
     *   await updateAvatar.mutateAsync(publicUrl);
     */
    setError('Avatar upload requires the storage service to be configured. Coming soon.');
  }

  function handleDiscard() {
    setPreview(null);
    setSelectedFile(null);
    setSaved(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  const displaySrc = preview ?? profile.avatarUrl;

  return (
    <div className="flex items-start gap-6">
      {/* Avatar display */}
      <div className="relative shrink-0">
        {displaySrc !== null ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-slate-100">
            <Image
              src={displaySrc}
              alt={`${profile.fullName} avatar`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        ) : (
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-700 text-xl font-bold text-white ring-2 ring-slate-100"
            aria-label={`${profile.fullName} initials`}
          >
            {initials}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Upload profile photo"
          onChange={handleFileChange}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            {displaySrc !== null ? 'Change photo' : 'Upload photo'}
          </button>

          {selectedFile !== null && (
            <>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={updateAvatar.isPending}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium text-white transition-colors',
                  updateAvatar.isPending
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-700 hover:bg-blue-800',
                )}
              >
                {updateAvatar.isPending ? 'Saving…' : 'Save photo'}
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Discard
              </button>
            </>
          )}
        </div>

        {saved && (
          <p className="text-sm text-emerald-600" role="status">
            Avatar updated successfully.
          </p>
        )}

        {error !== null && (
          <p className="text-sm text-amber-600" role="alert">
            {error}
          </p>
        )}

        <p className="text-xs text-slate-400">JPEG, PNG or WebP · max 5 MB</p>
      </div>
    </div>
  );
}
