import config from 'config';
import { util } from '../_helpers';

export const systemService = {
    loadIsActivated,
    activate,
    loadSystemConfigs,
    loadEntityConfigs,
    search,
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

function loadEntityConfigs() {
    const requestOptions = util.userLoggedIn() ? util.getWithAuth() : { method: 'GET' };
    return fetch(`${config.apiUrl}/ec?full=true`, requestOptions)
        .then(util.handleBasicResponse)
        .then(config => { return config; });
}

function search(type, query) {
    return fetch(`${config.apiUrl}/search/${type}`, util.postWithAuth(query))
        .then(util.handleBasicResponse)
        .then(config => { return config; });
}

function createEntity(config, json, messages, errors) {
    let requestOptions = null;
    if (config.createMethod) {
        if (config.createMethod === 'PUT') {
            requestOptions = util.putJsonWithAuth(json);
        } else if (config.createMethod === 'POST') {
            requestOptions = util.putJsonWithAuth(json);
        }
    }
    if (requestOptions === null) requestOptions = util.putJsonWithAuth(json);
    return fetch(`${config.apiUrl}/${config.createUri}`, requestOptions)
        .then(util.handleCrudResponse(messages, errors))
        .then(config => { return config; });
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
