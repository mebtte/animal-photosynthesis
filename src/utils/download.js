export default async (url) => {
  const response = await window.fetch(url);
  const { status, statusText } = response;
  if (status !== 200) {
    throw new Error(`${status}:${statusText}`);
  }
  return response.blob();
};
