import fs from '../utils/fs.js';
import directory from '../utils/directory.js';
import ora from '../utils/ora.js';
import config from '../config.js';

export default async (articleList) => {
  const spinner = ora.createSpinner('Generating sitemap.xml');
  const content = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${config.site}</loc>
  </url>
  ${articleList
    .map(
      (article) => `
  <url>
    <loc>${config.site}/${article.id}</loc>
  </url>`,
    )
    .join('')}
</urlset>`;
  await fs.writeFile(`${directory.BUILD}/sitemap.xml`, content);
  spinner.succeed('sitemap.xml generated');
};
