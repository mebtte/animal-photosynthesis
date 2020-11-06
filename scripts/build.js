#!/usr/bin/env node
import ejs from 'ejs';

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
import config from './config.js';

const articleTemplate = `${directory.TEMPLATE}/article.ejs`;
const indexTemplate = `${directory.TEMPLATE}/index.ejs`;

await initial();
const titleFontPath = await generateTitleFont();
const commonFontPath = await generateCommonFont();

let spinner = ora.createSpinner('Finding article list...');
const articleIdList = await fs.readdir(directory.ARTICLES);
spinner.succeed(`${articleIdList.length} articles`);

const articleList = [];

for (let i = 0, { length } = articleIdList; i < length; i += 1) {
  const articleId = articleIdList[i];
  const createLog = (text) => `(${i + 1}/${length}) ${articleId} ${text}`;
  const innerSpinner = ora.createSpinner(createLog('building...'));
  const data = await parseArticle(articleId);
  if (!data) {
    innerSpinner.fail('fail: article is empty');
    continue;
  }
  const html = await ejs.renderFile(articleTemplate, {
    ...data,
    config,
    titleFontPath,
    commonFontPath,
  });
  await fs.writeFile(`${directory.BUILD}/${articleId}.html`, html);
  if (data.hidden) {
    innerSpinner.info(createLog('built, but this article is hidden'));
  } else {
    innerSpinner.succeed(createLog('built'));
    articleList.push({
      id: articleId,
      title: data.title,
      createTime: data.createTime,
    });
  }
}

spinner = ora.createSpinner('Building index...');
const allArticleTitleFontPath = await generateAllArticleTitleFont(articleList);
let indexHtml = await ejs.renderFile(indexTemplate, {
  articleList: articleList.sort(
    (a, b) => new Date(b.createTime) - new Date(a.createTime),
  ),
  config,
  titleFontPath,
  commonFontPath,
  allArticleTitleFontPath,
});
indexHtml = await parseHtmlResource(indexHtml);
await fs.writeFile(`${directory.BUILD}/index.html`, indexHtml);
spinner.succeed('index built');

await generateRobots();
await generateSitemap(articleList);
await generateRss(articleList);
