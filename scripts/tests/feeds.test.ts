import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';
import { test } from 'node:test';
import { load } from 'cheerio';
import ejs from 'ejs';
import { renderRss } from '../tasks/generate_rss.ts';
import { renderSitemap } from '../tasks/generate_sitemap.ts';
import { articleModifiedTime, normalizeDate } from '../utils/article_dates.ts';
import { articleUrl, siteUrl } from '../utils/site_url.ts';

const article = {
  id: '中文 & example',
  title: '<众安车保> & "示例" ]]>',
  description: '**Markdown** [链接](https://example.com?a=1&b=2) ]]>',
  publishTime: '2024-01-02',
  modifiedTime: '2024-03-04T12:30:00+08:00',
};

test('RSS escapes titles once, retains summary content and keeps stable GUIDs', async () => {
  const xml = await renderRss([article]);
  const rss = load(xml, { xmlMode: true });
  const item = rss('item');
  assert.equal(item.find('title').text(), article.title);
  assert.equal(item.find('description').text().trim(), ejs.escapeXML(article.description));
  assert.equal(item.find('guid').text(), article.id);
  assert.equal(item.find('guid').attr('isPermaLink'), 'false');
  assert.equal(item.find('link').text(), articleUrl(article.id));
  assert.equal(item.find('pubDate').text(), 'Tue, 02 Jan 2024 00:00:00 GMT');
  assert.equal(rss('lastBuildDate').text(), 'Mon, 04 Mar 2024 04:30:00 GMT');
  assert.equal(rss('atom\\:link[rel="self"]').attr('href'), siteUrl('rss.xml'));
  assert.match(xml, /&lt;众安车保&gt;/);
});

test('rebuilding unchanged RSS does not change lastBuildDate or feed bytes', async () => {
  const first = await renderRss([article]);
  await setTimeout(20);
  assert.equal(await renderRss([article]), first);
});

test('sitemap encodes article URLs and uses the real modification date', async () => {
  const xml = load(await renderSitemap([article]), { xmlMode: true });
  const urls = xml('url').toArray();
  assert.equal(xml(urls[0]).find('loc').text(), siteUrl());
  assert.equal(xml(urls[0]).find('lastmod').length, 0);
  assert.equal(xml(urls[1]).find('loc').text(), `${siteUrl()}%E4%B8%AD%E6%96%87%20%26%20example`);
  assert.equal(xml(urls[1]).find('lastmod').text(), '2024-03-04T04:30:00.000Z');
  assert.equal(xml('priority, changefreq').length, 0);
});

test('empty feeds and undated entries do not invent modification times', async () => {
  assert.equal(load(await renderRss([]), { xmlMode: true })('lastBuildDate').length, 0);
  assert.equal(load(await renderSitemap([]), { xmlMode: true })('url').length, 1);
  const undated = { id: 'undated', title: 'undated', description: '' };
  assert.equal(load(await renderRss([undated]), { xmlMode: true })('pubDate, lastBuildDate').length, 0);
  assert.equal(load(await renderSitemap([undated]), { xmlMode: true })('lastmod').length, 0);
});

test('article dates select the newest author-declared date and preserve date precision', () => {
  assert.equal(articleModifiedTime({ publish_time: '2024-01-02' }), '2024-01-02');
  assert.equal(articleModifiedTime({
    publish_time: '2024-01-02', updated_time: '2024-02-01',
    updates: [{ time: '2024-03-01', description: 'newer update' }],
  }), '2024-03-01');
  assert.equal(articleModifiedTime({}), undefined);
  assert.equal(normalizeDate('2024-02-29', 'date'), '2024-02-29');
});

test('invalid or timezone-ambiguous metadata is rejected before generating dates', () => {
  for (const value of ['invalid', '2023-02-29', '2024-02-30T00:00:00Z', '2024-03-01T12:00:00', 0, new Date(NaN)]) {
    assert.throws(() => normalizeDate(value, 'updated_time'), /updated_time.*无效日期/);
  }
});
