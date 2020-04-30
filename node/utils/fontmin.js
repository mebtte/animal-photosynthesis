const fs = require('fs');
const util = require('util');

// eslint-disable-next-line import/no-extraneous-dependencies
const Fontmin = require('fontmin');

const writeFile = util.promisify(fs.writeFile);

module.exports = async ({ fontPath, targetFilename, text }) => {
  text = Array.from(new Set(text))
    .sort()
    .join('')
    .replace(/\s/g, '');
  const fontmin = new Fontmin({ allowEmpty: true })
    .src(fontPath)
    .use(Fontmin.glyph({ text }));
  const data = await new Promise((resolve, reject) => {
    fontmin.run((error, files) => {
      if (error) {
        return reject(error);
      }
      return resolve(files[0].contents);
    });
  });
  await writeFile(targetFilename, data);
};
