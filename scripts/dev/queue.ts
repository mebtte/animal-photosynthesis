interface QueueOptions {
  build: (changes: string[]) => Promise<void>;
  onError: (error: unknown) => void;
  delay?: number;
}

export default function createRebuildQueue({ build, onError, delay = 150 }: QueueOptions) {
  const pending = new Set<string>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let active: Promise<void> | undefined;
  let closed = false;

  function drain() {
    if (closed || active || timer || !pending.size) return;
    const changes = [...pending];
    pending.clear();
    active = (async () => {
      try {
        await build(changes);
      } catch (error) {
        if (!closed) onError(error);
      } finally {
        // 缺失文件, 构建异常和正常完成都释放状态, 后续保存仍可重试.
        active = undefined;
        drain();
      }
    })();
  }

  return {
    schedule(changes: string[]) {
      if (closed) return;
      for (const change of changes) pending.add(change);
      clearTimeout(timer);
      timer = setTimeout(() => { timer = undefined; drain(); }, delay);
    },
    async close() {
      closed = true;
      clearTimeout(timer);
      pending.clear();
      await active;
    },
  };
}
