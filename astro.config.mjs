import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import { defineConfig, squooshImageService } from "astro/config";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), mdx()],
  image: {
    service: squooshImageService()
  },
  output: "server",
  adapter: netlify()
});