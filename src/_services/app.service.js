import config from 'config';
import { util } from '../_helpers';

export const appService = {
    getMitmStatus,
    enableMitm,
    disableMitm,
    getAppsByUserId,
    getAppByUserId,
    enableAppByUserId,
    disableAppByUserId
};

function getMitmStatus(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/mitm`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function enableMitm(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/mitm/enable`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function disableMitm(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/mitm/disable`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getAppsByUserId(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getAppByUserId(userId, appId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}`, util.getWithAuth()).then(util.handlePlaintextResponse(messages, errors));
}

function enableAppByUserId(userId, appId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/enable`, util.postWithAuth()).then(util.handlePlaintextResponse(messages, errors));
}

function disableAppByUserId(userId, appId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/disable`, util.postWithAuth()).then(util.handlePlaintextResponse(messages, errors));
}
