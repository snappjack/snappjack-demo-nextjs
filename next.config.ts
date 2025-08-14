import type { NextConfig } from "next";
import path from "path";

// this is needed to make the sdk work when it is linked locally instead of installed as a dependency
module.exports = {
  turbopack: {
    root: path.join(__dirname, '..'), // Adjust this path according to your project structure
  },
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
