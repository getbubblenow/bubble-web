/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import config from 'config';
import { util } from '../_helpers';

export const appService = {
    getAppsByUserId,
    getAppByUserId,
    getAppAssetByUserId,
    enableAppByUserId,
    disableAppByUserId,

    getAppSitesByUserId,
    getAppSiteByUserId,
    enableAppSiteByUserId,
    disableAppSiteByUserId,

    getAppDataByUserId,
    getAppSiteDataByUserId,
    takeDataAction,

    getAppConfigViewByUserId,
    takeConfigItemAction,
    takeConfigAppAction
};

// Apps
function getAppsByUserId(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getAppByUserId(userId, appId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getAppAssetByUserId(userId, appId, assetId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/assets/${assetId}`, util.getWithAuth()).then(util.handlePlaintextResponse(messages, errors));
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

// Data
function getAppDataByUserId(userId, appId, viewId, query, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/view/${viewId}`, util.postWithAuth(query)).then(util.handleCrudResponse(messages, errors));
}

function getAppSiteDataByUserId(userId, appId, siteId, viewId, query, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/sites/${siteId}/view/${viewId}`, util.postWithAuth(query)).then(util.handleCrudResponse(messages, errors));
}

function takeDataAction(userId, appId, dataId, action, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/data/${dataId}/actions/${action}`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

// Config
function getAppConfigViewByUserId(userId, appId, viewId, itemId, messages, errors) {
    const id = (typeof itemId !== 'undefined' && itemId !== null ? `?id=${itemId}` : '');
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/config/${viewId}${id}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function takeConfigItemAction(userId, appId, viewId, itemId, params, action, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/config/${viewId}/actions/${action}?id=${itemId}`, util.postWithAuth(params)).then(util.handleCrudResponse(messages, errors));
}

function takeConfigAppAction(userId, appId, viewId, itemId, params, action, messages, errors) {
    const id = (typeof itemId !== 'undefined' && itemId !== null ? `?id=${itemId}` : '');
    return fetch(`${config.apiUrl}/users/${userId}/apps/${appId}/config/${viewId}/actions/${action}${id}`, util.putWithAuth(params)).then(util.handleCrudResponse(messages, errors));
}
