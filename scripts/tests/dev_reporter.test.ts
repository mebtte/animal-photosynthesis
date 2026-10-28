import assert from 'node:assert/strict';
import path from 'node:path';
import { Writable } from 'node:stream';
import { test } from 'node:test';
import createWatchReporter from '../dev/reporter.ts';
import { serializeWatchError } from '../dev/events.ts';
import directory from '../utils/directory.ts';

function capture() {
  let output = '';
  const stream = new Writable({ write(chunk, _encoding, done) { output += chunk.toString(); done(); } });
  const reporter = createWatchReporter({ id: 'example', stream, now: () => new Date(2024, 0, 2, 12, 34, 56) });
  return { reporter, text: () => output };
}

test('watch startup only shows the preview address without ANSI sequences in logs', () => {
  const { reporter, text } = capture();
  reporter.header();
  assert.equal(text(), '\n  预览  http://localhost:8000/example\n\n');
  reporter.event({ type: 'ready' });
  reporter.event({ type: 'build-start', changes: ['*'] });
  reporter.event({ type: 'build-success', duration: 120, rendered: true });
  assert.match(text(), /12:34:56\s+LISTEN/);
  assert.match(text(), /READY\s+首次构建完成 \(120ms\)/);
  assert.doesNotMatch(text(), /\u001b\[/);
});

test('watch summarizes batches using relative file paths instead of individual filesystem events', () => {
  const { reporter, text } = capture();
  reporter.event({ type: 'build-start', changes: [
    path.join(directory.ROOT, 'articles/example/index.md'),
    path.join(directory.ROOT, 'src/assets/prism.css'),
    path.join(directory.ROOT, 'articles/example/image.svg'),
    path.join(directory.ROOT, 'articles/example/index.md'),
  ] });
  assert.match(text(), /articles\/example\/index.md/);
  assert.match(text(), /src\/assets\/prism.css/);
  assert.match(text(), /\(\+1 个文件\)/);
  assert.doesNotMatch(text(), new RegExp(directory.ROOT));
  assert.doesNotMatch(text(), /file change|file rename/);
});

test('watch distinguishes failure, recovery, script reload and clean shutdown', () => {
  const { reporter, text } = capture();
  reporter.event({ type: 'build-success', duration: 10, rendered: true });
  const cause = new Error(`${directory.ROOT}/src/template/article/index.ejs:12\nsyntax error`);
  reporter.event({ type: 'build-error', duration: 25, error: serializeWatchError(new Error('render failed', { cause })) });
  reporter.event({ type: 'build-success', duration: 80, rendered: true });
  reporter.restarting([path.join(directory.ROOT, 'scripts/config.ts')]);
  reporter.stopped();
  assert.match(text(), /ERROR\s+构建失败 \(25ms\).*保留上一版页面/);
  assert.match(text(), /src\/template\/article\/index.ejs:12/);
  assert.match(text(), /RECOVER\s+构建已恢复 \(80ms\)/);
  assert.match(text(), /RESTART.*scripts\/config.ts/);
  assert.match(text(), /STOP.*已关闭/);
  assert.doesNotMatch(text(), /\n\s+at /);
});

test('watch gives port-conflict guidance and condenses native process diagnostics', () => {
  const { reporter, text } = capture();
  reporter.event({ type: 'fatal', error: { message: 'listen EADDRINUSE', code: 'EADDRINUSE' } });
  reporter.processError(`file://${directory.ROOT}/scripts/config.ts:5\nSyntaxError: Unexpected token\n    at internal loader\nNode.js v24.0.0`, false);
  assert.match(text(), /端口 8000 已被占用/);
  assert.match(text(), /scripts\/config.ts:5/);
  assert.match(text(), /SyntaxError: Unexpected token/);
  assert.doesNotMatch(text(), /internal loader|Node.js v24/);
});

test('serializing cyclic error causes terminates and retains the first error code', () => {
  const error = Object.assign(new Error('cycle'), { code: 'EACCES', cause: undefined as unknown });
  error.cause = error;
  assert.deepEqual(serializeWatchError(error), { message: 'cycle', code: 'EACCES' });
});

test('static updates do not misreport a failed article as recovered', () => {
  const { reporter, text } = capture();
  reporter.event({ type: 'build-error', duration: 1, error: { message: 'bad article' } });
  reporter.event({ type: 'build-success', duration: 2, rendered: false });
  assert.match(text(), /文章仍有错误, 等待修复/);
  assert.doesNotMatch(text(), /RECOVER/);
  reporter.event({ type: 'build-success', duration: 3, rendered: true });
  assert.match(text(), /RECOVER.*构建已恢复/);
});

test('long template errors retain source location and the final reason', () => {
  const { reporter, text } = capture();
  const message = ['src/template/example.ejs:12', ...Array.from({ length: 20 }, (_, i) => `  source line ${i}`), 'Unexpected token: final reason'].join('\n');
  reporter.event({ type: 'fatal', error: { message } });
  assert.match(text(), /src\/template\/example.ejs:12/);
  assert.match(text(), /Unexpected token: final reason/);
  assert(text().split('\n').length < 15);
});

test('native TypeScript diagnostics retain the syntax error instead of the Node bootstrap or error object', () => {
  const { reporter, text } = capture();
  reporter.processError(`node:internal/modules/run_main:107
    triggerUncaughtException(
    ^

file://${directory.ROOT}/scripts/config.ts:1
export default {

SyntaxError [ERR_INVALID_TYPESCRIPT_SYNTAX]: Unexpected token
    at parseTypeScript (node:internal/modules/typescript:72:36)
    at loader (node:internal/modules/esm/loader:512:12) {
  code: 'ERR_INVALID_TYPESCRIPT_SYNTAX'
}
Node.js v24.0.0`, false);
  assert.match(text(), /scripts\/config.ts:1/);
  assert.match(text(), /export default/);
  assert.match(text(), /SyntaxError.*Unexpected token/);
  assert.doesNotMatch(text(), /node:internal|triggerUncaughtException|code: '/);
});
