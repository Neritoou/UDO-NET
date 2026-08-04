"use client";

import { useRef, useState, useTransition } from "react";
import { updateAvatarAction } from "../actions/profile.actions";

interface ProfileAvatarUploaderProps {
  avatarUrl: string | null;
  username: string;
  isOwnProfile: boolean;
}

export function ProfileAvatarUploader({
  avatarUrl: initialAvatarUrl,
  username,
  isOwnProfile,
}: ProfileAvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const displayUrl = previewUrl || initialAvatarUrl;

  const handleClick = () => {
    if (isOwnProfile && !isPending) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    const formData = new FormData();
    formData.append("avatar", file);

    startTransition(async () => {
      const res = await updateAvatarAction({}, formData);
      if (res?.error || res?.fieldErrors?.avatar) {
        setErrorMsg(res.error || res.fieldErrors?.avatar || "Error al subir la imagen.");
        setPreviewUrl(null);
      }
    });
  };

  return (
    <div className="flex flex-col items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Cambiar foto de perfil"
      />

      <div
        onClick={handleClick}
        className={`relative z-10 -mt-14 h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-[#1a3d6b] shadow-lg md:-mt-16 md:h-32 md:w-32 ${
          isOwnProfile ? "cursor-pointer group" : ""
        }`}
        title={isOwnProfile ? "Haz clic para cambiar tu foto de perfil" : undefined}
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt={`Foto de perfil de ${username}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#1a3d6b]">
            <svg
              className="h-14 w-14 text-[#facc15]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}

        {/* Loading Spinner Overlay */}
        {isPending && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-20">
            <svg
              className="animate-spin h-7 w-7 text-white mb-1"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span className="text-[10px] font-bold">Subiendo...</span>
          </div>
        )}

        {/* Hover Camera Overlay for Own Profile */}
        {isOwnProfile && !isPending && (
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white z-20">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="text-[11px] font-bold mt-1">Cambiar foto</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="mt-1 text-xs font-semibold text-red-600 max-w-[200px] text-center">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
