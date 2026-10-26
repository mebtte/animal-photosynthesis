#!/usr/bin/env node
import * as path from 'node:path';
import * as cp from 'node:child_process';
import fs from 'fs-extra';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import type { WatchListener } from 'node:fs';
import ejs from 'ejs';
import md5 from 'md5';
import directory from './utils/directory.ts';
import ora from './utils/ora.ts';
import fontmin from './utils/fontmin.ts';
import parseHtmlResource from './utils/parse_html_resource.ts';
import parseArticle from './utils/parse_article.ts';
import generateTitleFont from './tasks/generate_title_font.ts';
import generateCommonFont from './tasks/generate_common_font.ts';
import config from './config.ts';

const { id } = yargs(hideBin(process.argv))
  .option('id', { type: 'string', default: '' })
  .parseSync();

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
    if (!data) {
      throw new Error(`Article "${id}" is empty.`);
    }

    const articleFontPath = `${directory.ASSET}/content_font.ttf`;
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

const onChange: WatchListener<string> = (type, filename) => {
  console.log(`file ${type}: ${filename}`);

  if (building) {
    changedButNotBuild = true;
  } else {
    build();
  }
};

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
