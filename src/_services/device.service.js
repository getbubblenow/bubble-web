import config from 'config';
import { util } from '../_helpers';

export const deviceService = {
    getDevicesByUserId,
    addDeviceByUserId,
    removeDeviceByUserId
};

function getDevicesByUserId(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/devices`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function addDeviceByUserId(userId, device, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/devices`, util.putWithAuth(device)).then(util.handleCrudResponse(messages, errors));
}

function removeDeviceByUserId(userId, deviceId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/devices/${deviceId}`, util.deleteWithAuth()).then(util.handleCrudResponse(messages, errors));
}
