import config from 'config';
import { getWithAuth, handleCrudResponse } from '../_helpers';

export const domainService = {
    getAll,
    getById
};

function getAll(userId) {
    return fetch(`${config.apiUrl}/users/${userId}/domains`, getWithAuth()).then(handleCrudResponse);
}

function getById(userId, domainId) {
    return fetch(`${config.apiUrl}/users/${userId}/domains/${domainId}`, getWithAuth()).then(handleCrudResponse);
}
