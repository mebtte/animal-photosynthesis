import { path } from './module.ts';

const CURRENT_DIR = path.dirname(
  path.fromFileUrl(import.meta.url),
);

export const ROOT_DIR = path.resolve(CURRENT_DIR, '..');

export const ARTICLE_DIR = path.resolve(ROOT_DIR, 'articles');

export const SRC_DIR = path.resolve(ROOT_DIR, 'src');
