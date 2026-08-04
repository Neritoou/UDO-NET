"use client";

import { useRef, useState, useTransition } from "react";
import { updateBannerAction } from "../actions/profile.actions";

interface ProfileBannerUploaderProps {
  initialBannerUrl?: string | null;
  isOwnProfile: boolean;
  children: React.ReactNode;
}

export function ProfileBannerUploader({
  initialBannerUrl,
  isOwnProfile,
  children,
}: ProfileBannerUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const bannerBg = previewUrl || initialBannerUrl || "/udo-arch.jpg";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    const formData = new FormData();
    formData.append("banner", file);

    startTransition(async () => {
      const res = await updateBannerAction({}, formData);
      if (res?.error) {
        setPreviewUrl(null);
      }
    });
  };

  return (
    <header className="overflow-hidden rounded-2xl border border-[#e8eff8] bg-white shadow-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Cambiar foto de portada"
      />

      <div
        className={`relative h-40 bg-cover bg-center md:h-52 ${
          isOwnProfile ? "group cursor-pointer" : ""
        }`}
        style={{ backgroundImage: `url('${bannerBg}')` }}
        onClick={() => isOwnProfile && !isPending && fileInputRef.current?.click()}
        title={isOwnProfile ? "Haz clic para cambiar la portada del perfil" : undefined}
      >
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-[#0f2748]/60 transition-colors group-hover:bg-[#0f2748]/45" aria-hidden="true" />

        {/* UDO watermark */}
        <span
          className="absolute inset-0 flex select-none items-center justify-center text-[7rem] font-extrabold leading-none text-white/15 md:text-[10rem]"
          aria-hidden="true"
        >
          UDO
        </span>

        {/* Hover Camera Overlay Button for Banner */}
        {isOwnProfile && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-xl bg-white/90 px-3.5 py-1.5 backdrop-blur-sm shadow-md transition-all duration-200 group-hover:bg-white group-hover:shadow-lg opacity-90 group-hover:opacity-100">
            <svg
              className="h-4 w-4 text-[#0f2748]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="font-open-sans text-xs font-semibold text-[#0f2748]">
              {isPending ? "Subiendo..." : "Editar portada"}
            </span>
          </div>
        )}
      </div>

      {children}
    </header>
  );
}
