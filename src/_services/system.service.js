import config from 'config';
import { util } from '../_helpers';

export const systemService = {
    loadIsActivated,
    activate,
    loadSystemConfigs,
    loadMessages,
    loadTimezones,
    detectTimezone,
    detectLocale
};

function loadIsActivated () {
    const requestOptions = { method: 'GET' };
    return fetch(`${config.apiUrl}/auth/activate`, requestOptions)
        .then(util.handleBasicResponse)
        .then(activated => { return activated; });
}

function activate (activation) {
    const requestOptions = util.putNoAuth(activation);
    return fetch(`${config.apiUrl}/auth/activate`, requestOptions)
        .then(util.handleBasicResponse)
        .then(admin => { return admin; });
}

function loadSystemConfigs() {
    const requestOptions = util.userLoggedIn() ? util.getWithAuth() : { method: 'GET' };
    return fetch(`${config.apiUrl}/auth/configs`, requestOptions)
        .then(util.handleBasicResponse)
        .then(configs => { return configs; });
}

function loadMessages(group, locale) {
    const requestOptions = util.userLoggedIn() ? util.getWithAuth() : { method: 'GET' };
    if (!locale || locale === '') locale = 'detect';
    return fetch(`${config.apiUrl}/messages/${locale}/${group}`, requestOptions)
        .then(util.handleBasicResponse)
        .then(messages => { return messages; });
}

function loadTimezones() {
    const requestOptions = util.userLoggedIn() ? util.getWithAuth() : { method: 'GET' };
    return fetch(`${config.apiUrl}/timezones`, requestOptions)
        .then(util.handleBasicResponse)
        .then(timezones => { return timezones; });
}

function detectTimezone() {
    const requestOptions = util.userLoggedIn() ? util.getWithAuth() : { method: 'GET' };
    return fetch(`${config.apiUrl}/detect/timezone`, requestOptions)
        .then(util.handleBasicResponse)
        .then(timezone => { return timezone; });
}

function detectLocale () {
    const requestOptions = util.userLoggedIn() ? util.getWithAuth() : { method: 'GET' };
    return fetch(`${config.apiUrl}/detect/locale`, requestOptions)
        .then(util.handleBasicResponse)
        .then(locales => { return locales; });
}
