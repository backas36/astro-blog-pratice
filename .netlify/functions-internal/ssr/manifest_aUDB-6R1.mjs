import './chunks/astro_dSwLPcKD.mjs';

if (typeof process !== "undefined") {
  let proc = process;
  if ("argv" in proc && Array.isArray(proc.argv)) {
    if (proc.argv.includes("--verbose")) ; else if (proc.argv.includes("--silent")) ; else ;
  }
}

/**
 * Tokenize input string.
 */
function lexer(str) {
    var tokens = [];
    var i = 0;
    while (i < str.length) {
        var char = str[i];
        if (char === "*" || char === "+" || char === "?") {
            tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
            continue;
        }
        if (char === "\\") {
            tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
            continue;
        }
        if (char === "{") {
            tokens.push({ type: "OPEN", index: i, value: str[i++] });
            continue;
        }
        if (char === "}") {
            tokens.push({ type: "CLOSE", index: i, value: str[i++] });
            continue;
        }
        if (char === ":") {
            var name = "";
            var j = i + 1;
            while (j < str.length) {
                var code = str.charCodeAt(j);
                if (
                // `0-9`
                (code >= 48 && code <= 57) ||
                    // `A-Z`
                    (code >= 65 && code <= 90) ||
                    // `a-z`
                    (code >= 97 && code <= 122) ||
                    // `_`
                    code === 95) {
                    name += str[j++];
                    continue;
                }
                break;
            }
            if (!name)
                throw new TypeError("Missing parameter name at ".concat(i));
            tokens.push({ type: "NAME", index: i, value: name });
            i = j;
            continue;
        }
        if (char === "(") {
            var count = 1;
            var pattern = "";
            var j = i + 1;
            if (str[j] === "?") {
                throw new TypeError("Pattern cannot start with \"?\" at ".concat(j));
            }
            while (j < str.length) {
                if (str[j] === "\\") {
                    pattern += str[j++] + str[j++];
                    continue;
                }
                if (str[j] === ")") {
                    count--;
                    if (count === 0) {
                        j++;
                        break;
                    }
                }
                else if (str[j] === "(") {
                    count++;
                    if (str[j + 1] !== "?") {
                        throw new TypeError("Capturing groups are not allowed at ".concat(j));
                    }
                }
                pattern += str[j++];
            }
            if (count)
                throw new TypeError("Unbalanced pattern at ".concat(i));
            if (!pattern)
                throw new TypeError("Missing pattern at ".concat(i));
            tokens.push({ type: "PATTERN", index: i, value: pattern });
            i = j;
            continue;
        }
        tokens.push({ type: "CHAR", index: i, value: str[i++] });
    }
    tokens.push({ type: "END", index: i, value: "" });
    return tokens;
}
/**
 * Parse a string for the raw tokens.
 */
function parse(str, options) {
    if (options === void 0) { options = {}; }
    var tokens = lexer(str);
    var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a;
    var defaultPattern = "[^".concat(escapeString(options.delimiter || "/#?"), "]+?");
    var result = [];
    var key = 0;
    var i = 0;
    var path = "";
    var tryConsume = function (type) {
        if (i < tokens.length && tokens[i].type === type)
            return tokens[i++].value;
    };
    var mustConsume = function (type) {
        var value = tryConsume(type);
        if (value !== undefined)
            return value;
        var _a = tokens[i], nextType = _a.type, index = _a.index;
        throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
    };
    var consumeText = function () {
        var result = "";
        var value;
        while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
            result += value;
        }
        return result;
    };
    while (i < tokens.length) {
        var char = tryConsume("CHAR");
        var name = tryConsume("NAME");
        var pattern = tryConsume("PATTERN");
        if (name || pattern) {
            var prefix = char || "";
            if (prefixes.indexOf(prefix) === -1) {
                path += prefix;
                prefix = "";
            }
            if (path) {
                result.push(path);
                path = "";
            }
            result.push({
                name: name || key++,
                prefix: prefix,
                suffix: "",
                pattern: pattern || defaultPattern,
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        var value = char || tryConsume("ESCAPED_CHAR");
        if (value) {
            path += value;
            continue;
        }
        if (path) {
            result.push(path);
            path = "";
        }
        var open = tryConsume("OPEN");
        if (open) {
            var prefix = consumeText();
            var name_1 = tryConsume("NAME") || "";
            var pattern_1 = tryConsume("PATTERN") || "";
            var suffix = consumeText();
            mustConsume("CLOSE");
            result.push({
                name: name_1 || (pattern_1 ? key++ : ""),
                pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
                prefix: prefix,
                suffix: suffix,
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        mustConsume("END");
    }
    return result;
}
/**
 * Compile a string to a template function for the path.
 */
function compile(str, options) {
    return tokensToFunction(parse(str, options), options);
}
/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction(tokens, options) {
    if (options === void 0) { options = {}; }
    var reFlags = flags(options);
    var _a = options.encode, encode = _a === void 0 ? function (x) { return x; } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
    // Compile all the tokens into regexps.
    var matches = tokens.map(function (token) {
        if (typeof token === "object") {
            return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
        }
    });
    return function (data) {
        var path = "";
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (typeof token === "string") {
                path += token;
                continue;
            }
            var value = data ? data[token.name] : undefined;
            var optional = token.modifier === "?" || token.modifier === "*";
            var repeat = token.modifier === "*" || token.modifier === "+";
            if (Array.isArray(value)) {
                if (!repeat) {
                    throw new TypeError("Expected \"".concat(token.name, "\" to not repeat, but got an array"));
                }
                if (value.length === 0) {
                    if (optional)
                        continue;
                    throw new TypeError("Expected \"".concat(token.name, "\" to not be empty"));
                }
                for (var j = 0; j < value.length; j++) {
                    var segment = encode(value[j], token);
                    if (validate && !matches[i].test(segment)) {
                        throw new TypeError("Expected all \"".concat(token.name, "\" to match \"").concat(token.pattern, "\", but got \"").concat(segment, "\""));
                    }
                    path += token.prefix + segment + token.suffix;
                }
                continue;
            }
            if (typeof value === "string" || typeof value === "number") {
                var segment = encode(String(value), token);
                if (validate && !matches[i].test(segment)) {
                    throw new TypeError("Expected \"".concat(token.name, "\" to match \"").concat(token.pattern, "\", but got \"").concat(segment, "\""));
                }
                path += token.prefix + segment + token.suffix;
                continue;
            }
            if (optional)
                continue;
            var typeOfMessage = repeat ? "an array" : "a string";
            throw new TypeError("Expected \"".concat(token.name, "\" to be ").concat(typeOfMessage));
        }
        return path;
    };
}
/**
 * Escape a regular expression string.
 */
function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
/**
 * Get the flags for a regexp from the options.
 */
function flags(options) {
    return options && options.sensitive ? "" : "i";
}

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    })
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  return {
    ...serializedManifest,
    assets,
    componentMetadata,
    clientDirectives,
    routes
  };
}

const manifest = deserializeManifest({"adapterName":"@astrojs/netlify","routes":[{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/.pnpm/astro@4.0.7_typescript@5.3.3/node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.4PK_pqbL.js"}],"styles":[{"type":"external","src":"/_astro/blog.CmCzT3NY.css"}],"routeData":{"route":"/blog/[slug]","type":"page","pattern":"^\\/blog\\/([^/]+?)\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/blog/[slug].astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.4PK_pqbL.js"}],"styles":[{"type":"external","src":"/_astro/blog.CmCzT3NY.css"}],"routeData":{"route":"/blog","type":"page","pattern":"^\\/blog\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog.astro","pathname":"/blog","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/test","type":"endpoint","pattern":"^\\/api\\/test$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"test","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/test.ts","pathname":"/api/test","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/pages/blog.astro",{"propagation":"in-tree","containsHead":true}],["/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/pages/blog/[slug].astro",{"propagation":"in-tree","containsHead":true}],["/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/pages/index.astro",{"propagation":"none","containsHead":true}],["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/blog@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/blog/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var i=t=>{let e=async()=>{await(await t())()};\"requestIdleCallback\"in window?window.requestIdleCallback(e):setTimeout(e,200)};(self.Astro||(self.Astro={})).idle=i;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var r=(i,c,s)=>{let n=async()=>{await(await i())()},t=new IntersectionObserver(e=>{for(let o of e)if(o.isIntersecting){t.disconnect(),n();break}});for(let e of s.children)t.observe(e)};(self.Astro||(self.Astro={})).visible=r;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000empty-middleware":"_empty-middleware.mjs","/src/pages/blog.astro":"chunks/pages/blog_5Mjj8wIp.mjs","/node_modules/.pnpm/astro@4.0.7_typescript@5.3.3/node_modules/astro/dist/assets/endpoint/generic.js":"chunks/pages/generic_wZ2_de3E.mjs","/src/pages/api/test.ts":"chunks/pages/test_hHxfXelU.mjs","/src/pages/index.astro":"chunks/prerender__AVZYrV5.mjs","\u0000@astrojs-manifest":"manifest_aUDB-6R1.mjs","\u0000@astro-page:node_modules/.pnpm/astro@4.0.7_typescript@5.3.3/node_modules/astro/dist/assets/endpoint/generic@_@js":"chunks/generic_a0MCYPLu.mjs","\u0000@astro-page:src/pages/index@_@astro":"chunks/index_KgIXqbGW.mjs","\u0000@astro-page:src/pages/blog/[slug]@_@astro":"chunks/_slug__98TQAbof.mjs","\u0000@astro-page:src/pages/blog@_@astro":"chunks/blog_v5U-tVdm.mjs","\u0000@astro-page:src/pages/api/test@_@ts":"chunks/test_9s94PXJE.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/behind-the-scenes-with-our-artists.mdx?astroContentCollectionEntry=true":"chunks/behind-the-scenes-with-our-artists_mrrfHX_m.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/collaboration-in-music-production.md?astroContentCollectionEntry=true":"chunks/collaboration-in-music-production_S-LcEsyP.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/creating-a-successful-music-brand.md?astroContentCollectionEntry=true":"chunks/creating-a-successful-music-brand_mmwYqy26.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/gear-is-insanely-expensive.md?astroContentCollectionEntry=true":"chunks/gear-is-insanely-expensive_MX--j9rH.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/guitar-solos-are-still-awesome.md?astroContentCollectionEntry=true":"chunks/guitar-solos-are-still-awesome_xNcxj78Z.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/live-music-is-crucial.md?astroContentCollectionEntry=true":"chunks/live-music-is-crucial_1eMZC0on.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/making-a-home-studio.md?astroContentCollectionEntry=true":"chunks/making-a-home-studio_vQc7sTdL.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/the-art-of-music-production.md?astroContentCollectionEntry=true":"chunks/the-art-of-music-production_ZaBC4Uci.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/the-importance-of-audio-quality.md?astroContentCollectionEntry=true":"chunks/the-importance-of-audio-quality_4vCEZdyM.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/tune-your-snare-drum.md?astroContentCollectionEntry=true":"chunks/tune-your-snare-drum_mUO8Ln9r.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/behind-the-scenes-with-our-artists.mdx?astroPropagatedAssets":"chunks/behind-the-scenes-with-our-artists_J4Wb3jqc.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/collaboration-in-music-production.md?astroPropagatedAssets":"chunks/collaboration-in-music-production_ZhrmrOmQ.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/creating-a-successful-music-brand.md?astroPropagatedAssets":"chunks/creating-a-successful-music-brand_c07HMdC0.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/gear-is-insanely-expensive.md?astroPropagatedAssets":"chunks/gear-is-insanely-expensive_YlPdWJN-.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/guitar-solos-are-still-awesome.md?astroPropagatedAssets":"chunks/guitar-solos-are-still-awesome_0eF4ERMI.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/live-music-is-crucial.md?astroPropagatedAssets":"chunks/live-music-is-crucial_mACfInNp.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/making-a-home-studio.md?astroPropagatedAssets":"chunks/making-a-home-studio_gg3yX6YK.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/the-art-of-music-production.md?astroPropagatedAssets":"chunks/the-art-of-music-production_ItsyerBz.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/the-importance-of-audio-quality.md?astroPropagatedAssets":"chunks/the-importance-of-audio-quality_peey75qb.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/tune-your-snare-drum.md?astroPropagatedAssets":"chunks/tune-your-snare-drum_QTs-0Ktf.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/behind-the-scenes-with-our-artists.mdx":"chunks/behind-the-scenes-with-our-artists_S3ZOdNe-.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/collaboration-in-music-production.md":"chunks/collaboration-in-music-production_QEYau6ZO.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/creating-a-successful-music-brand.md":"chunks/creating-a-successful-music-brand_dV2hUQ9d.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/gear-is-insanely-expensive.md":"chunks/gear-is-insanely-expensive_MVVBXWDB.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/guitar-solos-are-still-awesome.md":"chunks/guitar-solos-are-still-awesome_jVwWbtMv.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/live-music-is-crucial.md":"chunks/live-music-is-crucial_H-pyzJR1.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/making-a-home-studio.md":"chunks/making-a-home-studio_Uzo4tAvC.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/the-art-of-music-production.md":"chunks/the-art-of-music-production_fPGPa9hL.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/the-importance-of-audio-quality.md":"chunks/the-importance-of-audio-quality_XdOroumD.mjs","/Users/huiyuanyang/Desktop/blog-code/ashi-blog/src/content/posts/tune-your-snare-drum.md":"chunks/tune-your-snare-drum_U2IefuUf.mjs","/astro/hoisted.js?q=0":"_astro/hoisted.4PK_pqbL.js","astro:scripts/before-hydration.js":""},"assets":["/_astro/record.kc3ys_j9.jpg","/_astro/gear.hUEiuUwP.jpg","/_astro/producer.S_TiAc71.jpg","/_astro/band.jCnNDT3s.jpg","/_astro/speaker.mGQbhz_J.jpg","/_astro/guitarist.fN4jHBc4.jpg","/_astro/drums.ihun2JdG.jpg","/_astro/concert.kidStR0z.jpg","/_astro/photoshoot.kt5KZL7X.jpg","/_astro/studio.Cw55MnzH.jpg","/_astro/blog.CmCzT3NY.css","/favicon.svg","/heartbeat.png","/_astro/hoisted.4PK_pqbL.js","/index.html"]});

export { manifest };
