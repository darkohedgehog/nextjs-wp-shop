import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => [
    { source: '/api/cart',        destination: 'https://wp.zivic-elektro.shop/wp-json/wc/store/v1/cart' },
    { source: '/api/cart/add-item', destination: 'https://wp.zivic-elektro.shop/wp-json/wc/store/v1/cart/add-item' },
  ],
  reactStrictMode: true,
    images: {
        remotePatterns: [
          {
            protocol: "http",
            hostname: "localhost",
          },
          {
            protocol: "https",
            hostname: "wp.zivic-elektro.shop",
          },
          {
            protocol: "https",
            hostname: "res.cloudinary.com",
            pathname: "/dhkmlqg4o/**",
          },
          {
            protocol: "https",
            hostname: "images.unsplash.com",
            
          },
          {
            protocol: "https",
            hostname: "assets.aceternity.com",
          },
          {
            protocol: "https",
            hostname: "api.microlink.io",
          },
        ],
      },
};

export default nextConfig;
