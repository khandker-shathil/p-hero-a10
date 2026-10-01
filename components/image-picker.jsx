"use client"

import { useEffect, useId, useRef, useState } from "react"
import { IMAGE_TYPES, imageError, compressImage } from "@/lib/image-upload"
import { useToast } from "@/components/toast-provider"

export function ImagePicker({
  label = "Photo (optional)",
  currentImage = "",
  kind = "profile",
}) {
  const id = useId()
  const notify = useToast()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState("")
  const [removed, setRemoved] = useState(false)
  const [compression, setCompression] = useState("")
  const selection = useRef(0)
  useEffect(
    () => () => {
      selection.current++
    },
    []
  )
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview]
  )
  const image = file ? preview : removed ? "" : currentImage
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt="Selected image"
          className="size-24 rounded-lg border object-cover"
        />
      )}
      <input
        id={id}
        name="imageFile"
        type="file"
        accept={IMAGE_TYPES}
        aria-describedby={`${id}-help`}
        className="block w-full rounded-lg border bg-background p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-2"
        onChange={async (event) => {
          const version = ++selection.current
          setCompression("")
          const selected = event.target.files?.[0]
          if (selected) {
            const error = imageError(selected)
            if (error) {
              notify(error, "error")
              event.target.value = ""
              setFile(null)
              return
            }
          }
          setPreview(selected ? URL.createObjectURL(selected) : "")
          setFile(selected || null)
          if (selected) setRemoved(false)
          if (!selected) return
          setCompression("Compressing image…")
          try {
            const compressed = await compressImage(selected, kind)
            if (version !== selection.current) return
            setPreview(URL.createObjectURL(compressed))
            const size = (bytes) =>
              `${Math.max(1, Math.round(bytes / 1024))} KB`
            setCompression(
              selected.type === "image/gif"
                ? `${size(selected.size)} · GIF preserved without compression.`
                : compressed.size < selected.size
                  ? `${size(selected.size)} → ${size(compressed.size)} · ${Math.round((1 - compressed.size / selected.size) * 100)}% smaller`
                  : `${size(selected.size)} · Original kept because it is smaller.`
            )
          } catch (error) {
            if (version !== selection.current) return
            setCompression(error.message)
            notify(error.message, "error")
          }
        }}
      />
      <input type="hidden" name="image" value={removed ? "" : currentImage} />
      <p id={`${id}-help`} className="text-xs text-muted-foreground">
        JPEG, PNG, WebP, or GIF. Maximum 5 MB.
      </p>
      <p role="status" className="text-xs text-muted-foreground">
        {compression}
      </p>
      {currentImage && !file && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={removed}
            onChange={(event) => setRemoved(event.target.checked)}
          />
          Remove current image
        </label>
      )}
    </div>
  )
}
