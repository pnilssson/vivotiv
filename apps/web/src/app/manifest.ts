import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vivotiv",
    short_name: "Vivotiv",
    description: "Free website scan for performance, SEO, accessibility, and compliance.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
  };
}
