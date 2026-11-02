import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Stare engleske adrese → srpske
  async redirects() {
    return [
      ["/login", "/prijava"],
      ["/register", "/registracija"],
      ["/forgot-password", "/zaboravljena-lozinka"],
      ["/reset-password", "/nova-lozinka"],
      ["/dashboard/settings", "/moj-ormar/podesavanja"],
      ["/dashboard", "/moj-ormar"],
      ["/messages/:path*", "/poruke/:path*"],
      ["/listings/new", "/oglasi/novi"],
      ["/listings/:id/edit", "/oglasi/:id/uredi"],
      ["/listings/:id", "/oglasi/:id"],
      ["/users/:id", "/korisnici/:id"],
    ].map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
