import { readdir, readFile, writeFile } from 'node:fs/promises';
import fs from 'fs-extra';
import frontMatter from 'front-matter';
import directory from './utils/directory.ts';
import config from './config.ts';
import type { ArticleAttributes } from './types.ts';

const articleIds: string[] = [];
for (const entry of await readdir(directory.ARTICLES, { withFileTypes: true })) {
  if (entry.isDirectory()) {
    const exists = await fs.pathExists(
      `${directory.ARTICLES}/${entry.name}/index.md`,
    );
    if (exists) {
      articleIds.push(entry.name);
    }
  }
}

const articles: {
  id: string;
  title: string;
  publishTime: Date;
}[] = [];
for (const articleId of articleIds) {
  const content = await readFile(
    `${directory.ARTICLES}/${articleId}/index.md`,
    'utf8',
  );
  const { attributes: attrs } = frontMatter<ArticleAttributes>(content);
  if (!attrs.hidden) {
    articles.push({
      id: articleId,
      title: attrs.title as string,
      publishTime: new Date(attrs.publish_time as string),
    });
  }
}

articles.sort(
  (a, b) => b.publishTime.getTime() - a.publishTime.getTime(),
);

const articleMdList: string[] = [];
for (const article of articles) {
  articleMdList.push(
    `- [${article.title}](${config.origin}/${
      article.id
    }) <sup><sub>${[
      article.publishTime.getFullYear(),
      String(article.publishTime.getMonth() + 1).padStart(2, '0'),
      String(article.publishTime.getDate()).padStart(2, '0'),
    ].join('-')}</sub></sup>`,
  );
}

const readmeTemplate = await readFile(
  `${directory.TEMPLATE}/readme.md`,
  'utf8',
);
await writeFile(
  `${directory.ROOT}/readme.md`,
  readmeTemplate.replace(
    '<!-- article-list -->',
    articleMdList.join('\n'),
  ),
);
