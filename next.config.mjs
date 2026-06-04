/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow remote AI-generated avatar images (Hugging Face, etc.)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
