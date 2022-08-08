#!/usr/bin/env node
import * as path from 'path';
import ejs from 'ejs';
import md5 from 'md5';
import initial from './tasks/initial.js';
import generateTitleFont from './tasks/generate_title_font.js';
import generateAllArticleTitleFont from './tasks/generate_all_article_title_font.js';
import generateCommonFont from './tasks/generate_common_font.js';
import generateRobots from './tasks/generate_robots.js';
import generateSitemap from './tasks/generate_sitemap.js';
import generateRss from './tasks/generate_rss.js';
import parseArticle from './utils/parse_article.js';
import ora from './utils/ora.js';
import fs from './utils/fs.js';
import directory from './utils/directory.js';
import parseHtmlResource from './utils/parse_html_resource.js';
import fontmin from './utils/fontmin.js';
import config from './config.js';

const articleTemplate = `${directory.TEMPLATE}/article/index.ejs`;
const indexTemplate = `${directory.TEMPLATE}/index.ejs`;

await initial();
const titleFontPath = await generateTitleFont();
const commonFontPath = await generateCommonFont();

let spinner = ora.createSpinner('正在查找文章列表...');
const articleIdList = await fs.readdir(directory.ARTICLES);
spinner.succeed(`共有 ${articleIdList.length} 篇文章`);

const articleList = [];

for (
  let i = 0, { length } = articleIdList;
  i < length;
  i += 1
) {
  const articleId = articleIdList[i];
  const createLog = (text) =>
    `(${i + 1}/${length}) ${articleId} ${text}`;
  const innerSpinner = ora.createSpinner(
    createLog('正在构建...'),
  );
  const data = await parseArticle(articleId);
  if (!data) {
    innerSpinner.fail(createLog('文章为空'));
    continue;
  }
  const articleFontPath = `${directory.STATIC}/content_font.ttf`;
  const articleContentFontPath = await fontmin({
    fontPath: articleFontPath,
    text:
      data.mdText +
      (
        await fs.readFile(
          `${directory.TEMPLATE}/article/article_updates.ejs`,
        )
      ).toString(),
    generateFilename: (d) => {
      const dMd5 = md5(d);
      return `${directory.BUILD}/${dMd5}${
        path.parse(articleFontPath).ext
      }`;
    },
  });
  let html = await ejs.renderFile(articleTemplate, {
    ...data,
    config,
    titleFontPath,
    commonFontPath,
    articleContentFontPath: articleContentFontPath.replace(
      `${directory.BUILD}/`,
      '',
    ),
  });
  html = await parseHtmlResource(html);
  await fs.writeFile(
    `${directory.BUILD}/${articleId}.html`,
    html,
  );
  if (data.hidden) {
    innerSpinner.info(createLog('已构建, 属于隐藏文章'));
  } else {
    innerSpinner.succeed(createLog('已构建'));
    articleList.push({
      id: articleId,
      title: data.title,
      description: data.description,
      publishTime: data.publishTime,
    });
  }
}

spinner = ora.createSpinner('正在构建首页...');
const allArticleTitleFontPath =
  await generateAllArticleTitleFont(articleList);
let indexHtml = await ejs.renderFile(indexTemplate, {
  articleList: articleList.sort(
    (a, b) => new Date(b.publishTime) - new Date(a.publishTime),
  ),
  config,
  titleFontPath,
  commonFontPath,
  allArticleTitleFontPath,
});
indexHtml = await parseHtmlResource(indexHtml);
await fs.writeFile(`${directory.BUILD}/index.html`, indexHtml);
spinner.succeed('首页已构建');

await generateRobots();
await generateSitemap(articleList);
await generateRss(articleList);
