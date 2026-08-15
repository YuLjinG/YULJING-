import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the three portfolio routes", async () => {
  const pages = [
    ["/", /Exploring visual possibilities\./],
    ["/graphic", /品牌VI设计/],
    ["/photo", /产品拍摄/],
  ];

  for (const [pathname, pageContent] of pages) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();
    assert.match(html, /<title>YuLjinG — Visual Designer &amp; Photographer<\/title>/i);
    assert.match(html, /href="\/graphic"/);
    assert.match(html, /href="\/photo"/);
    assert.match(html, pageContent);
    assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Building your site/i);
  }
});

test("server-renders the current artwork content", async () => {
  const graphicHtml = await (await render("/graphic")).text();
  assert.match(graphicHtml, /品牌VI设计/);
  assert.match(graphicHtml, /主图&amp;海报设计/);
  assert.match(graphicHtml, /电商详情页设计/);

  const photoHtml = await (await render("/photo")).text();
  assert.match(photoHtml, /产品拍摄/);
  assert.match(photoHtml, /其他拍摄/);
});
