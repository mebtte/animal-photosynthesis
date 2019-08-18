import styled from 'styled-components';

import firaCode from '../../assets/font/FiraCode.woff2';

export default styled.div`
  @font-face {
    font-family: 'Fira Code';
    src: url(${firaCode});
  }
  line-height: 1.7;
  pre,
  code {
    font-family: 'Fira Code';
    border-radius: 0 !important;
  }
  h2,
  p,
  hr {
    margin: 20px 0;
  }
  ol,
  ul {
    margin: 20px 0 20px 20px;
  }
  strong {
    font-weight: bold;
  }
  img {
    max-width: 100%;
  }
`;
