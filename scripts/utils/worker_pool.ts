import { Worker } from 'node:worker_threads';

interface PoolOptions<Input, Result> {
  workerURL: URL;
  items: readonly Input[];
  concurrency: number;
  workerData?: unknown;
  onResult?: (result: Result, item: Input, index: number) => void;
}

export default function runWorkerPool<Input, Result>({
  workerURL, items, concurrency, workerData, onResult,
}: PoolOptions<Input, Result>): Promise<Result[]> {
  if (!Number.isSafeInteger(concurrency) || concurrency < 1) {
    return Promise.reject(new Error('并行数必须为正整数.'));
  }
  if (!items.length) return Promise.resolve([]);

  return new Promise((resolve, reject) => {
    const workers = new Set<Worker>();
    const results: Result[] = new Array(items.length);
    let next = 0;
    let completed = 0;
    let stopping = false;

    // 成功或失败都等待线程退出, 避免返回后仍有任务写入构建目录.
    const stop = (error?: unknown) => {
      if (stopping) return;
      stopping = true;
      void Promise.allSettled([...workers].map((worker) => worker.terminate()))
        .then(() => error === undefined ? resolve(results) : reject(error));
    };

    try {
      for (let i = 0; i < Math.min(concurrency, items.length); i += 1) {
        const worker = new Worker(workerURL, { workerData });
        workers.add(worker);
        let assignedIndex = -1;
        const dispatch = () => {
          if (next >= items.length) return;
          assignedIndex = next++;
          worker.postMessage({ index: assignedIndex, value: items[assignedIndex] });
        };

        worker.on('error', stop);
        worker.on('exit', (code) => {
          if (!stopping) stop(new Error(`构建线程意外退出 (code ${code}).`));
        });
        worker.on('message', ({ index, result }: { index: number; result: Result }) => {
          if (stopping) return;
          try {
            if (index !== assignedIndex) throw new Error('构建线程返回了无效的任务序号.');
            // 按输入顺序收集结果, 不让任务完成顺序影响同日期文章的排序.
            results[index] = result;
            completed += 1;
            onResult?.(result, items[index], index);
            if (completed === items.length) stop();
            else dispatch();
          } catch (error) {
            stop(error);
          }
        });
        dispatch();
      }
    } catch (error) {
      stop(error);
    }
  });
}
