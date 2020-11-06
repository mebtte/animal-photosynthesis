import Fontmin from 'fontmin';

import fs from './fs.js';

export default async ({ fontPath, text, generateFilename }) => {
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
  const filename = generateFilename(data);
  await fs.writeFile(filename, data);
  return filename;
};
