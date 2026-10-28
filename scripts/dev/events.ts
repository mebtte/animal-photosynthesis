export interface WatchError {
  message: string;
  code?: string;
}

export type WatchEvent =
  | { type: 'ready' }
  | { type: 'build-start'; changes: string[] }
  | { type: 'build-success'; duration: number; rendered: boolean }
  | { type: 'build-error'; duration: number; error: WatchError }
  | { type: 'fatal'; error: WatchError };

export function serializeWatchError(error: unknown): WatchError {
  const messages: string[] = [];
  const seen = new Set<Error>();
  let current = error;
  while (current instanceof Error && !seen.has(current)) {
    seen.add(current);
    messages.push(current.message);
    current = current.cause;
  }
  return {
    message: messages.join('\n') || String(error),
    code: error instanceof Error ? (error as NodeJS.ErrnoException).code : undefined,
  };
}
