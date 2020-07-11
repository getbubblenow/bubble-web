/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import config from 'config';
import { util } from '~/_helpers';

export const deviceService = {
    getDevicesByUserId,
    getAllDevicesByUserId,
    getAllDeviceTypesByUserId,
    setDeviceSecurityLevel,
    getDeviceQRcodeById,
    getDeviceVPNconfById,
    addDeviceByUserId,
    removeDeviceByUserId
};

function getDevicesByUserId(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/devices`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getAllDevicesByUserId(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/devices?all`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getAllDeviceTypesByUserId(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/deviceTypes`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function setDeviceSecurityLevel(userId, deviceId, securityLevel, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/devices/${deviceId}/securityLevel/${securityLevel}`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getDeviceQRcodeById(userId, deviceId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/devices/${deviceId}/vpn/QR.png.base64`, util.getWithAuth()).then(util.handlePlaintextResponse(messages, errors));
}

function getDeviceVPNconfById(userId, deviceId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/devices/${deviceId}/vpn/vpn.conf.base64`, util.getWithAuth()).then(util.handlePlaintextResponse(messages, errors));
}

function addDeviceByUserId(userId, device, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/devices`, util.putWithAuth(device)).then(util.handleCrudResponse(messages, errors));
}

function removeDeviceByUserId(userId, deviceId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/devices/${deviceId}`, util.deleteWithAuth()).then(util.handleCrudResponse(messages, errors));
}
