// 仅由开发服务器提供, 不写入生产 HTML 或静态资源.
export const clientScript = String.raw`(() => {
  const initialVersion = document.currentScript.dataset.version;
  const events = new EventSource('/__watch/events');
  function showError(message) {
    let overlay = document.getElementById('__watch_error');
    if (!message) { if (overlay) overlay.remove(); return; }
    if (!overlay) {
      overlay = document.createElement('pre');
      overlay.id = '__watch_error';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;margin:0;padding:24px;overflow:auto;background:rgba(24,24,24,.96);color:#ffb4ab;white-space:pre-wrap;font:14px/1.6 monospace';
      document.body.appendChild(overlay);
    }
    overlay.textContent = 'Build failed. Waiting for changes...\n\n' + message;
  }
  events.addEventListener('state', event => {
    const state = JSON.parse(event.data);
    if (state.version !== initialVersion) { location.reload(); return; }
    showError(state.error);
  });
  events.addEventListener('built', () => location.reload());
  events.addEventListener('build-error', event => showError(JSON.parse(event.data).error));
  events.addEventListener('error', () => showError('Preview server disconnected. Waiting for recovery...'));
  addEventListener('pagehide', () => events.close(), { once: true });
})();`;
