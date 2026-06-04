/** @type {import('next').NextConfig} */
const nextConfig = {
  // Migrated off static export (`output: 'export'`) to Vercel so route handlers,
  // ISR and next/og work (see plan U1). Image optimization is on; every external
  // image host a widget loads must be listed here or next/image returns 500.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co" }, // Spotify album art
      { protocol: "https", hostname: "image-cdn-ak.spotifycdn.com" },
      { protocol: "https", hostname: "image-cdn-fa.spotifycdn.com" },
      { protocol: "https", hostname: "assets.hardcover.app" }, // Hardcover covers
      { protocol: "https", hostname: "images.hardcover.app" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" }, // Goodreads covers
      { protocol: "https", hostname: "i.gr-assets.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" }, // GitHub avatars
      { protocol: "https", hostname: "*.cdninstagram.com" }, // Instagram media
      { protocol: "https", hostname: "*.fbcdn.net" },
    ],
  },
};

module.exports = nextConfig;
