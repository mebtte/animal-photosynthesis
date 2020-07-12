import styled, { css } from 'styled-components';

export default styled.article`
  ${({ id }) => css`
    font-family: ${id}_font;
  `}
  margin: 40px 20px;

  color: var(--normal-color);
  line-height: 1.8;

  header {
    margin-bottom: 40px;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 20px 0;
  }
  h1 {
    font-size: 31px;
  }
  h2 {
    font-size: 28px;
  }
  h3 {
    font-size: 25px;
  }
  h4 {
    font-size: 22px;
  }
  h5 {
    font-size: 19px;
  }
  h6 {
    font-size: 16px;
  }

  p {
    font-size: 16px;
    margin: 20px 0;
    code {
      padding: 0 4px;
      border-radius: var(--border-radius);
      background: rgba(237, 106, 94, 0.3) !important;
      color: inherit !important;
      font-family: fira_code;
      text-shadow: none !important;
    }
  }

  pre {
    margin: 20px 0;
    border-radius: var(--border-radius);
    overflow: auto;
    > code {
      font-family: fira_code !important;
      font-size: 14px;
      text-shadow: none !important;
    }
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
    border-bottom: 1px solid var(--primary-color);
  }

  table {
    margin: 20px 0;
    border-collapse: collapse;
    th,
    td {
      border: 1px solid var(--tertiary-color);
      padding: 10px;
      transition: all var(--transition-duration);
    }
    th {
      font-size: 16px;
    }
    td {
      font-size: 14px;
    }
  }

  figure {
    display: block;
    margin: 20px 0;
    text-align: center;
    line-height: 0;
    > img {
      max-width: 100%;
      cursor: pointer;
    }
    > iframe {
      width: 100%;
      min-height: 500px;
      border: none;
      border-radius: var(--border-radius);
    }
    > figcaption {
      font-size: 12px;
      color: var(--secondary-color);
      margin-bottom: 30px;
    }
  }

  ul,
  ol {
    margin: 20px 0;
  }

  blockquote {
    position: relative;
    margin: 20px 0;
    padding: 0 20px;
    font-style: italic;
    font-size: 14px;
    color: var(--secondary-color);
    > p {
      font-size: inherit;
    }
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 3px;
      height: 100%;
      background-color: var(--primary-color);
    }
  }

  hr {
    margin: 40px 0;
    border-width: 1px 0 0 0;
    border-color: var(--normal-color);
  }
`;
