import React, { useContext, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';

import Title from './title';
import DarkModeContext from '../context/dark_mode_context';
import { Github, Sun, Moon } from './icon';

const iconStyle = {
  marginLeft: 20,
  cursor: 'pointer',
};

const Style = styled.header`
  margin: 40px 20px;
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
  > .mode {
    transition: opacity var(--transition-duration);
  }
  ${({ modeVisible }) => css`
    > .mode {
      opacity: ${modeVisible ? 1 : 0};
    }
  `}
`;

const Header = () => {
  const [modeVisible, setModeVisible] = useState(false);
  const { darkMode, setDarkMode } = useContext(DarkModeContext);

  useEffect(() => {
    setModeVisible(true);
  }, []);

  return (
    <Style modeVisible={modeVisible}>
      <h1>
        <a href="/">
          <Title />
        </a>
      </h1>
      {darkMode ? (
        <Sun
          style={iconStyle}
          onClick={() => setDarkMode(false)}
          className="mode"
        />
      ) : (
        <Moon
          style={iconStyle}
          onClick={() => setDarkMode(true)}
          className="mode"
        />
      )}
      <a href="https://github.com/mebtte/article" title="Github Repository">
        <Github style={iconStyle} />
      </a>
    </Style>
  );
};

export default Header;
