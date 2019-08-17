export default (search) => {
  const query = {};
  search
    .replace(/\?/g, '')
    .split('&')
    .forEach((kv) => {
      const [key, value] = kv.split('=');
      query[key] = value;
    });
  return query;
};
