import React from 'react';
import Types from 'prop-types';
import styled, { css } from 'styled-components';
import { Helmet } from 'react-helmet';

import config from '../../config';

const FONT_FAMILY = 'title_font';

const Style = styled.span`
  ${({ fontPath }) => css`
    @font-face {
      font-family: ${FONT_FAMILY};
      src: url('${fontPath}');
    }
  `}
  font-family: ${FONT_FAMILY};
`;

const Title = ({ fontPath }) => (
  <>
    <Helmet>
      <link rel="preload" href={fontPath} as="font" crossOrigin="anonymous" />
    </Helmet>
    <Style fontPath={fontPath}>{config.title}</Style>
  </>
);
Title.propTypes = {
  fontPath: Types.string.isRequired,
};

export default Title;
