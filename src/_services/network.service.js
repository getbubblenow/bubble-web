import config from 'config';
import { util } from '../_helpers';

export const networkService = {
    getAllNetworks,
    getNetworkById,
    getNearestRegions,
    startNetwork,
    getStatusesByNetworkId,
    getNodesByNetworkId,
    deleteNetwork
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

function startNetwork(userId, planId, cloud, region, messages, errors) {
    const cloudAndRegion = (typeof cloud === 'undefined' || typeof region === 'undefined' || cloud === null || region === null) ? "" : `?cloud=${cloud}&region=${region}`;
    return fetch(`${config.apiUrl}/users/${userId}/networks/${planId}/actions/start${cloudAndRegion}`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getStatusesByNetworkId(userId, networkId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}/actions/status`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getNodesByNetworkId(userId, networkId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}/nodes`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function deleteNetwork(userId, networkId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}/actions/stop`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}
