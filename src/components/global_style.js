import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
:root{
  --primary-color: #333;
  --secondary-color: #888;
  --background-color: #eee;
}

* {
  box-sizing: border-box;
}

body {
  background-color: var(--background-color);
}
`;
