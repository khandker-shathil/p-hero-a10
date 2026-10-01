export const IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif"

export function imageError(file) {
  if (!file?.size) return "Choose an image."
  if (!IMAGE_TYPES.split(",").includes(file.type))
    return "Choose a JPEG, PNG, WebP, or GIF image."
  if (file.size > 5 * 1024 * 1024) return "Images must be 5 MB or smaller."
  return ""
}

const preparedImages = new WeakMap()

export function compressImage(file, kind = "profile") {
  const error = imageError(file)
  if (error) return Promise.reject(new Error(error))
  if (file.type === "image/gif") return Promise.resolve(file)
  let presets = preparedImages.get(file)
  if (!presets) {
    presets = new Map()
    preparedImages.set(file, presets)
  }
  if (!presets.has(kind)) {
    const pending = import("browser-image-compression")
      .then(async ({ default: compress }) => {
        const result = await compress(file, {
          maxSizeMB: kind === "lesson" ? 1 : 200 / 1024,
          maxWidthOrHeight: kind === "lesson" ? 1920 : 512,
          useWebWorker: false,
          fileType: "image/webp",
          initialQuality: 0.8,
        })
        return result.size < file.size ? result : file
      })
      .catch(() => {
        presets.delete(kind)
        throw new Error(
          "Couldn’t compress this image. Please select another image or try again."
        )
      })
    presets.set(kind, pending)
  }
  return presets.get(kind)
}

export async function uploadImage(file, kind = "profile") {
  const compressed = await compressImage(file, kind)
  const response = await fetch("/api/images", {
    method: "POST",
    headers: { "Content-Type": compressed.type },
    body: compressed,
    signal: AbortSignal.timeout(45000),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok)
    throw new Error(data.error || "Image upload failed. Please try again.")
  return data.url
}
