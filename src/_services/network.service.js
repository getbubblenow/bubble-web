import config from 'config';
import { getWithAuth, handleCrudResponse } from '../_helpers';

export const networkService = {
    getAll,
    getById
};

function getAll(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks`, getWithAuth()).then(handleCrudResponse(messages, errors));
}

function getById(userId, networkId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}`, getWithAuth()).then(handleCrudResponse(messages, errors));
}

function getNearestRegions(userId, footprint, messages, errors) {
    const footprintParam = (typeof footprint === "undefined" || footprint === null || footprint === '') ? "" : `?footprint=${footprint}`;
    return fetch(`${config.apiUrl}/me/regions/closest${footprintParam}`, getWithAuth()).then(handleCrudResponse(messages, errors));
}
