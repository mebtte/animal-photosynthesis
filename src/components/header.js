import React, { useContext } from 'react';
import Types from 'prop-types';
import styled, { keyframes } from 'styled-components';
import { Link } from 'gatsby';

import Title from './title';
import DarkModeContext from '../context/dark_mode_context';
import { Github, Sun, Moon, Rss } from './icon';

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
    opacity: 0;
    animation-name: ${fadeIn};
    animation-duration: 1s;
    animation-fill-mode: forwards;
    animation-delay: 1s;
  }
`;
const IconWrapper = styled.span`
  margin-left: 20px;
  cursor: pointer;
`;

const Header = ({ main, titleFontPath }) => {
  const { darkMode, setDarkMode } = useContext(DarkModeContext);
  return (
    <Style>
      {main ? (
        <h1>
          <Link to="/">
            <Title fontPath={titleFontPath} />
          </Link>
        </h1>
      ) : (
        <h3>
          <Link to="/">
            <Title fontPath={titleFontPath} />
          </Link>
        </h3>
      )}
      {darkMode ? (
        <IconWrapper className="mode">
          <Sun onClick={() => setDarkMode(false)} />
        </IconWrapper>
      ) : (
        <IconWrapper className="mode">
          <Moon onClick={() => setDarkMode(true)} />
        </IconWrapper>
      )}
      <IconWrapper>
        <a href="/rss.xml" title="RSS">
          <Rss />
        </a>
      </IconWrapper>
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
  titleFontPath: Types.string.isRequired,
};
Header.defaultProps = {
  main: false,
};

export default Header;
