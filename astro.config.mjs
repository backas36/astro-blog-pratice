import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

import { defineConfig, squooshImageService } from "astro/config";

// https://astro.build/config
export default defineConfig({
    integrations: [
        tailwind({
            nesting: true,
        }),
        mdx(),
        sitemap(),
    ],
    //image: {
    //  service: squooshImageService()
    //},
    output: "server",
    adapter: netlify(),
});
