import styled from 'styled-components';

export default styled.div`
  @font-face {
    font-family: 'Fira Code';
    src: url('/font/FiraCode.woff2');
  }
  line-height: 1.7;
  pre,
  code {
    font-family: 'Fira Code';
    border-radius: 0 !important;
  }
  a {
    color: #333;
    text-decoration: none;
    border-bottom: 1px solid rgba(237, 106, 94, 0.5);
  }
  img {
    max-width: 100%;
  }
  h2,
  h3,
  h4 {
    margin: 20px 0;
  }
  p {
    margin: 20px 0;
    color: #333;
  }
  ul,
  ol {
    margin: 20px;
  }
  blockquote {
    border-left: 5px solid rgba(237, 106, 94, 0.5);
    padding-left: 15px;
  }
  table {
    margin: 20px 0;
    border-collapse: collapse;
    border: 1px solid rgb(222, 222, 222);
    > thead {
      > tr {
        background-color: rgb(244, 244, 244);
        > th {
          border: 1px solid rgb(222, 222, 222);
          padding: 5px 10px;
        }
      }
    }
    > tbody {
      > tr {
        &:nth-child(even) {
          background-color: rgb(244, 244, 244);
        }
        > td {
          border: 1px solid rgb(222, 222, 222);
          font-size: 14px;
          padding: 5px 10px;
        }
      }
    }
  }
`;
