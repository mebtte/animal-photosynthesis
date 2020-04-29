import React, { useContext, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';

import Title from '../../components/title';
import DarkModeContext from '../../context/dark_mode_context';
import { Github, Sun, Moon } from '../../components/icon';

const Style = styled.header`
  margin: 40px 20px;
  display: flex;
  align-items: center;
  > h3 {
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
const IconWrapper = styled.span`
  margin-left: 20px;
  cursor: pointer;
`;

const Header = () => {
  const [modeVisible, setModeVisible] = useState(false);
  const { darkMode, setDarkMode } = useContext(DarkModeContext);

  useEffect(() => {
    setModeVisible(true);
  }, []);

  return (
    <Style modeVisible={modeVisible}>
      <h3>
        <a href="/">
          <Title />
        </a>
      </h3>
      {darkMode ? (
        <IconWrapper>
          <Sun onClick={() => setDarkMode(false)} className="mode" />
        </IconWrapper>
      ) : (
        <IconWrapper>
          <Moon onClick={() => setDarkMode(true)} className="mode" />
        </IconWrapper>
      )}
      <IconWrapper>
        <a href="https://github.com/mebtte/article" title="Github Repository">
          <Github />
        </a>
      </IconWrapper>
    </Style>
  );
};

export default Header;
