import download from './download';
import sleep from './sleep';

export default async ({ id, text, font }) => {
  let style = document.querySelector(`#${id}`);
  if (style && style.dataset.text === text && style.dataset.font === font) {
    return;
  }
  if (!style) {
    style = document.createElement('style');
    style.id = id;
    document.head.appendChild(style);
  }
  const file = await download(`https://engine.mebtte.com/1/dynamic/font?font=${font}&text=${encodeURIComponent(text)}`);
  const url = URL.createObjectURL(file);
  style.dataset.font = font;
  style.dataset.text = text;
  style.innerHTML = `
    @font-face {
      font-family: "${id}";
      src: url(${url});
    }
  `;
  return sleep(0);
};
