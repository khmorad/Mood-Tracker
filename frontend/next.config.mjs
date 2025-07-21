/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/users/me",
        destination: "http://localhost:8000/users/me",
      },
    ];
  },
};

export default nextConfig;
