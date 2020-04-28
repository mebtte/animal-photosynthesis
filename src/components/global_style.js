import React, { useContext } from 'react';
import { createGlobalStyle, css } from 'styled-components';

import DarkModeContext from '../context/dark_mode_context';

const Style = createGlobalStyle`
  ${({ darkMode }) =>
    darkMode
      ? css`
          :root {
            --primary-color: rgb(237, 106, 94);
            --normal-color: #eee;
            --secondary-color: #888;
            --background-color: #333;
          }
        `
      : css`
          :root {
            --primary-color: rgb(237, 106, 94);
            --normal-color: #333;
            --secondary-color: #888;
            --background-color: #eee;
          }
        `}

  :root{
    --transition-duration: 0.3s;
  }

  * {
    box-sizing: border-box;
  }

  body {
    background-color: var(--background-color);
    transition: background-color var(--transition-duration);
  }
`;

const GlobalStyle = () => {
  const { darkMode } = useContext(DarkModeContext);
  return <Style darkMode={darkMode} />;
};

export default GlobalStyle;
