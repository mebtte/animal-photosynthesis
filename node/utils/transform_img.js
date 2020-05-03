const fs = require('fs');
const util = require('util');
const path = require('path');

const mkdir = require('mkdirp');

const md5 = require('./md5');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const IMAGE_DIR = path.join(__dirname, '../../public/image');
if (!fs.existsSync(IMAGE_DIR)) {
  mkdir.sync(IMAGE_DIR);
}

function getFormatFromFilename(filename) {
  const parts = filename.split('.');
  return parts[parts.length - 1];
}

async function transformImg({ id, ast }) {
  const { tagName, properties, children } = ast;
  if (tagName === 'img') {
    const filename = properties.src.replace('./', '');
    const data = await readFile(
      path.join(__dirname, '../../articles', id, filename),
    );
    const hash = md5(data);
    const target = `image/${hash}.${getFormatFromFilename(filename)}`;
    await writeFile(path.join(__dirname, '../../public/', target), data);
    properties.src = `/${target}`;
  }
  let newChildren = children;
  if (children) {
    newChildren = await Promise.all(
      children.map((child) => transformImg({ id, ast: child })),
    );
  }
  return {
    ...ast,
    children: newChildren,
  };
}

module.exports = transformImg;
