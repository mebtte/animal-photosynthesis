export default (search) => {
  const query = {};
  const s = search.replace(/\?/g, '');
  if (s) {
    s.split('&').forEach((kv) => {
      const [key, value] = kv.split('=');
      query[key] = value;
    });
  }
  return query;
};
