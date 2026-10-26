import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import { before, test } from 'node:test';
import * as cheerio from 'cheerio';
import ejs from 'ejs';
import frontMatter from 'front-matter';
import config from '../config.ts';
import directory from '../utils/directory.ts';
import parseHtmlResource from '../utils/parse_html_resource.ts';
import type { ArticleAttributes } from '../types.ts';

const readBuild = (name: string) => readFile(`${directory.BUILD}/${name}`, 'utf8');
const articles = await Promise.all(
  (await readdir(directory.ARTICLES)).map(async (id) => {
    const source = await readFile(`${directory.ARTICLES}/${id}/index.md`, 'utf8');
    const { attributes, body } = frontMatter<ArticleAttributes>(source);
    return { id, ...attributes, body };
  }),
);
const published = articles.filter((article) => article.publish_time && !article.hidden)
  .sort((a, b) => Date.parse(b.publish_time!) - Date.parse(a.publish_time!));

// 使用真实文章执行完整构建, 覆盖模板 include、Markdown、资源复制和字体裁剪.
before(() => {
  execFileSync(process.execPath, ['scripts/build.ts'], {
    cwd: directory.ROOT,
    timeout: 120_000,
    stdio: 'pipe',
  });
});

test('all articles render with their titles, including hidden pages', async () => {
  for (const article of articles) {
    const $ = cheerio.load(await readBuild(`${article.id}.html`));
    assert.equal($('title').text(), `${article.title} - ${config.title}`);
    assert.equal($('article').length, 1, article.id);
    assert($('article section').text().trim().length > 0, article.id);
    assert.equal($('script[src="/prism.js"]').length, 0, 'scripts should use hashed assets');
  }
});

test('index lists only published articles, newest first', async () => {
  const $ = cheerio.load(await readBuild('index.html'));
  const links = $('.article-title a').map((_, element) => $(element).attr('href')).get();
  assert.deepEqual(links, published.map((article) => `/${article.id}`));
});

test('RSS and sitemap preserve titles, descriptions and publication dates', async () => {
  const rss = cheerio.load(await readBuild('rss.xml'), { xmlMode: true });
  const items = rss('item').toArray();
  assert.equal(items.length, published.length);
  for (const [index, element] of items.entries()) {
    const article = published[index];
    const item = rss(element);
    // RSS 模板在 CDATA 中也使用 EJS 转义, 升级时保留现有输出格式.
    assert.equal(item.find('title').text().trim(), ejs.escapeXML(article.title));
    assert.equal(item.find('link').text(), `${config.origin}/${article.id}`);
    assert.equal(item.find('pubDate').text(), new Date(article.publish_time!).toISOString());
    assert.equal(item.find('description').text().trim(),
      ejs.escapeXML(`${article.body.substring(0, 150).replace(/\s/gm, ' ')}...`).trim());
  }
  const sitemap = cheerio.load(await readBuild('sitemap.xml'), { xmlMode: true });
  assert.deepEqual(sitemap('loc').map((_, element) => sitemap(element).text()).get(),
    [config.origin, ...published.map((article) => `${config.origin}/${article.id}`)]);
});

test('generated pages reference existing local assets and valid TrueType fonts', async () => {
  const pages = ['index', ...articles.map((article) => article.id)];
  const assets = new Set<string>();
  for (const page of pages) {
    const html = await readBuild(`${page}.html`);
    const $ = cheerio.load(html);
    $('[src], link[href], meta[property="og:image"]').each((_, element) => {
      const resource = $(element).attr('src') || $(element).attr('href') || $(element).attr('content');
      if (resource?.startsWith('/') && !resource.startsWith('//')) assets.add(resource.slice(1));
    });
    for (const match of html.matchAll(/url\(\/([^\s)]+)\)/g)) assets.add(match[1]);
  }
  for (const asset of assets) {
    const path = `${directory.BUILD}/${asset}`;
    assert((await stat(path)).size > 0, asset);
    if (asset.endsWith('.ttf')) {
      const data = await readFile(path);
      assert.equal(data.readUInt32BE(0), 0x00010000, asset);
      assert(data.readUInt16BE(4) > 0, `missing font tables: ${asset}`);
    }
  }
});

test('HTML processing preserves Chinese, entities and escaped code', async () => {
  const html = await parseHtmlResource(`<!doctype html><html><head>
    <meta name="description" content="中文 &amp; &quot;引号&quot; &lt;tag&gt;">
    </head><body><pre><code>&lt;div&gt;中文 &amp; text&lt;/div&gt;</code></pre>
    <a href="https://example.com/?a=1&amp;b=2">link</a>
    <script>const text = "<中文> &";</script></body></html>`);
  const $ = cheerio.load(html);
  assert.equal($('meta').attr('content'), '中文 & "引号" <tag>');
  assert.equal($('code').text(), '<div>中文 & text</div>');
  assert.equal($('a').attr('href'), 'https://example.com/?a=1&b=2');
  assert.equal($('script').html(), 'const text = "<中文> &";');
});
