import config from 'config';

export const fetchAPI = (url, options) => {
  return fetch(`${config.apiUrl}${url}`, options)
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return res;
      } else {
        throw Error(res.message);
      }
    });
};