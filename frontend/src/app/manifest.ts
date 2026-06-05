import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LinkVault",
    short_name: "LinkVault",
    description: "Developer knowledge vault — links, snippets, prompts & configs",

    start_url: "/",
    scope: "/",

    // display_override is checked first by modern browsers before falling back to display.
    // window-controls-overlay enables title bar area on desktop PWAs.
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"] as any,
    display: "standalone",
    orientation: "portrait",

    background_color: "#0f172a",
    theme_color: "#0f172a",

    categories: ["productivity", "developer-tools"],

    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],

    shortcuts: [
      {
        name: "New Snippet",
        short_name: "Snippet",
        url: "/snippets?new=1",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "New Prompt",
        short_name: "Prompt",
        url: "/prompts?new=1",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Search",
        short_name: "Search",
        url: "/search",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
