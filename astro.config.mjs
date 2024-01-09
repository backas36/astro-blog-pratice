import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import tailwind from "@astrojs/tailwind";
import { defineConfig, squooshImageService } from "astro/config";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    integrations: [tailwind(), mdx(), sitemap()],
    //image: {
    //  service: squooshImageService()
    //},
    output: "server",
    adapter: netlify(),
});
