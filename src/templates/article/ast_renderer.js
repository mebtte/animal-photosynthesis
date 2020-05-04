import { createElement } from 'react';

function astRenderer(ast, key = Math.random().toString()) {
  const { type, value, tagName, properties, children } = ast;
  if (type === 'root') {
    return children.map((child, index) => astRenderer(child, index));
  }
  if (type === 'element') {
    delete properties.style;
    delete properties.dataLanguage;

    if (properties.className && Array.isArray(properties.className)) {
      properties.className = properties.className.join(' ');
    }

    // lazy loading iframe/img
    if (tagName === 'iframe' || tagName === 'img') {
      properties.loading = 'lazy';
    }

    if (tagName === 'iframe') {
      return createElement('figure', { key }, [
        createElement('iframe', { ...properties, key: 'iframe' }, null),
        createElement(
          'figcaption',
          { key: 'description' },
          properties.title || '',
        ),
      ]);
    }
    if (
      tagName === 'div' &&
      children &&
      children.length === 1 &&
      children[0].tagName === 'pre'
    ) {
      return astRenderer(children[0]);
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
      return createElement('figure', { key }, [
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
