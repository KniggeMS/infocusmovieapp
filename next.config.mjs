/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  devIndicators: {
    appIsrStatus: false,
  },
  // Allow host for dev server to fix HMR/WebSocket issues
  allowedDevOrigins: ['infocusmovieapp-3455.dev.appwizzy.dev'],
}

export default nextConfig