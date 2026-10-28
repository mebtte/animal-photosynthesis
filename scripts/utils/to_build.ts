import * as path from 'node:path';

import md5 from 'md5';

import fs from './fs.ts';
import directory from './directory.ts';

const copies = new Map<string, Promise<string>>();

export default (originalPath: string): Promise<string> => {
  const key = path.resolve(originalPath);
  const existing = copies.get(key);
  if (existing) return existing;

  // 缓存进行中的 Promise, 同一线程内的并发请求共享一次复制.
  const pending = (async () => {
    const data = await fs.readFile(originalPath);
    const dataMd5 = md5(data);
    const filename = `${dataMd5}${path.parse(originalPath).ext}`;
    try {
      // 不同线程可能引用同一内容寻址资源. 独占创建避免重复覆盖;
      // 构建入口等待全部线程完成后才结束, 确保拥有者已完成写入.
      await fs.writeFile(`${directory.BUILD}/${filename}`, data, { flag: 'wx' });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
    return filename;
  })().catch((error) => {
    copies.delete(key);
    throw error;
  });
  copies.set(key, pending);
  return pending;
};
