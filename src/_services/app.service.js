import config from 'config';
import { util } from '../_helpers';

export const appService = {
    getMitmStatus,
    enableMitm,
    disableMitm,

    getAppsByUserId,
    getAppByUserId,
    enableAppByUserId,
    disableAppByUserId,

    getAppSitesByUserId,
    getAppSiteByUserId,
    enableAppSiteByUserId,
    disableAppSiteByUserId,

    getAppDataByUserId,
    enableAppDataByUserId,
    disableAppDataByUserId,
    deleteAppDataByUserId,

    getAppSiteDataByUserId,
    enableAppSiteDataByUserId,
    disableAppSiteDataByUserId,
    deleteAppSiteDataByUserId
};

// MITM
function getMitmStatus(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/mitm`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function enableMitm(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/mitm/enable`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function disableMitm(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/mitm/disable`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

// Apps
function getAppsByUserId(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getAppByUserId(userId, appId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function enableAppByUserId(userId, appId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/enable`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function disableAppByUserId(userId, appId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/disable`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

// Sites
function getAppSitesByUserId(userId, appId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/sites`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getAppSiteByUserId(userId, appId, siteId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/sites/${siteId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function enableAppSiteByUserId(userId, appId, siteId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/sites/${siteId}/enable`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function disableAppSiteByUserId(userId, appId, siteId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/sites/${siteId}/disable`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

// Data by App
function getAppDataByUserId(userId, appId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/data`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function enableAppDataByUserId(userId, appId, datumId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/data/${datumId}/enable`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function disableAppDataByUserId(userId, appId, datumId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/data/${datumId}/disable`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function deleteAppDataByUserId(userId, appId, datumId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/data/${datumId}`, util.deleteWithAuth()).then(util.handleCrudResponse(messages, errors));
}

// Data by App + Site
function getAppSiteDataByUserId(userId, appId, siteId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/sites/${siteId}/data`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function enableAppSiteDataByUserId(userId, appId, siteId, datumId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/sites/${siteId}/data/${datumId}/enable`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function disableAppSiteDataByUserId(userId, appId, siteId, datumId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/sites/${siteId}/data/${datumId}/disable`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function deleteAppSiteDataByUserId(userId, appId, siteId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/sites/${siteId}/data/${datumId}`, util.deleteWithAuth()).then(util.handleCrudResponse(messages, errors));
}
