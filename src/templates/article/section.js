import styled, { css } from 'styled-components';

export default styled.section`
  ${({ id }) => css`
    font-family: ${id}_font;
  `}
  margin: 40px 0;
  color: var(--normal-color);
  font-size: 16px;

  code {
    font-family: fira_code !important;
  }
`;
