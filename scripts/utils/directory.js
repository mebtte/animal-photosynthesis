import * as url from 'url';
import * as path from 'path';

const CURREN_DIR = path.dirname(url.fileURLToPath(import.meta.url));

export default {
  BUILD: path.join(CURREN_DIR, '../../build'),
  STATIC: path.join(CURREN_DIR, '../../static'),
  ARTICLES: path.join(CURREN_DIR, '../../articles'),
  TEMPLATE: path.join(CURREN_DIR, '../../template'),
};
