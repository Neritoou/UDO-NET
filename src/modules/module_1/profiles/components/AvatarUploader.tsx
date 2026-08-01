'use client'

import { useRef, useState, useTransition, type ChangeEvent } from 'react'
import { IMAGE_PRESETS, resizeImage, validateImage } from '@/lib/storage/client'
import { UDO_STYLES } from '../../theme'
import { deleteAvatarAction, updateAvatarAction } from '../actions/profile.actions'
import { INITIAL_PROFILE_STATE, type ProfileFormState } from '../types'

/**
 * Selector de foto de perfil.
 *
 * La imagen se valida y se convierte a WebP en el navegador antes de enviarla,
 * de modo que el Server Action reciba un archivo ya recortado y liviano.
 */
export function AvatarUploader({
  avatarUrl,
  username,
}: {
  avatarUrl: string | null
  username: string
}) {
  const [state, setState] = useState<ProfileFormState>(INITIAL_PROFILE_STATE)
  const [preview, setPreview] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const preset = IMAGE_PRESETS.avatar
  const currentAvatar = preview ?? avatarUrl ?? preset.defaultUrl

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setState(INITIAL_PROFILE_STATE)

    const validationError = await validateImage(file, preset)
    if (validationError) {
      setState({ fieldErrors: { avatar: validationError } })
      event.target.value = ''
      return
    }

    let optimized: File
    try {
      const blob = await resizeImage(file, preset.dimensions)
      optimized = new File([blob], 'avatar.webp', { type: 'image/webp' })
    } catch {
      setState({ fieldErrors: { avatar: 'No se pudo procesar la imagen.' } })
      event.target.value = ''
      return
    }

    const formData = new FormData()
    formData.append('avatar', optimized)

    startTransition(async () => {
      const result = await updateAvatarAction(INITIAL_PROFILE_STATE, formData)
      setState(result)
      if (result.message) setPreview(URL.createObjectURL(optimized))
    })

    event.target.value = ''
  }

  const handleDelete = () => {
    setState(INITIAL_PROFILE_STATE)

    startTransition(async () => {
      const result = await deleteAvatarAction()
      setState(result)
      if (result.message) setPreview(preset.defaultUrl)
    })
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[#e8eff8] bg-[#f9fafb] p-5">
      {/* Se usa <img> porque la URL del avatar depende del proyecto de Supabase configurado. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentAvatar}
        alt={`Foto de perfil de ${username}`}
        className="h-24 w-24 rounded-full border-4 border-white bg-white object-cover shadow-sm"
      />

      <input
        ref={inputRef}
        type="file"
        accept={preset.allowedTypes.join(',')}
        onChange={handleFileChange}
        disabled={isPending}
        className="hidden"
        aria-label="Seleccionar foto de perfil"
      />

      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#6b7280]"
        >
          {isPending ? 'Subiendo...' : 'Cambiar foto'}
        </button>

        {avatarUrl ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-full border border-[#e8eff8] bg-[#e8eff8] px-4 py-2 text-sm font-semibold text-[#0f2748] transition-all duration-200 hover:opacity-80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Quitar
          </button>
        ) : null}
      </div>

      <p className="text-center text-xs text-[#6b7280]">
        JPG, PNG o WebP · máximo {preset.maxSize / 1024} KB
      </p>

      {state.fieldErrors?.avatar ? (
        <p role="alert" className={UDO_STYLES.fieldError}>
          {state.fieldErrors.avatar}
        </p>
      ) : null}

      {state.error ? (
        <p role="alert" className={UDO_STYLES.fieldError}>
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p role="status" className="text-xs font-medium text-green-700">
          {state.message}
        </p>
      ) : null}
    </div>
  )
}
