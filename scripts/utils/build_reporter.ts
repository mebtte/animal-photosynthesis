import ora from 'ora';
import type { Ora } from 'ora';

export const formatDuration = (milliseconds: number) => milliseconds < 1000
  ? `${Math.round(milliseconds)}ms`
  : `${(milliseconds / 1000).toFixed(2)}s`;

export default function createBuildReporter(verbose: boolean) {
  let spinner: Ora | undefined;
  return {
    async phase<Result>(label: string, task: () => Promise<Result>): Promise<Result> {
      const start = performance.now();
      spinner = ora({ text: label, stream: process.stderr }).start();
      try {
        const result = await task();
        spinner.succeed(`${label} (${formatDuration(performance.now() - start)})`);
        return result;
      } catch (error) {
        spinner.fail(`${label} (${formatDuration(performance.now() - start)})`);
        throw error;
      } finally {
        spinner = undefined;
      }
    },
    progress(text: string) {
      if (spinner) spinner.text = text;
    },
    detail(text: string) {
      if (!verbose) return;
      const spinning = spinner?.isSpinning;
      spinner?.stop();
      process.stderr.write(`  ${text}\n`);
      if (spinning) spinner?.start();
    },
    summary(text: string) {
      process.stderr.write(`\n${text}\n`);
    },
    error(error: unknown) {
      const messages: string[] = [];
      let current = error;
      while (current instanceof Error) {
        messages.push(current.message);
        current = current.cause;
      }
      process.stderr.write(`\n构建失败: ${messages.join(' ') || String(error)}\n`);
      if (verbose && error instanceof Error) console.error(error);
    },
  };
}
