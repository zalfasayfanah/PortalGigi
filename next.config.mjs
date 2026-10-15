/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/masuk",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
