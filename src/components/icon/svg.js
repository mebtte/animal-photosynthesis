import React from 'react';
import Types from 'prop-types';
import styled from 'styled-components';

const Style = styled.svg.attrs(({ size }) => ({
  width: size,
  height: size,
  viewBox: '0 0 1024 1024',
}))`
  path {
    fill: var(--normal-color);
    transition: fill var(--transition-duration);
  }
`;

const Svg = ({ size, children, ...props }) => (
  <Style size={size} {...props}>
    {children}
  </Style>
);
Svg.propTypes = {
  size: Types.number,
  children: Types.node,
};
Svg.defaultProps = {
  size: 24,
  children: null,
};

export default Svg;
