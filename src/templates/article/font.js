import React from 'react';
import Types from 'prop-types';
import { createGlobalStyle, css } from 'styled-components';
import { Helmet } from 'react-helmet';

const Style = createGlobalStyle`
  ${({ id, fontPath }) => css`
    @font-face {
      font-family: ${id}_font;
      src: url('${fontPath}');
    }
  `}
  @font-face {
    font-family: fira_code;
    src: url('/font/fira_code.woff2');
  }
`;

const Font = ({ id }) => {
  const fontPath = `/font/articles/${id}.ttf`;
  return (
    <>
      <Helmet>
        <link rel="preload" href={fontPath} as="font" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="/font/fira_code.woff2"
          as="font"
          crossOrigin="anonymous"
        />
      </Helmet>
      <Style id={id} fontPath={fontPath} />
    </>
  );
};
Font.propTypes = {
  id: Types.string.isRequired,
};

export default Font;
