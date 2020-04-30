import { createGlobalStyle } from 'styled-components';

import { TIME_FONT_PATH } from '../constants';

export default createGlobalStyle`
  :root{
    --transition-duration: 0.3s;
  }

  @font-face {
    font-family: time_font;
    src: url('${TIME_FONT_PATH}');
  }

  * {
    box-sizing: border-box;
  }

  body {
    --border-radius: 2px;

    --primary-color: rgb(237, 106, 94);
    --normal-color: #333;
    --secondary-color: #888;
    --tertiary-color: #ddd;
    --backgroud: #eee;
    background-color: var(--backgroud);
    transition: background-color var(--transition-duration);

    &.dark{
      --primary-color: rgb(237, 106, 94);
      --normal-color: #eee;
      --secondary-color: #888;
      --tertiary-color: #444;
      --backgroud: #333;
    }
  }
`;
