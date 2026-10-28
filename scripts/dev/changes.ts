import path from 'node:path';
import directory from '../utils/directory.ts';

export function ignoredChange(filename: string) {
  return filename.split(/[\\/]/).some((part) =>
    part.startsWith('.') || /(?:~|\.sw[opx]|\.tmp)$/.test(part));
}

export default function classifyChanges(changes: string[], id: string) {
  const names = changes.map((name) => path.relative(directory.ROOT, name).split(path.sep).join('/'));
  const all = changes.includes('*') || names.some((name) => [
    'src/assets', 'src/template', 'src/template/common', 'src/template/article',
  ].includes(name));
  const articleDirectory = names.includes(`articles/${id}`);
  const contentFont = all || articleDirectory || names.some((name) => name === `articles/${id}/index.md` ||
    name === 'src/assets/content_font.ttf' || name === 'src/template/article/article_updates.ejs');
  return {
    render: all || names.some((name) => name === `articles/${id}` || name.startsWith(`articles/${id}/`) ||
      name.startsWith('src/assets/') || name.startsWith('src/template/article/') || name.startsWith('src/template/common/')),
    static: all || names.some((name) => name === 'src/static' || name.startsWith('src/static/')),
    titleFont: all || names.includes('src/assets/title_font.ttf'),
    commonFont: all || names.some((name) => [
      'src/assets/common_font.ttf', 'src/template/common/footer.ejs',
      'src/template/article/article_action.ejs',
    ].includes(name)),
    contentFont,
    updates: all || names.includes('src/template/article/article_updates.ejs'),
    invalidateAll: all || articleDirectory,
  };
}
