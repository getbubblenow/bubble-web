/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
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