import styled, { css } from 'styled-components';

export default styled.section`
  ${({ id }) => css`
    font-family: ${id}_font;
  `}
  margin: 40px 0;
  color: var(--normal-color);
  font-size: 16px;

  p {
    line-height: 1.5;
    code {
      padding: 2px 4px;
      border-radius: var(--border-radius);
      background: var(--tertiary-color);
    }
  }

  pre {
    padding: 20px;
    border-radius: var(--border-radius);
    background: var(--tertiary-color);
    font-size: 14px;
    overflow: auto;
  }

  code {
    font-family: fira_code;
  }

  a {
    color: var(--primary-color);
  }

  table {
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
`;
