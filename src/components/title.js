import React from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

import config from '../../config';

const Style = styled.span`
  @font-face {
    font-family: title_font;
    src: url('${config.title_font_path}');
  }
  font-family: title_font;
`;

const Title = () => (
  <>
    <Helmet>
      <link
        rel="preload"
        href={config.title_font_path}
        as="font"
        crossOrigin="anonymous"
      />
    </Helmet>
    <Style>{config.title}</Style>
  </>
);

export default Title;
