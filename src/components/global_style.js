import { createGlobalStyle, css } from 'styled-components';

import { COMPONENT_FONT_FAMILY } from '../constants';

export default createGlobalStyle`
  ${({ componentFontPath }) => css`
    @font-face {
      font-family: ${COMPONENT_FONT_FAMILY};
      src: url('${componentFontPath}');
    }
  `}

  * {
    box-sizing: border-box;
  }

  body {
    --border-radius: 2px;
    --transition-duration: 0.3s;

    --primary-color: rgb(237, 106, 94);
    --normal-color: #333;
    --secondary-color: #888;
    --tertiary-color: #ddd;
    --backgroud: rgb(250, 250, 250);
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
