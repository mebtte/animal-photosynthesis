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
    color: rgb(237, 106, 94);
  }
  img {
    max-width: 100%;
  }
  blockquote {
    font-style: italic;
    padding-left: 20px;
    border-left: 2px solid rgb(237, 106, 94);
  }
`;
