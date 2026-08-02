/** Firmas de bytes que identifican cada formato de imagen. */
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
}

/** Bytes "WEBP" que deben aparecer en offset 8 de un archivo WebP real. */
const WEBP_MARKER = [0x57, 0x45, 0x42, 0x50]

/** Bytes "RIFF" que inician un contenedor RIFF (WebP, WAV, AVI, etc.). */
const RIFF_HEADER = [0x52, 0x49, 0x46, 0x46]

const RESIZE_TIMEOUT = 5000

/** Verifica que los primeros bytes del archivo coincidan con los formatos permitidos. */
async function isRealImage(file: File, allowedTypes: readonly string[]): Promise<boolean> {
  const buffer = await file.slice(0, 12).arrayBuffer()
  const bytes = new Uint8Array(buffer)

  return allowedTypes.some((type) => {
    if (type === 'image/webp') {
      const hasRiff = RIFF_HEADER.every((byte, i) => bytes[i] === byte)
      const hasWebp = WEBP_MARKER.every((byte, i) => bytes[i + 8] === byte)
      return hasRiff && hasWebp
    }

    const signatures = MAGIC_BYTES[type]
    if (!signatures) return false
    return signatures.some((sig) =>
      sig.every((byte, i) => bytes[i] === byte)
    )
  })
}

/** Valida tipo MIME, tamaño y magic bytes de una imagen. */
export async function validateImage(file: File, config: { maxSize: number; allowedTypes: readonly string[] }): Promise<string | null> {
  if (!config.allowedTypes.includes(file.type)) {
    return 'Tipo de archivo no permitido.'
  }

  if (file.size > config.maxSize) {
    const maxKB = config.maxSize / 1024
    const label = maxKB >= 1024 ? `${(maxKB / 1024).toFixed(1)} MB` : `${maxKB} KB`
    return `El archivo supera el tamaño máximo de ${label}.`
  }

  const realImage = await isRealImage(file, config.allowedTypes)
  if (!realImage) return 'El archivo no es una imagen válida.'

  return null
}

/** Redimensiona una imagen con crop centrado y la convierte a WebP. */
export async function resizeImage(file: File, dimensions: { width: number; height: number }): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    const timer = setTimeout(() => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Tiempo agotado al procesar la imagen.'))
    }, RESIZE_TIMEOUT)

    img.onload = () => {
      clearTimeout(timer)

      const canvas = document.createElement('canvas')
      canvas.width = dimensions.width
      canvas.height = dimensions.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        URL.revokeObjectURL(img.src)
        reject(new Error('No se pudo crear el contexto del canvas.'))
        return
      }

      const ratio = Math.max(
        dimensions.width / img.width,
        dimensions.height / img.height
      )
      const cropWidth = dimensions.width / ratio
      const cropHeight = dimensions.height / ratio
      const cropX = (img.width - cropWidth) / 2
      const cropY = (img.height - cropHeight) / 2

      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, dimensions.width, dimensions.height
      )

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(img.src)
          if (blob) resolve(blob)
          else reject(new Error('Error al convertir la imagen a WebP.'))
        },
        'image/webp',
        0.85
      )
    }

    img.onerror = () => {
      clearTimeout(timer)
      URL.revokeObjectURL(img.src)
      reject(new Error('Error al cargar la imagen.'))
    }

    img.src = URL.createObjectURL(file)
  })
}