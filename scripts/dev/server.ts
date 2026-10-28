import { createServer } from 'node:http';
import type { ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import httpServer from 'http-server';
import directory from '../utils/directory.ts';
import { clientScript } from './client.ts';

interface PreviewOptions {
  outputDirectory: string;
  articleId: string;
  staticDirectory?: string;
}

export default function createPreviewServer({ outputDirectory, articleId, staticDirectory = directory.STATIC }: PreviewOptions) {
  const clients = new Set<ServerResponse>();
  const assets = httpServer.createServer({ root: outputDirectory, cache: -1, showDir: 'false' });
  const staticFiles = httpServer.createServer({ root: staticDirectory, cache: -1, showDir: 'false' });
  let version = randomUUID();
  let error: string | undefined;

  const send = (client: ServerResponse, event: string, data: unknown) => {
    if (client.destroyed || client.writableEnded) { clients.delete(client); return; }
    client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  const broadcast = (event: string, data: unknown) => {
    for (const client of clients) send(client, event, data);
  };
  const server = createServer((request, response) => {
    void (async () => {
      const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return;
      }
      response.setHeader('Cache-Control', 'no-store');
      if (pathname === '/__watch/events' && request.method === 'GET') {
        response.writeHead(200, { 'Content-Type': 'text/event-stream', Connection: 'keep-alive' });
        response.flushHeaders();
        clients.add(response);
        send(response, 'state', { version, error });
        response.on('close', () => clients.delete(response));
        response.on('error', () => { clients.delete(response); response.destroy(); });
        return;
      }
      if (pathname === '/__watch/client.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
        response.end(request.method === 'HEAD' ? undefined : clientScript); return;
      }
      if (pathname === '/') {
        response.writeHead(302, { Location: `/${encodeURIComponent(articleId)}` }); response.end(); return;
      }
      if (pathname === `/${articleId}` || pathname === `/${articleId}.html`) {
        const pageVersion = version;
        let html: string;
        let status = 200;
        try { html = await readFile(path.join(outputDirectory, `${articleId}.html`), 'utf8'); }
        catch (cause) {
          if ((cause as NodeJS.ErrnoException).code !== 'ENOENT') throw cause;
          status = 503;
          html = '<!doctype html><html><head><meta charset="utf-8"><title>Preview</title></head><body><p>Waiting for a successful build...</p></body></html>';
        }
        // 注入仅发生在响应中, 磁盘上的页面可保持与生产构建一致.
        const script = `<script src="/__watch/client.js" data-version="${pageVersion}"></script>`;
        const closingBody = html.lastIndexOf('</body>');
        html = closingBody >= 0 ? html.slice(0, closingBody) + script + html.slice(closingBody) : html + script;
        response.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(request.method === 'HEAD' ? undefined : html); return;
      }

      const candidate = path.resolve(staticDirectory, `.${pathname}`);
      const relative = path.relative(staticDirectory, candidate);
      if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
        response.writeHead(403); response.end(); return;
      }
      let fromSource = false;
      try { fromSource = (await stat(candidate)).isFile(); }
      catch (cause) { if ((cause as NodeJS.ErrnoException).code !== 'ENOENT') throw cause; }
      // 静态文件直接读取源目录, 修改和删除立即可见, 无需维护旧副本.
      (fromSource ? staticFiles : assets).server.emit('request', request, response);
    })().catch((cause) => {
      if (!response.headersSent) response.writeHead(cause instanceof URIError ? 400 : 500);
      response.end('Preview request failed.');
    });
  });
  const heartbeat = setInterval(() => {
    for (const client of clients) client.write(': keep-alive\n\n');
  }, 15_000);
  heartbeat.unref();

  return {
    server,
    succeeded() {
      error = undefined;
      version = randomUUID();
      broadcast('built', { version });
    },
    staticChanged() {
      version = randomUUID();
      broadcast('built', { version });
    },
    failed(cause: unknown) {
      error = cause instanceof Error ? cause.stack ?? cause.message : String(cause);
      broadcast('build-error', { error });
    },
    async close() {
      clearInterval(heartbeat);
      for (const client of clients) client.end();
      clients.clear();
      await new Promise<void>((resolve, reject) => {
        server.close((cause) => {
          if (cause && (cause as NodeJS.ErrnoException).code !== 'ERR_SERVER_NOT_RUNNING') reject(cause);
          else resolve();
        });
        server.closeAllConnections();
      });
    },
  };
}
