const link = document.createElement('link');
link.rel = 'stylesheet';
link.href =
  'https://cdn.jsdelivr.net/npm/firacode@6.2.0/distr/fira_code.css';
link.addEventListener(
  'load',
  () => {
    const style = document.createElement('style');
    style.innerHTML = `
    code { font-family: 'Fira Code', monospace !important; }
    
    @supports (font-variation-settings: normal) {
      code { font-family: 'Fira Code VF', monospace; }
    }
  `;
    document.head.appendChild(style);
  },
  { once: true },
);
document.head.appendChild(link);
