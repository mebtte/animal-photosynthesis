import { createElement } from 'react';

function astRenderer(ast, key) {
  const { type, value, tagName, properties, children } = ast;
  if (type === 'root') {
    return children.map((child, index) => astRenderer(child, index));
  }
  if (type === 'element') {
    delete properties.style;

    // lazy loading iframe/img
    if (tagName === 'iframe' || tagName === 'img') {
      properties.loading = 'lazy';
    }

    if (tagName === 'a') {
      return createElement(
        'a',
        {
          ...properties,
          target: '_blank',
          rel: 'noopener noreferer',
        },
        children && children.length
          ? children.map((child, index) => astRenderer(child, index))
          : null,
      );
    }
    if (tagName === 'img') {
      return createElement('figure', null, [
        createElement('img', {
          ...properties,
          title: properties.alt || '',
          onClick: () => window.open(properties.src),
        }),
        createElement('figcaption', null, properties.alt || ''),
      ]);
    }
    return createElement(
      tagName,
      { key, ...properties },
      children && children.length
        ? children.map((child, index) => astRenderer(child, index))
        : null,
    );
  }
  if (type === 'text') {
    return value;
  }
  return null;
}

export default astRenderer;
