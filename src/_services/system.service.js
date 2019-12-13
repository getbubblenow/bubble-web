import config from 'config';
import { getWithAuth, userLoggedIn, handleBasicResponse } from '../_helpers';

export const systemService = {
    loadSystemConfigs,
    loadMessages,
    loadTimezones,
    detectTimezone
};

function loadSystemConfigs() {
    const requestOptions = userLoggedIn() ? getWithAuth() : { method: 'GET' };
    return fetch(`${config.apiUrl}/auth/configs`, requestOptions)
        .then(handleBasicResponse)
        .then(configs => { return configs; });
}

function loadMessages(group, locale) {
    const requestOptions = userLoggedIn() ? getWithAuth() : { method: 'GET' };
    if (!locale || locale === '') locale = 'detect';
    return fetch(`${config.apiUrl}/messages/${locale}/${group}`, requestOptions)
        .then(handleBasicResponse)
        .then(messages => { return messages; });
}

function loadTimezones() {
    const requestOptions = userLoggedIn() ? getWithAuth() : { method: 'GET' };
    return fetch(`${config.apiUrl}/timezones`, requestOptions)
        .then(handleBasicResponse)
        .then(timezones => { return timezones; });
}

function detectTimezone() {
    return fetch(`${config.apiUrl}/me/detect/timezone`, getWithAuth())
        .then(handleBasicResponse)
        .then(timezone => { return timezone; });
}
