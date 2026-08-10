"use client";

import { useRef, useState, useTransition } from "react";
import { IMAGE_PRESETS, resizeImage, validateImage } from "@/lib/storage/client";
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const preset = IMAGE_PRESETS.userBanner;
  const bannerBg = previewUrl || initialBannerUrl || preset.defaultUrl;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    const validationError = await validateImage(file, preset);
    if (validationError) {
      setErrorMsg(validationError);
      e.target.value = "";
      return;
    }

    let optimized: File;
    try {
      const blob = await resizeImage(file, preset.dimensions);
      optimized = new File([blob], "banner.webp", { type: "image/webp" });
    } catch {
      setErrorMsg("No se pudo procesar la imagen.");
      e.target.value = "";
      return;
    }

    setPreviewUrl(URL.createObjectURL(optimized));

    const formData = new FormData();
    formData.append("banner", optimized);

    startTransition(async () => {
      const res = await updateBannerAction({}, formData);
      if (res?.error || res?.fieldErrors?.banner) {
        setErrorMsg(res.error || res.fieldErrors?.banner || "Error al subir la imagen.");
        setPreviewUrl(null);
      }
    });

    e.target.value = "";
  };

  return (
    <header className="overflow-hidden rounded-2xl border border-[#e8eff8] bg-white shadow-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept={preset.allowedTypes.join(",")}
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

      {errorMsg && (
        <p className="px-4 pt-2 text-xs font-semibold text-red-600">{errorMsg}</p>
      )}

      {children}
    </header>
  );
}