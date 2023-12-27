import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import tailwind from "@astrojs/tailwind";

import { defineConfig, squooshImageService } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), mdx()],
  //image: {
  //  service: squooshImageService()
  //},
  output: "hybrid",
  adapter: netlify(),
});
