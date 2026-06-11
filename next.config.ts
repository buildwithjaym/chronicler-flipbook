import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["canvas", "sharp", "pdfjs-dist"],
}

export default nextConfig