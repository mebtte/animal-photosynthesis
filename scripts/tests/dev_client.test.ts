import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { clientScript } from '../dev/client.ts';

test('reload client handles success, errors, recovery and reconnection without interpreting error HTML', () => {
  const listeners = new Map<string, (event: { data: string }) => void>();
  let overlay: { id?: string; style: object; textContent?: string; remove: () => void } | undefined;
  let reloads = 0;
  let closed = false;
  let pagehide: (() => void) | undefined;
  runInNewContext(clientScript, {
    EventSource: class {
      addEventListener(name: string, callback: (event: { data: string }) => void) { listeners.set(name, callback); }
      close() { closed = true; }
    },
    document: {
      currentScript: { dataset: { version: 'initial' } },
      getElementById() { return overlay; },
      createElement() { return { style: {}, remove() { overlay = undefined; } }; },
      body: { appendChild(element: typeof overlay) { overlay = element; } },
    },
    location: { reload() { reloads += 1; } },
    addEventListener(name: string, callback: () => void) { if (name === 'pagehide') pagehide = callback; },
  });
  const send = (name: string, value: object) => listeners.get(name)!({ data: JSON.stringify(value) });
  send('state', { version: 'initial' }); assert.equal(reloads, 0);
  send('build-error', { error: '<script>must remain text</script>' });
  assert(overlay?.textContent?.includes('<script>must remain text</script>'));
  send('state', { version: 'initial' }); assert.equal(overlay, undefined);
  send('error', {}); assert(overlay?.textContent?.includes('disconnected'));
  send('state', { version: 'initial' }); assert.equal(overlay, undefined);
  send('built', {}); assert.equal(reloads, 1);
  send('state', { version: 'after reconnect' }); assert.equal(reloads, 2);
  pagehide!(); assert.equal(closed, true);
});
