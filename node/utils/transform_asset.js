const fs = require('fs');
const util = require('util');
const path = require('path');

const mkdir = require('mkdirp');
const md5 = require('md5');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const ASSET_DIR = path.join(__dirname, '../../public/asset');
if (!fs.existsSync(ASSET_DIR)) {
  mkdir.sync(ASSET_DIR);
}

function getFormatFromFilename(filename) {
  const parts = filename.split('.');
  return parts[parts.length - 1];
}

async function copyAndGenerateHash(filename) {
  const data = await readFile(filename);
  const hash = md5(data);
  const target = `asset/${hash}.${getFormatFromFilename(filename)}`;
  await writeFile(path.join(__dirname, '../../public/', target), data);
  return target;
}

async function transformAsset({ id, ast }) {
  const { tagName, properties = {}, children } = ast;
  const { src = '', href = '' } = properties;
  if (tagName === 'a' && href[0] === '.') {
    const target = await copyAndGenerateHash(
      path.join(__dirname, '../../articles', id, href.replace('./', '')),
    );
    properties.href = `/${target}`;
  }
  if (tagName === 'img' && src[0] === '.') {
    const target = await copyAndGenerateHash(
      path.join(__dirname, '../../articles', id, src.replace('./', '')),
    );
    properties.src = `/${target}`;
  }
  let newChildren = children;
  if (children) {
    newChildren = await Promise.all(
      children.map((child) => transformAsset({ id, ast: child })),
    );
  }
  return {
    ...ast,
    children: newChildren,
  };
}

module.exports = transformAsset;
