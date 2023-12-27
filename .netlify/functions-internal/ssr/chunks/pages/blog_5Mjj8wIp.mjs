/* empty css                         */
import { e as createAstro, f as createComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, i as renderComponent } from '../astro_dSwLPcKD.mjs';
import { $ as $$Image, g as getCollection, a as $$MainContent, b as $$Heading1, c as $$Layout } from './_slug__n2KqeWwU.mjs';

const $$Astro$2 = createAstro();
const $$Post = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Post;
  const { post } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<article class=""> <a${addAttribute(`/blog/${post.slug}`, "href")}> ${renderComponent($$result, "Image", $$Image, { "src": post.data.image, "width": 600, "height": 600 / 1.5, "alt": post.data.title, "class": "rounded-2xl shadow-xl mb-4 aspect-thumbnail object-cover" })}</a> <a${addAttribute(`/blog/${post.slug}`, "href")} class="text-4xl text-zinc-900 font-semibold inline-block"> <h2>${post.data.title}</h2></a> <p class="text-zinc-500 text-2xl line-clamp-2"> ${post.body} </p> </article>`;
}, "/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/components/Post.astro", void 0);

const $$Astro$1 = createAstro();
const $$PostList = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$PostList;
  const { posts } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="grid grid-cols-2 gap-x-16 gap-y-14 max-md:grid-cols-1 mb-24"> ${posts.map((p) => renderTemplate`${renderComponent($$result, "Post", $$Post, { "post": p })}`)} </div>`;
}, "/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/components/PostList.astro", void 0);

const $$Astro = createAstro();
const $$Blog = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Blog;
  const posts = await getCollection("posts");
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Blog | Ashi" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "MainContent", $$MainContent, {}, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "Heading1", $$Heading1, { "text": "Blog Page" })} ${posts.map((p) => renderTemplate`${renderComponent($$result3, "PostList", $$PostList, { "posts": posts })}`)}` })} ` })}`;
}, "/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/pages/blog.astro", void 0);

const $$file = "/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/pages/blog.astro";
const $$url = "/blog";

export { $$Blog as default, $$file as file, $$url as url };
