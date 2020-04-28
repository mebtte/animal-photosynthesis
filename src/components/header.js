import React, { useContext } from 'react';
import styled from 'styled-components';

import Title from './title';
import DarkModeContext from '../context/dark_mode_context';
import { Github, Sun, Moon } from './icon';

const iconStyle = {
  marginLeft: 20,
  cursor: 'pointer',
};

const Style = styled.header`
  margin: 20px;
  display: flex;
  align-items: center;
  > h1 {
    margin: 0;
    flex: 1;
    min-width: 0;
    font-size: 48px;
    line-height: 1;
    color: var(--primary-color);
    > a {
      color: inherit;
      text-decoration: none;
    }
  }
  > a {
    font-size: 0;
  }
`;

const Header = () => {
  const { darkMode, setDarkMode } = useContext(DarkModeContext);
  return (
    <Style>
      <h1>
        <a href="/">
          <Title />
        </a>
      </h1>
      {darkMode ? (
        <Sun style={iconStyle} onClick={() => setDarkMode(false)} />
      ) : (
        <Moon style={iconStyle} onClick={() => setDarkMode(true)} />
      )}
      <a href="https://github.com/mebtte/article" title="Github Repository">
        <Github style={iconStyle} />
      </a>
    </Style>
  );
};

export default Header;
