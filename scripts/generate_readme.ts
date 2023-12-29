import { fs, frontMatter, datetime } from './module.ts';
import { ROOT_DIR, ARTICLE_DIR, SRC_DIR } from './constants.ts';
import config from './config.ts';

const articleIds: string[] = [];
for await (const entry of Deno.readDir(ARTICLE_DIR)) {
  if (entry.isDirectory) {
    const exists = await fs.exists(
      `${ARTICLE_DIR}/${entry.name}/index.md`,
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
  const content = await Deno.readTextFile(
    `${ARTICLE_DIR}/${articleId}/index.md`,
  );
  const { attrs } = frontMatter.extract(content);
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
    }) [${datetime.format(article.publishTime, 'yyyy-MM-dd')}]`,
  );
}

const readmeTemplate = await Deno.readTextFile(
  `${SRC_DIR}/template/readme.md`,
);
await Deno.writeTextFile(
  `${ROOT_DIR}/readme.md`,
  readmeTemplate.replace(
    '<!-- article-list -->',
    articleMdList.join('\n'),
  ),
);
