import React from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

const FONT_PATH = '/font/title_font.ttf';

const Style = styled.span`
  @font-face {
    font-family: title_font;
    src: url('${FONT_PATH}');
  }
  font-family: title_font;
`;

const Title = () => (
  <>
    <Helmet>
      <link rel="preload" href={FONT_PATH} as="font" crossOrigin="anonymous" />
    </Helmet>
    <Style>答案</Style>
  </>
);

export default Title;
