import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import directory from '../utils/directory.ts';
import { ignoredChange } from './changes.ts';
import createWatchReporter from './reporter.ts';
import { serializeWatchError } from './events.ts';
import type { WatchEvent } from './events.ts';

export default async function superviseWatch(id: string, reporter = createWatchReporter({ id })): Promise<number> {
  return new Promise((resolve) => {
    let child: ChildProcess | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let restarting = false;
    let closing = false;
    let everReady = false;
    const pending = new Set<string>();
    const expectedExit = new WeakSet<ChildProcess>();
    const watcher = watch(path.join(directory.ROOT, 'scripts'), { recursive: true }, (_type, filename) => {
      const name = filename?.split(path.sep).join('/');
      if (closing || (name && (ignoredChange(name) || name.startsWith('tests/') || !/\.[cm]?[jt]s$/.test(name)))) return;
      pending.add(path.join(directory.ROOT, 'scripts', filename ?? ''));
      clearTimeout(timer);
      timer = setTimeout(() => { void restart(); }, 150);
    });

    async function stopChild() {
      const current = child;
      if (!current) return;
      expectedExit.add(current);
      if (!current.pid || current.exitCode !== null || current.signalCode !== null) return;
      await new Promise<void>((done) => {
        const timeout = setTimeout(() => current.kill('SIGKILL'), 5000);
        current.once('exit', () => { clearTimeout(timeout); done(); });
        current.kill('SIGTERM');
      });
    }

    async function finish(code: number) {
      if (closing) return;
      closing = true;
      clearTimeout(timer);
      watcher.close();
      await stopChild();
      reporter.stopped();
      process.off('SIGINT', interrupt);
      process.off('SIGTERM', interrupt);
      resolve(code);
    }
    const interrupt = () => { void finish(0); };
    const fatal = (error: unknown) => {
      reporter.event({ type: 'fatal', error: serializeWatchError(error) });
      void finish(1);
    };
    process.on('SIGINT', interrupt);
    process.on('SIGTERM', interrupt);
    watcher.on('error', fatal);

    function startChild() {
      child = spawn(process.execPath, [fileURLToPath(new URL('./runtime.ts', import.meta.url)), id], {
        cwd: directory.ROOT, stdio: ['inherit', 'pipe', 'pipe', 'ipc'],
      });
      const current = child;
      let ready = false;
      let diagnostics = '';
      let diagnosticTimer: ReturnType<typeof setTimeout> | undefined;
      const flushDiagnostics = () => {
        clearTimeout(diagnosticTimer);
        if (diagnostics.trim() && !closing && !expectedExit.has(current)) reporter.warning(diagnostics);
        diagnostics = '';
      };
      const collect = (data: string) => {
        diagnostics = (diagnostics + data).slice(0, 65_536);
        if (ready) {
          clearTimeout(diagnosticTimer);
          diagnosticTimer = setTimeout(flushDiagnostics, 50);
        }
      };
      current.stdout!.setEncoding('utf8').on('data', collect);
      current.stderr!.setEncoding('utf8').on('data', collect);
      current.on('message', (message) => {
        if (closing || expectedExit.has(current) || child !== current) return;
        const event = message as WatchEvent;
        if (event.type === 'ready') { ready = true; everReady = true; }
        flushDiagnostics();
        reporter.event(event);
        if (event.type === 'fatal') void finish(1);
      });
      current.on('error', fatal);
      // close 等待诊断管道读完. 正常重启的退出不重复报告为故障.
      current.on('close', (code) => {
        clearTimeout(diagnosticTimer);
        if (child === current) child = undefined;
        if (closing || expectedExit.has(current)) return;
        reporter.processError(diagnostics || `开发进程退出 (code ${code}).`, ready);
        if (!everReady) void finish(code || 1);
        else if (ready) {
          pending.add(path.join(directory.ROOT, 'scripts'));
          timer = setTimeout(() => { void restart(); }, 150);
        }
      });
    }

    async function restart() {
      if (restarting || closing || !pending.size) return;
      restarting = true;
      const changes = [...pending];
      pending.clear();
      reporter.restarting(changes);
      try {
        await stopChild();
        if (!closing) startChild();
      } finally {
        restarting = false;
        if (pending.size) void restart();
      }
    }
    startChild();
  });
}
