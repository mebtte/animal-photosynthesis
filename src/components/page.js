import React, { useState, useCallback, useEffect } from 'react';
import Types from 'prop-types';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

import { STORAGE_KEY } from '../constants';

import GlobalStyle from './global_style';
import DarkModeContext from '../context/dark_mode_context';

const { Provider } = DarkModeContext;

const Style = styled.div`
  width: 100%;
  max-width: 840px;
  margin: 0 auto;
`;

const Page = ({ componentFontPath, children, ...props }) => {
  const [darkMode, setDarkMode] = useState(false);
  const setDarkModeWrapper = useCallback((m) => {
    if (m) {
      localStorage.setItem(STORAGE_KEY.DARK_MODE, 1);
    } else {
      localStorage.removeItem(STORAGE_KEY.DARK_MODE);
    }
    return setDarkMode(m);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.className = 'dark';
    } else {
      document.body.className = '';
    }
  }, [darkMode]);
  useEffect(() => {
    setDarkMode(!!localStorage.getItem(STORAGE_KEY.DARK_MODE));
    const storageChange = (event) => {
      const { key, newValue } = event;
      if (key === STORAGE_KEY.DARK_MODE) {
        setDarkMode(!!newValue);
      }
    };
    window.addEventListener('storage', storageChange);
    return () => window.removeEventListener('storage', storageChange);
  }, []);

  return (
    <Provider value={{ darkMode, setDarkMode: setDarkModeWrapper }}>
      <Style {...props}>
        <Helmet>
          <link
            rel="preload"
            href={componentFontPath}
            as="font"
            crossOrigin="anonymous"
          />
        </Helmet>
        <GlobalStyle componentFontPath={componentFontPath} />
        {children}
      </Style>
    </Provider>
  );
};
Page.propTypes = {
  componentFontPath: Types.string.isRequired,
  children: Types.node.isRequired,
};

export default Page;
