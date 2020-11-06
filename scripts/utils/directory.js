import * as url from 'url';
import * as path from 'path';

const CURREN_DIR = path.dirname(url.fileURLToPath(import.meta.url));

export default {
  BUILD: path.join(CURREN_DIR, '../../build'),
  TMP: path.join(CURREN_DIR, '../../tmp'),
  ARTICLES: path.join(CURREN_DIR, '../../articles'),
  TEMPLATE: path.join(CURREN_DIR, '../../src/template'),
  STATIC: path.join(CURREN_DIR, '../../src/static'),
};
