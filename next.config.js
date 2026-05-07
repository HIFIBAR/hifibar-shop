/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/Images/CartesTV/:filename*',
        destination: 'https://res.cloudinary.com/dopjvshmm/image/upload/CartesTV/:filename*',
        permanent: true,
      }
    ];
  }
};
module.exports = nextConfig;