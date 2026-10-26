import Fontmin from 'fontmin';

import fs from './fs.ts';

interface FontOptions {
  fontPath: string;
  text: string;
  generateFilename: (data: Buffer) => string;
}

export default async ({ fontPath, text, generateFilename }: FontOptions) => {
  text = Array.from(new Set(text))
    .sort()
    .join('')
    .replace(/\s/g, '');
  const fontmin = new Fontmin()
    .src(fontPath)
    .use(Fontmin.glyph({ text }));
  const data = await new Promise<Buffer>((resolve, reject) => {
    fontmin.run((error, files) => {
      if (error) {
        return reject(error);
      }
      const file = files?.[0];
      if (!file || !('contents' in file) || !Buffer.isBuffer(file.contents)) {
        return reject(new Error(`No font buffer generated for ${fontPath}`));
      }
      return resolve(file.contents);
    });
  });
  const filename = generateFilename(data);
  await fs.writeFile(filename, data);
  return filename;
};
