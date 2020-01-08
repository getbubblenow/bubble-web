import config from 'config';
import { util } from '../_helpers';

export const networkService = {
    getAll,
    getById,
    getNearestRegions,
    startNetwork
};

function getAll(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getById(userId, networkId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getNearestRegions(userId, footprint, messages, errors) {
    const footprintParam = (typeof footprint === 'undefined' || footprint === null || footprint === '') ? "" : `?footprint=${footprint}`;
    return fetch(`${config.apiUrl}/me/regions/closest${footprintParam}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function startNetwork(userId, planId, cloud, region) {
    const cloudAndRegion = (typeof cloud === 'undefined' || typeof region === 'undefined' || cloud === null || region === null) ? "" : `?cloud=${cloud}&region=${region}`;
    return fetch(`${config.apiUrl}/networks/${planId}/actions/start${cloudAndRegion}`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}