#!/usr/bin/env node
import * as path from 'path';
import * as cp from 'child_process';

import fs from 'fs-extra';
import yargs from 'yargs';
import ejs from 'ejs';
import md5 from 'md5';

import directory from './utils/directory.js';
import ora from './utils/ora.js';
import fontmin from './utils/fontmin.js';
import parseHtmlResource from './utils/parse_html_resource.js';
import parseArticle from './utils/parse_article.js';
import generateTitleFont from './tasks/generate_title_font.js';
import generateCommonFont from './tasks/generate_common_font.js';
import config from './config.js';

const { id } = yargs(process.argv).argv;

if (!id) {
  console.error(
    'Please specify the article id by `--id "article_id"`.',
  );
  process.exit(1);
}

if (!fs.statSync(`${directory.ARTICLES}/${id}`).isDirectory()) {
  console.error(
    `"${directory.ARTICLES}/${id}" is not a directory.`,
  );
  process.exit(1);
}

const titleFontPath = await generateTitleFont();
const commonFontPath = await generateCommonFont();

let building = false;
let changedButNotBuild = false;

async function build() {
  changedButNotBuild = false;
  building = true;

  const markdownFilename = `${directory.ARTICLES}/${id}/index.md`;
  const markdownExist = await fs.pathExists(markdownFilename);
  if (!markdownExist) {
    return console.log(
      `Please create "${markdownFilename}" and go on.`,
    );
  }

  const spinner = ora.createSpinner('Building...');
  try {
    const data = await parseArticle(id);

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

    let html = await ejs.renderFile(
      `${directory.TEMPLATE}/article/index.ejs`,
      {
        ...data,
        config,
        titleFontPath,
        commonFontPath,
        articleContentFontPath: articleContentFontPath.replace(
          `${directory.BUILD}/`,
          '',
        ),
      },
    );
    html = await parseHtmlResource(html);
    await fs.writeFile(`${directory.BUILD}/${id}.html`, html);

    spinner.succeed('Built.');
  } catch (error) {
    console.error(error);
    spinner.fail('Build failed.');
  }

  building = false;
  if (changedButNotBuild) {
    build();
  }
}

function onChange(type, filename) {
  console.log(`file ${type}: ${filename}`);

  if (building) {
    changedButNotBuild = true;
  } else {
    build();
  }
}

fs.watch(
  `${directory.ARTICLES}/${id}`,
  { recursive: true },
  onChange,
);
fs.watch(directory.SRC, { recursive: true }, onChange);

await build();
cp.exec('npm run http-server', {
  cwd: directory.ROOT,
});
