import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
};
// next.config.js
// const nextConfig = {
//   compiler: {
//     removeConsole: process.env.NODE_ENV === 'production',
//   },
// };

module.exports = nextConfig;


export default nextConfig;
