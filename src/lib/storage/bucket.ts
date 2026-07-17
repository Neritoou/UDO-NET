import { createClient } from '@/lib/db/server'
import { IMAGE_PRESETS, type ImagePreset } from './presets'

const BUCKET = 'images'

/** Sube una imagen al bucket de Supabase Storage usando un preset. */
export async function uploadImage(preset: ImagePreset, id: string, fileData: Buffer): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()
  const config = IMAGE_PRESETS[preset]
  const fullPath = `${config.path(id)}.webp`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fullPath, fileData, {
      contentType: 'image/webp',
      upsert: true,
    })

  if (error) return { error: 'No se pudo subir el archivo.' }

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fullPath)

  return { url: data.publicUrl }
}

/** Reemplaza una imagen existente. Usa upsert para sobreescribir. */
export async function replaceImage(preset: ImagePreset, id: string,fileData: Buffer): Promise<{ url: string } | { error: string }> {
    return uploadImage(preset, id, fileData)}

/** Elimina una imagen específica del bucket usando un preset. */
export async function deleteImage(preset: ImagePreset, id: string): Promise<boolean> {
  const supabase = await createClient()
  const config = IMAGE_PRESETS[preset]
  const fullPath = `${config.path(id)}.webp`

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([fullPath])

  if (error) return false
  return true
}

/** Elimina todos los archivos de una entidad del bucket. */
export async function deleteFolder(folder: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(folder)

  if (listError || !files?.length) return true

  const paths = files.map((file) => `${folder}/${file.name}`)

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove(paths)

  if (error) return false
  return true
}