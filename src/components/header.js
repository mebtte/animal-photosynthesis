import React, { useContext, useState, useEffect } from 'react';
import Types from 'prop-types';
import styled, { keyframes } from 'styled-components';

import Title from './title';
import DarkModeContext from '../context/dark_mode_context';
import { Github, Sun, Moon } from './icon';

const fadeIn = keyframes`
  0% {
    opacity: 0;
  } 100% {
    opacity: 1;
  }
`;
const Style = styled.header`
  margin: 40px 20px;
  display: flex;
  align-items: center;
  > h1,
  > h3 {
    margin: 0;
    flex: 1;
    min-width: 0;
    font-size: 48px;
    line-height: 1;
    > a {
      color: inherit;
      text-decoration: none;
    }
  }
  > h1 {
    color: var(--normal-color);
  }
  > h3 {
    color: var(--primary-color);
  }
  > a {
    font-size: 0;
  }
  > .mode {
    animation: ${fadeIn} 1s;
  }
`;
const IconWrapper = styled.span`
  margin-left: 20px;
  cursor: pointer;
`;

const Header = ({ main }) => {
  const [modeVisible, setModeVisible] = useState(false);
  const { darkMode, setDarkMode } = useContext(DarkModeContext);

  useEffect(() => {
    setTimeout(() => setModeVisible(true), 0);
  }, []);

  return (
    <Style>
      {main ? (
        <h1>
          <a href="/">
            <Title />
          </a>
        </h1>
      ) : (
        <h3>
          <a href="/">
            <Title />
          </a>
        </h3>
      )}
      {/* eslint-disable-next-line no-nested-ternary */}
      {modeVisible ? (
        darkMode ? (
          <IconWrapper className="mode">
            <Sun onClick={() => setDarkMode(false)} />
          </IconWrapper>
        ) : (
          <IconWrapper className="mode">
            <Moon onClick={() => setDarkMode(true)} />
          </IconWrapper>
        )
      ) : null}
      <IconWrapper>
        <a href="https://github.com/mebtte/article" title="Github Repository">
          <Github />
        </a>
      </IconWrapper>
    </Style>
  );
};
Header.propTypes = {
  main: Types.bool,
};
Header.defaultProps = {
  main: false,
};

export default Header;
