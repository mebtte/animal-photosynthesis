import { createElement } from 'react';

function astRenderer(ast, key) {
  const { type, value, tagName, properties, children } = ast;
  if (type === 'root') {
    return children.map((child, index) => astRenderer(child, index));
  }
  if (type === 'element') {
    delete properties.style;
    delete properties.dataLanguage;

    // lazy loading iframe/img
    if (tagName === 'iframe' || tagName === 'img') {
      properties.loading = 'lazy';
    }

    if (
      tagName === 'p' &&
      children &&
      children.length === 1 &&
      children[0].tagName === 'img'
    ) {
      return astRenderer(children[0]);
    }
    if (tagName === 'a') {
      return createElement(
        'a',
        {
          ...properties,
          key,
          target: '_blank',
          rel: 'noopener noreferer',
        },
        children && children.length
          ? children.map((child, index) => astRenderer(child, index))
          : null,
      );
    }
    if (tagName === 'img') {
      return createElement('figure', { key: Math.random().toString() }, [
        createElement('img', {
          ...properties,
          title: properties.alt || '',
          onClick: () => window.open(properties.src),
          key: 'img',
        }),
        createElement(
          'figcaption',
          { key: 'description' },
          properties.alt || '',
        ),
      ]);
    }
    return createElement(
      tagName,
      { ...properties, key },
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
