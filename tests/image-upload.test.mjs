import { test, mock } from "node:test"
import assert from "node:assert/strict"
import { compressImage, uploadImage } from "../lib/image-upload.js"

test("compression presets, caching, fallback, GIF preservation and upload body", async () => {
  const calls = []
  let output = new File([new Uint8Array(100)], "compressed.webp", {
    type: "image/webp",
  })
  let fail = false
  const compression = mock.module("browser-image-compression", {
    exports: {
      default: async (file, options) => {
        calls.push(options)
        if (fail) throw new Error("decode failed")
        return output
      },
    },
  })
  const originalFetch = globalThis.fetch
  const input = () =>
    new File([new Uint8Array(1000)], "photo.jpg", { type: "image/jpeg" })
  try {
    const photo = input()
    assert.equal(await compressImage(photo), output)
    assert.equal(await compressImage(photo), output)
    assert.equal(calls.length, 1)
    assert.equal(calls[0].maxWidthOrHeight, 512)
    assert.equal(calls[0].maxSizeMB, 200 / 1024)
    await compressImage(photo, "lesson")
    assert.equal(calls[1].maxWidthOrHeight, 1920)
    assert.equal(calls[1].maxSizeMB, 1)
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "/api/images")
      assert.equal(options.body, output)
      assert.equal(options.headers["Content-Type"], "image/webp")
      return Response.json({ url: "https://i.ibb.co/test/image.webp" })
    }
    assert.equal(await uploadImage(photo), "https://i.ibb.co/test/image.webp")
    const gif = new File(["gif"], "animated.gif", { type: "image/gif" })
    assert.equal(await compressImage(gif), gif)
    assert.equal(calls.length, 2)
    output = new File([new Uint8Array(2000)], "larger.webp", {
      type: "image/webp",
    })
    const small = input()
    assert.equal(await compressImage(small), small)
    fail = true
    const retry = input()
    await assert.rejects(compressImage(retry), /Couldn’t compress/)
    fail = false
    assert.equal(await compressImage(retry), retry)
    await assert.rejects(
      compressImage(new File(["svg"], "image.svg", { type: "image/svg+xml" })),
      /Choose a JPEG/
    )
  } finally {
    globalThis.fetch = originalFetch
    compression.restore()
  }
})
