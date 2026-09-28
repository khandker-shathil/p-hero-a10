const apiServer = (
  process.env.API_SERVER_URL || "http://localhost:5005"
).replace(/\/$/, "")

const nextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiServer}/api/:path*` }]
  },
}

export default nextConfig
