import * as url from 'url';
import * as path from 'path';

const CURRENT_DIR = path.dirname(
  url.fileURLToPath(import.meta.url),
);

export default {
  ROOT: path.join(CURRENT_DIR, '../..'),
  BUILD: path.join(CURRENT_DIR, '../../build'),
  ARTICLES: path.join(CURRENT_DIR, '../../articles'),
  SRC: path.join(CURRENT_DIR, '../../src'),
  TEMPLATE: path.join(CURRENT_DIR, '../../src/template'),
  STATIC: path.join(CURRENT_DIR, '../../src/static'),
};
