import { parentPort, threadId, workerData } from 'node:worker_threads';

if (!parentPort) throw new Error('Expected a worker thread.');
const port = parentPort;
let ready = false;

port.on('message', async ({ index, value }) => {
  if (!ready && workerData?.barrier) {
    ready = true;
    const barrier = new Int32Array(workerData.barrier);
    Atomics.add(barrier, 0, 1);
    Atomics.notify(barrier, 0);
    // 同步线程起点, 不依赖机器负载或线程启动耗时来验证并行.
    while (Atomics.load(barrier, 0) < workerData.size) {
      const count = Atomics.load(barrier, 0);
      if (count < workerData.size) Atomics.wait(barrier, 0, count);
    }
  }
  if (value.fail) throw new Error('fixture worker failure');
  if (value.exit) process.exit(0);
  const started = performance.timeOrigin + performance.now();
  await new Promise((resolve) => setTimeout(resolve, value.delay));
  port.postMessage({
    index,
    result: { value: value.number, threadId, started, finished: performance.timeOrigin + performance.now() },
  });
});
