/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import config from 'config';
import { util } from '~/_helpers';

export const networkService = {
    getAllNetworks,
    getNetworkById,
    getNearestRegions,
    startNetwork,
    queueBackup,
    forkNetwork,
    getStatusesByNetworkId,
    getNodesByNetworkId,
    stopNetwork,
    restoreNetwork,
    deleteNetwork,
    requestNetworkKeys,
    retrieveNetworkKeys,
    startBackupPackageDownload,
    backupPackageStatus,
    backupPackageDownload,
    getNetworkBackups,
    getLogFlag, enableLog, disableLog
};

function getAllNetworks(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getNetworkById(userId, networkId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getNearestRegions(footprint, messages, errors) {
    const footprintParam = (typeof footprint === 'undefined' || footprint === null || footprint === '') ? "" : `?footprint=${footprint}`;
    return fetch(`${config.apiUrl}/me/regions/closest${footprintParam}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getCloudAndRegion(cloud, region, exactRegion) {
    return `?cloud=${cloud}&region=${region}&exactRegion=${exactRegion}`;
}

function startNetwork(userId, planId, cloud, region, exactRegion, messages, errors) {
    const cloudAndRegion = getCloudAndRegion(cloud, region, exactRegion);
    return fetch(`${config.apiUrl}/users/${userId}/networks/${planId}/actions/start${cloudAndRegion}`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function forkNetwork(userId, planId, forkHost, adminEmail, cloud, region, exactRegion, messages, errors) {
    const forkRequest = {
        fqdn: forkHost,
        adminEmail: adminEmail,
        cloud: cloud,
        region: region,
        exactRegion: exactRegion
    };
    return fetch(`${config.apiUrl}/users/${userId}/networks/${planId}/actions/fork`, util.putWithAuth(forkRequest)).then(util.handleCrudResponse(messages, errors));
}

function getStatusesByNetworkId(userId, networkId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}/actions/status`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getNodesByNetworkId(userId, networkId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}/nodes`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function stopNetwork(userId, networkId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}/actions/stop`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function queueBackup(userId, networkId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}/backups/user_requested`, util.putWithAuth())
            .then(util.handleCrudResponse(messages, errors));
}

function restoreNetwork(userId, networkId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}/actions/restore`,
                 util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

// deleting network is not allowed via API, instead we delete the AccountPlan, which in turn deletes the network
function deleteNetwork(userId, networkId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/plans/${networkId}`, util.deleteWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function requestNetworkKeys(userId, networkId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}/actions/keys`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function retrieveNetworkKeys(userId, networkId, code, password, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}/actions/keys/${code}`,
                 util.postWithAuth({ name: 'password', value: password }))
            .then(util.handleCrudResponse(messages, errors))
            .then(netKeyObj => netKeyObj.data)
            .then(util.handleDataToDownloadAsFile('restore.' + networkId + '.key', 'text/plain'));
}
function startBackupPackageDownload(userId, networkId, code, password, backupId) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}/actions/keys/${code}/backups/start?backupId=${backupId}`,
                 util.postWithAuth({ name: 'password', value: password }))
            .then(util.handleBasicResponse);
}
function backupPackageStatus(userId, networkId, code, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}/actions/keys/${code}/backups/status`,
                 util.getWithAuth())
            .then(util.handleCrudResponse(messages, errors));
}
function backupPackageDownload(userId, networkId, code, messages, errors) {
    const getWithAuth = util.getWithAuth();
    getWithAuth.responseType = 'blob';
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}/actions/keys/${code}/backups/download`,
                 getWithAuth)
            .then(util.handleResponseToDownloadAsFile(`backup.${networkId}.tgz.enc`),
                  util.handleCrudResponse(messages, errors));
}

function getNetworkBackups(userId, networkId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}/backups`, util.getWithAuth())
            .then(util.handleCrudResponse(messages, errors));
}

function getLogFlag(networkId, messages, errors) {
    return fetch(`${config.apiUrl}/me/networks/${networkId}/logs/status`, util.getWithAuth())
            .then(util.handleCrudResponse(messages, errors));
}
function disableLog(networkId, messages, errors) {
    return fetch(`${config.apiUrl}/me/networks/${networkId}/logs/stop`, util.postWithAuth())
            .then(util.handlePlaintextResponse(messages, errors));
}
function enableLog(disableInDays, networkId, messages, errors) {
    const ttlDaysParam = disableInDays ? '?ttlDays=' + disableInDays : '';
    return fetch(`${config.apiUrl}/me/networks/${networkId}/logs/start` + ttlDaysParam, util.postWithAuth())
            .then(util.handlePlaintextResponse(messages, errors));
}
