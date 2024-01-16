import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

import icon from "astro-icon";
import { defineConfig, squooshImageService } from "astro/config";

// https://astro.build/config
export default defineConfig({
    integrations: [
        tailwind({
            nesting: true,
        }),
        mdx(),
        icon(),
        sitemap(),
    ],
    //image: {
    //  service: squooshImageService()
    //},
    output: "server",
    adapter: netlify(),
});
