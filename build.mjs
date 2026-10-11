/* Builds the static site from content.json.
   Run: node build.mjs      Output: dist/
   No dependencies. Node 18 or later. */

import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const C = JSON.parse(readFileSync("content.json", "utf8"));
const OUT = "dist";
const SITE = C.site.url.replace(/\/$/, "");

const e = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const NAV = [
  { label: "home", href: "/" },
  { label: "girls run the world", href: "/girls-run-the-world/" },
  { label: "the network", href: "/the-network/" },
  { label: "our story", href: "/our-story/" },
  { label: "get involved", href: "/get-involved/" },
  { label: "blog", href: "/blog/" },
];

const markRule = `<div class="mark-rule" aria-hidden="true"><span></span><span></span><span></span><span></span></div>`;

const heroMark = `<img class="hero-mark" src="/img/logo-mark.webp" width="512" height="512" alt="" aria-hidden="true" decoding="async">`;

const picture = (name, alt, cls = "", lazy = true) =>
  `<img src="/img/${name}-lg.webp" srcset="/img/${name}-sm.webp 640w, /img/${name}-lg.webp 1280w" sizes="(max-width: 52rem) 90vw, 40rem" alt="${e(alt)}"${cls ? ` class="${cls}"` : ""} loading="${lazy ? "lazy" : "eager"}" decoding="async">`;

function head(page) {
  const title = page.path === "/" ? `${C.site.name} — ${C.site.tagline}` : `${page.title} — ${C.site.name}`;
  const desc = page.description || C.site.description;
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title>
<meta name="description" content="${e(desc)}">
<link rel="canonical" href="${SITE}${page.path}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_AU">
<meta property="og:site_name" content="${e(C.site.name)}">
<meta property="og:title" content="${e(title)}">
<meta property="og:description" content="${e(desc)}">
<meta property="og:url" content="${SITE}${page.path}">
<meta property="og:image" content="${SITE}/img/logo-mark.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#6e31b3">
<link rel="icon" href="/img/logo-mark.png" type="image/png">
<link rel="apple-touch-icon" href="/img/logo-mark.png">
<link rel="preload" href="/fonts/poppins-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/poppins-300.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/fonts/fonts.css">
<link rel="stylesheet" href="/styles.css">
${page.schema ? `<script type="application/ld+json">${JSON.stringify(page.schema)}</script>` : ""}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="masthead">
  <div class="wrap">
    <a class="brand" href="/" aria-label="${e(C.site.name)}, home">
      <img src="/img/logo-inline.webp" width="600" height="216" alt="${e(C.site.name)}">
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav">menu</button>
    <nav class="nav" id="nav" aria-label="Primary">
      <ul>${NAV.map(
        (n) =>
          `<li><a href="${n.href}"${n.href === page.path ? ' aria-current="page"' : ""}>${e(n.label)}</a></li>`
      ).join("")}</ul>
    </nav>
  </div>
</header>
<main id="main">`;
}

function foot() {
  const social = Object.entries(C.site.social)
    .map(([k, v]) => `<li><a href="${e(v)}" rel="me noopener">${e(k)}</a></li>`)
    .join("");
  return `</main>
<footer class="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <img class="footer-mark" src="/img/logo-mark.webp" width="512" height="512" alt="" loading="lazy">
        <h2>${e(C.site.tagline)}</h2>
        <p>${e(C.site.description)}</p>
        <p><a href="mailto:${e(C.site.email)}">${e(C.site.email)}</a></p>
      </div>
      <div>
        <h3>pages</h3>
        <ul>${NAV.map((n) => `<li><a href="${n.href}">${e(n.label)}</a></li>`).join("")}</ul>
      </div>
      <div>
        <h3>follow</h3>
        <ul>${social}</ul>
        <h3 style="margin-top:1.75rem">policies</h3>
        <ul>
          <li><a href="/child-safety/">child safety</a></li>
          ${C.privacy.published ? `<li><a href="/privacy/">privacy</a></li>` : ""}
        </ul>
      </div>
    </div>
    <p class="acknowledgement">${e(C.site.acknowledgement)}</p>
    <div class="colophon">
      <span>&copy; ${new Date().getFullYear()} ${e(C.site.name)}</span>
      <span>Canberra, Australia</span>
    </div>
  </div>
</footer>
<script>
  var t = document.querySelector(".nav-toggle"), n = document.getElementById("nav");
  t && t.addEventListener("click", function () {
    var open = n.getAttribute("data-open") === "true";
    n.setAttribute("data-open", String(!open));
    t.setAttribute("aria-expanded", String(!open));
  });
</script>
</body>
</html>`;
}

function write(path, html) {
  const file = path === "/" ? join(OUT, "index.html") : join(OUT, path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

/* ----------------------------------------------------------------- pages */

function registrationBlock() {
  const r = C.registration;
  const statusText = { open: "registrations open", closed: "registrations closed", soon: "opening soon" }[r.status] || r.status;
  return `<section><div class="wrap"><div class="reg">
    <span class="status status-${e(r.status)}">${e(statusText)}</span>
    <h2>${e(r.heading)}</h2>
    <p>${e(r.body)}</p>
    ${r.ctaEnabled ? `<div class="btn-row"><a class="btn" href="${e(r.ctaUrl)}">${e(r.ctaLabel)}</a><a class="btn btn-ghost" href="/get-involved/">other ways to get involved</a></div>` : ""}
    ${r.secondaryNote ? `<p class="note">${e(r.secondaryNote)}</p>` : ""}
  </div></div></section>`;
}

function homePage() {
  const h = C.home;
  const schema = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: C.site.name,
    alternateName: C.site.shortName,
    url: SITE,
    logo: `${SITE}/img/logo-inline.png`,
    email: C.site.email,
    slogan: C.site.tagline,
    description: C.site.description,
    foundingDate: "2017",
    areaServed: { "@type": "AdministrativeArea", name: "Australian Capital Territory" },
    address: { "@type": "PostalAddress", addressLocality: "Canberra", addressRegion: "ACT", addressCountry: "AU" },
    sameAs: Object.values(C.site.social),
  };

  const body = `
<section class="hero">
  ${heroMark}
  <div class="wrap">
    <h1>${e(h.heroHeading)}</h1>
    <p class="lede">${e(h.heroBody)}</p>
    <div class="btn-row">
      <a class="btn" href="${e(C.registration.ctaUrl)}">${e(h.heroPrimaryLabel)}</a>
      <a class="btn btn-ghost" href="#program">${e(h.heroSecondaryLabel)}</a>
    </div>
  </div>
</section>

<div class="wrap"><div class="stats">
  ${h.stats.map((s) => `<div><b>${e(s.figure)}</b><span>${e(s.label)}</span></div>`).join("")}
</div></div>

${registrationBlock()}

<section class="band" id="program"><div class="wrap">
  ${markRule}
  <h2>${e(h.introHeading)}</h2>
  <p class="lede">${e(h.introBody)}</p>
  <div class="cols" style="margin-top:3.5rem">
    ${h.columns
      .map(
        (c) => `<div>
      <h3>${e(c.heading)}</h3>
      <p>${e(c.body)}</p>
      <ul class="ticks">${c.items.map((i) => `<li>${e(i)}</li>`).join("")}</ul>
    </div>`
      )
      .join("")}
  </div>
</div></section>

<section><div class="wrap">
  ${markRule}
  <h2>${e(h.galleryHeading)}</h2>
  <div class="gallery">
    ${h.gallery.map((g, i) => `<figure>${picture(g.img, g.alt, "", i > 0)}</figure>`).join("")}
  </div>
</div></section>

<section class="band"><div class="wrap">
  ${markRule}
  <h2>${e(h.testimonialsHeading)}</h2>
  <div class="quotes" style="margin-top:2.5rem">
    ${h.testimonials
      .map((t) => `<blockquote><p>${e(t.quote)}</p><cite>${e(t.name)}</cite></blockquote>`)
      .join("")}
  </div>
</div></section>

<section><div class="wrap">
  ${markRule}
  <h2>${e(h.sponsorsHeading)}</h2>
  <p>${e(h.sponsorsBody)}</p>
  <div class="sponsors">
    ${h.sponsors
      .map(
        (s) =>
          s.url
            ? `<a href="${e(s.url)}" rel="noopener"><img src="/img/${s.img}.webp" alt="${e(s.name)}" loading="lazy"></a>`
            : `<img src="/img/${s.img}.webp" alt="${e(s.name)}" loading="lazy">`
      )
      .join("")}
  </div>
</div></section>`;

  return head({ path: "/", title: C.site.name, description: C.site.description, schema }) + body + foot();
}

function ourStoryPage() {
  const p = C.ourStory;
  const body = `<section><div class="narrow prose">
    ${markRule}
    <h1>${e(p.heading)}</h1>
    ${p.body.map((t, i) => `<p${i === 0 ? ' class="lede"' : ""}>${e(t)}</p>`).join("")}
    <h2>${e(p.mediaHeading)}</h2>
    <ul class="linklist">
      ${p.media
        .map(
          (m) =>
            `<li><a href="${e(m.url)}" rel="noopener">${e(m.title)}</a><span>${e(m.source)}</span></li>`
        )
        .join("")}
    </ul>
  </div></section>`;
  return head({ path: "/our-story/", title: p.title, description: "How the Girls Leadership Network started in Canberra, and the people who built it." }) + body + foot();
}

function networkPage() {
  const p = C.theNetwork;
  const body = `<section><div class="narrow prose">
    ${markRule}
    <h1>${e(p.heading)}</h1>
    <p class="lede">${e(p.intro)}</p>
    <div class="quotes" style="columns:1;margin-top:2.5rem">
      ${p.reasons.map((r) => `<blockquote><p>${e(r)}</p></blockquote>`).join("")}
    </div>
    <h2>${e(p.teamHeading)}</h2>
    <p>${e(p.teamNote)}</p>
    <ul class="team">${p.team.map((t) => `<li>${e(t)}</li>`).join("")}</ul>
  </div></section>`;
  return head({ path: "/the-network/", title: p.title, description: "The girls, alumni and volunteers who make up the Girls Leadership Network." }) + body + foot();
}

function grtwPage() {
  const p = C.grtw;
  const body = `<section><div class="wrap">
    ${markRule}
    <img src="/img/grtw-logo.webp" alt="Girls Run the World" width="600" height="248" style="width:min(340px,70%);margin-bottom:2rem">
    <h1>${e(p.heading)}</h1>
    <p class="lede">${e(p.intro)}</p>
    ${p.body.map((t) => `<p>${e(t)}</p>`).join("")}
    <div class="btn-row"><a class="btn" href="${e(p.url)}" rel="noopener">visit the Girls Run the World site</a></div>
    <div class="imgrow">${p.images.map((i) => `<figure style="margin:0">${picture(i.img, i.alt)}</figure>`).join("")}</div>
  </div></section>
  <section class="band"><div class="narrow prose">
    <h2>${e(p.goalsHeading)}</h2>
    <ul class="ticks">${p.goals.map((g) => `<li>${e(g)}</li>`).join("")}</ul>
    <h2>${e(p.hanHeading)}</h2>
    <p>${e(p.hanBody)}</p>
    <p><a href="${e(p.hanLinkUrl)}" rel="noopener">${e(p.hanLinkLabel)}</a></p>
  </div></section>`;
  return head({ path: "/girls-run-the-world/", title: p.title, description: p.intro }) + body + foot();
}

function getInvolvedPage() {
  const p = C.getInvolved;
  const body = `<section><div class="wrap">
    ${markRule}
    <h1>${e(p.heading)}</h1>
    <p class="lede">${e(p.intro)}</p>
  </div></section>
  <section><div class="wrap"><div class="ways">
    ${p.ways
      .map(
        (w) => `<div>
      <h2>${e(w.heading)}</h2>
      <p>${e(w.body)}</p>
      <ul class="ticks">${w.items.map((i) => `<li>${e(i)}</li>`).join("")}</ul>
      <div class="btn-row"><a class="btn" href="${e(w.ctaUrl)}">${e(w.ctaLabel)}</a></div>
    </div>`
      )
      .join("")}
  </div>
  <p class="lede">${e(p.closing)}</p>
  </div></section>`;
  return head({ path: "/get-involved/", title: p.title, description: p.intro }) + body + foot();
}

function blogIndexPage() {
  const p = C.blog;
  const body = `<section><div class="narrow prose">
    ${markRule}
    <h1>${e(p.heading)}</h1>
    <p class="lede">${e(p.intro)}</p>
    <ul class="linklist">
      ${p.posts
        .map(
          (post) =>
            `<li><a href="/blog/${e(post.slug)}/">${e(post.title)}</a><span>${e(post.episode)}, ${e(post.dateLabel)}. ${e(post.summary)}</span></li>`
        )
        .join("")}
    </ul>
  </div></section>`;
  return head({ path: "/blog/", title: p.title, description: p.intro }) + body + foot();
}

function postPage(post) {
  const path = `/blog/${post.slug}/`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "NGO", name: C.site.name },
    mainEntityOfPage: `${SITE}${path}`,
  };
  const body = `<section><div class="narrow prose">
    ${markRule}
    <h1>${e(post.title)}</h1>
    <p class="meta">${e(post.episode)} &middot; ${e(post.dateLabel)} &middot; ${e(post.author)}</p>
    ${post.body.map((t, i) => `<p${i === 0 ? ' class="lede"' : ""}>${e(t)}</p>`).join("")}
    <div class="btn-row"><a class="btn" href="${e(post.listenUrl)}" rel="noopener">listen to the episode</a></div>
    <h2>links from this episode</h2>
    <ul class="linklist">${post.links.map((l) => `<li><a href="${e(l.url)}" rel="noopener">${e(l.label)}</a></li>`).join("")}</ul>
    <p style="margin-top:2.5rem"><a href="/blog/">back to all episodes</a></p>
  </div></section>`;
  return head({ path, title: post.title, description: post.summary, schema }) + body + foot();
}

function policyPage(p, path) {
  const body = `<section><div class="narrow prose">
    ${markRule}
    <h1>${e(p.heading)}</h1>
    ${p.updated ? `<p class="meta">${e(p.updated)}</p>` : ""}
    <p class="lede">${e(p.intro)}</p>
    ${p.sections
      .map(
        (s) => `<h2>${e(s.heading)}</h2><ul>${s.items.map((i) => `<li>${e(i)}</li>`).join("")}</ul>`
      )
      .join("")}
    <p style="margin-top:2.5rem">Questions about this page? Email <a href="mailto:${e(C.site.email)}">${e(C.site.email)}</a>.</p>
  </div></section>`;
  return head({ path, title: p.title, description: p.intro }) + body + foot();
}

function notFoundPage() {
  const body = `<section><div class="narrow prose">
    ${markRule}
    <h1>that page has moved</h1>
    <p class="lede">The page you were after is not here any more. Everything on the site is one click away below.</p>
    <div class="btn-row"><a class="btn" href="/">go to the home page</a><a class="btn btn-ghost" href="/get-involved/">get involved</a></div>
  </div></section>`;
  return head({ path: "/404", title: "page not found" }) + body + foot();
}

/* ------------------------------------------------------------------ run */

if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });
cpSync("public", OUT, { recursive: true });
cpSync("src/styles.css", join(OUT, "styles.css"));

write("/", homePage());
write("/our-story/", ourStoryPage());
write("/the-network/", networkPage());
write("/girls-run-the-world/", grtwPage());
write("/get-involved/", getInvolvedPage());
write("/blog/", blogIndexPage());
write("/child-safety/", policyPage(C.childSafety, "/child-safety/"));
if (C.privacy.published) write("/privacy/", policyPage(C.privacy, "/privacy/"));
for (const post of C.blog.posts) write(`/blog/${post.slug}/`, postPage(post));
writeFileSync(join(OUT, "404.html"), notFoundPage());

const urls = [
  "/",
  "/girls-run-the-world/",
  "/the-network/",
  "/our-story/",
  "/get-involved/",
  "/blog/",
  ...C.blog.posts.map((p) => `/blog/${p.slug}/`),
  "/child-safety/",
  ...(C.privacy.published ? ["/privacy/"] : []),
];
writeFileSync(
  join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE}${u}</loc></url>`)
    .join("\n")}\n</urlset>\n`
);
writeFileSync(join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Built ${urls.length + 1} pages into ${OUT}/`);
