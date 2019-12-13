import config from 'config';
import { getWithAuth, handleCrudResponse } from '../_helpers';

export const networkService = {
    getAll,
    getById
};

function getAll(userId) {
    return fetch(`${config.apiUrl}/users/${userId}/networks`, getWithAuth()).then(handleCrudResponse);
}

function getById(userId, networkId) {
    return fetch(`${config.apiUrl}/users/${userId}/networks/${networkId}`, getWithAuth()).then(handleCrudResponse);
}
