import config from '../config.ts';

export const siteUrl = (path = '') => new URL(path, `${config.origin.replace(/\/+$/, '')}/`).href;
export const articleUrl = (id: string) => siteUrl(encodeURIComponent(id));
