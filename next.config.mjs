import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactCompiler: true,
  devIndicators: false,
};

export default nextConfig;