import { Bytes, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { IMAGE_TYPES, imageMarkdown } from "@/hooks/timer/shared";

// Images are stored in Firestore (Spark plan has no Cloud Storage), one doc per
// image: images/{id} = { owner, type, data: Bytes, width, height, createdAt }.
// The id is random and unguessable; anyone with it can read the image (share links).
// ponytail: removing an image line or task leaves its doc behind (counts toward the
// 1 GiB free quota). Add a cleanup that deletes the owner's unreferenced ids if that bites.

/** Long edge cap. 2560px stays sharp at full width on retina screens. */
const MAX_EDGE = 2560;
/** Firestore docs cap at 1 MiB; leave room for the other fields. */
const MAX_BYTES = 900_000;

function encode(bmp: ImageBitmap, scale: number, type: string, quality: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((ok, fail) =>
    canvas.toBlob((b) => (b ? ok(b) : fail(new Error("Couldn't encode the image."))), type, quality),
  );
}

/**
 * Visually lossless: downscale to MAX_EDGE, then WebP at q0.9 (JPEG where the
 * browser can't encode WebP). Keeps the original file when that's smaller.
 * Steps quality down, then size, only if still over the Firestore cap.
 */
export async function compressImage(file: File) {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  let scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
  let quality = 0.9;
  try {
    for (;;) {
      let blob = await encode(bmp, scale, "image/webp", quality);
      if (blob.type !== "image/webp") blob = await encode(bmp, scale, "image/jpeg", quality); // Safari
      let [width, height] = [Math.round(bmp.width * scale), Math.round(bmp.height * scale)];
      if (IMAGE_TYPES.includes(file.type) && file.size <= blob.size && file.size <= MAX_BYTES) {
        [blob, width, height] = [file, bmp.width, bmp.height];
      }
      if (blob.size <= MAX_BYTES) return { blob, width, height };
      if (quality > 0.75) quality -= 0.1;
      else scale *= 0.8;
    }
  } finally {
    bmp.close();
  }
}

/** Compresses + uploads an image; returns the Markdown line to put in the note. */
export async function uploadTaskImage(file: File, uid: string): Promise<string> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") throw new Error("Only image files.");
  const { blob, width, height } = await compressImage(file);
  const id = crypto.randomUUID().replaceAll("-", "");
  await setDoc(doc(db, "images", id), {
    owner: uid,
    type: blob.type,
    data: Bytes.fromUint8Array(new Uint8Array(await blob.arrayBuffer())),
    width,
    height,
    createdAt: Date.now(),
  });
  return imageMarkdown(file.name.replace(/\.[^.]+$/, "") || "image", `/img/${id}`);
}
