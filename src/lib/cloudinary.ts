/**
 * Cloudinary URL building (public, no SDK) and upload signing (server only).
 *
 * We store `public_id` in Postgres rather than a full URL, so the delivery
 * transform is decided at render time. That is what keeps the free tier viable:
 * `f_auto,q_auto` serves AVIF/WebP where supported, and an explicit width stops
 * a 4000px phone photo being shipped to a 400px card.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME);
}

/**
 * Delivery URL for an image.
 * @param publicId Cloudinary public_id (no extension)
 * @param width    Target CSS width in px; Cloudinary caps the delivered pixels.
 */
export function cldImage(publicId: string, width = 600): string {
  if (!CLOUD_NAME) return "";
  const t = [`f_auto`, `q_auto`, `c_limit`, `w_${width}`, `dpr_auto`].join(",");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${t}/${publicId}`;
}

/**
 * Delivery URL for a video. `vc_auto` picks the codec per browser; without it
 * Cloudinary serves the original upload and the bandwidth credits vanish fast.
 */
export function cldVideo(publicId: string, width = 720): string {
  if (!CLOUD_NAME) return "";
  const t = [`f_auto`, `q_auto`, `vc_auto`, `c_limit`, `w_${width}`].join(",");
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${t}/${publicId}`;
}

/** Poster frame for a video, so the tile paints without loading the video. */
export function cldVideoPoster(publicId: string, width = 720): string {
  if (!CLOUD_NAME) return "";
  const t = [`f_auto`, `q_auto`, `c_limit`, `w_${width}`, `so_0`].join(",");
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${t}/${publicId}.jpg`;
}

/** Low-quality placeholder used as the blur-up for images. ~300 bytes. */
export function cldBlur(publicId: string): string {
  if (!CLOUD_NAME) return "";
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto:low,w_24,e_blur:200/${publicId}`;
}
