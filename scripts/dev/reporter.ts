import path from 'node:path';
import { styleText } from 'node:util';
import type { Writable } from 'node:stream';
import ora from 'ora';
import type { Ora } from 'ora';
import directory from '../utils/directory.ts';
import { formatDuration } from '../utils/build_reporter.ts';
import type { WatchError, WatchEvent } from './events.ts';
import { cleanTerminalText as clean, watchErrorLines } from './error_text.ts';

interface ReporterOptions {
  id: string;
  stream?: Writable & { isTTY?: boolean };
  now?: () => Date;
}

export default function createWatchReporter({ id, stream = process.stderr, now = () => new Date() }: ReporterOptions) {
  const interactive = Boolean(stream.isTTY) && process.env.TERM !== 'dumb';
  const color = interactive && !('NO_COLOR' in process.env);
  let spinner: Ora | undefined;
  let built = false;
  let failed = false;
  const paint = (text: string, tone: 'cyan' | 'green' | 'yellow' | 'red' | 'gray') =>
    color ? styleText(tone, text, { validateStream: false }) : text;
  const timestamp = () => now().toLocaleTimeString('en-GB', { hour12: false });
  const row = (status: string, text: string) => {
    const tone = status === 'ERROR' ? 'red' : status === 'WARN' || status === 'RESTART' ? 'yellow'
      : status === 'READY' || status === 'DONE' || status === 'RECOVER' ? 'green' : 'cyan';
    return `${paint(timestamp(), 'gray')}  ${paint(status.padEnd(7), tone)} ${clean(text)}`;
  };
  const stop = () => { spinner?.stop(); spinner = undefined; };
  const line = (status: string, text: string) => {
    const active = spinner;
    active?.stop();
    stream.write(`${row(status, text)}\n`);
    active?.start();
  };
  const changesText = (changes: string[]) => {
    const files = [...new Set(changes)].filter((filename) => filename !== '*')
      .map((filename) => clean(path.relative(directory.ROOT, filename) || 'scripts/'));
    return files.slice(0, 2).join(', ') + (files.length > 2 ? ` (+${files.length - 2} 个文件)` : '');
  };
  const details = (error: WatchError) => {
    for (const value of watchErrorLines(error)) stream.write(`                   ${value}\n`);
  };

  return {
    header() {
      stream.write(`\n  ${paint('预览', 'gray')}  ${paint(`http://localhost:8000/${encodeURIComponent(id)}`, 'cyan')}\n\n`);
    },
    event(event: WatchEvent) {
      switch (event.type) {
        case 'ready': line('LISTEN', '预览服务已就绪, 正在监听文件变化.'); break;
        case 'build-start': {
          stop();
          const files = changesText(event.changes);
          const staticOnly = event.changes.length > 0 && event.changes.every((filename) =>
            filename === directory.STATIC || filename.startsWith(`${directory.STATIC}${path.sep}`));
          const text = `${staticOnly ? '更新静态资源' : built ? '重新构建' : '首次构建'}${files ? ` | ${files}` : ''}`;
          if (interactive) spinner = ora({ text: row('BUILD', text), stream, color: color ? 'cyan' : false, discardStdin: false }).start();
          else line('BUILD', text);
          break;
        }
        case 'build-success': {
          stop();
          if (!event.rendered) {
            line('DONE', `静态资源已更新 (${formatDuration(event.duration)}) | ${failed ? '文章仍有错误, 等待修复' : '已通知浏览器刷新'}`);
            break;
          }
          const label = failed ? 'RECOVER' : built ? 'DONE' : 'READY';
          const message = failed ? '构建已恢复' : built ? '重建完成' : '首次构建完成';
          line(label, `${message} (${formatDuration(event.duration)}) | ${built || failed ? '已通知浏览器刷新' : '继续监听文件变化'}`);
          built = true; failed = false; break;
        }
        case 'build-error':
          stop(); failed = true;
          line('ERROR', `构建失败 (${formatDuration(event.duration)}) | ${built ? '保留上一版页面, 等待修复' : '等待修复后自动重试'}`);
          details(event.error); break;
        case 'fatal':
          stop(); line('ERROR', '预览服务无法继续运行.'); details(event.error); break;
      }
    },
    restarting(changes: string[]) {
      stop(); line('RESTART', `重新加载配置和构建脚本${changes.length ? ` | ${changesText(changes)}` : ''}`);
    },
    processError(message: string, retry: boolean) {
      stop(); failed = true;
      line('ERROR', retry ? '开发进程意外退出, 正在重新启动.' : '代码加载失败, 等待修复后重新加载.');
      details({ message });
    },
    warning(message: string) {
      const active = spinner;
      stop(); line('WARN', '开发进程输出了诊断信息.'); details({ message });
      spinner = active; active?.start();
    },
    stopped() { stop(); line('STOP', '预览服务和文件监听已关闭.'); },
  };
}
