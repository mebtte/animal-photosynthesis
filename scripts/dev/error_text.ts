import path from 'node:path';
import { stripVTControlCharacters } from 'node:util';
import directory from '../utils/directory.ts';
import type { WatchError } from './events.ts';

export const cleanTerminalText = (text: string) => stripVTControlCharacters(text)
  .replaceAll(`file://${directory.ROOT}${path.sep}`, '').replaceAll(`${directory.ROOT}${path.sep}`, '');

export function watchErrorLines({ message, code }: WatchError): string[] {
  if (code === 'EADDRINUSE' || message.includes('EADDRINUSE')) {
    return ['端口 8000 已被占用, 请关闭占用该端口的服务后重试.'];
  }
  const raw = cleanTerminalText(message).split(/\r?\n/).map((line) => line.trimEnd());
  const reason = raw.findIndex((line) => /^(?:\w*Error|\w*Exception)(?:\s+\[[^\]]+\])?:/.test(line));
  const frame = raw.findIndex((line, index) => index > reason && /^\s*at\s/.test(line));
  let lines: string[];
  if (reason >= 0 && frame >= 0) {
    // Node 的 TypeScript 语法错误前面可能有内部引导代码, 后面有堆栈和错误对象.
    // 只取用户源码位置, 源码片段和实际错误原因, 避免截断时丢失关键信息.
    const location = raw.findIndex((line, index) => index < reason &&
      !line.startsWith('node:') && /\.(?:[cm]?[jt]s|ejs|json):\d+/.test(line));
    lines = [...(location >= 0 ? raw.slice(location, reason) : []), ...raw.slice(reason, frame)];
  } else {
    lines = raw.filter((line) => !/^\s*at\s|^Node\.js v/.test(line));
  }
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines.at(-1)!.trim()) lines.pop();
  return lines.length > 8 ? [...lines.slice(0, 5), '...', ...lines.slice(-2)] : lines;
}
