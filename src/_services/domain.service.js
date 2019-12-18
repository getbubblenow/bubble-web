import config from 'config';
import {currentUser, getWithAuth, handleCrudResponse} from '../_helpers';

export const domainService = {
    getAll,
    getById
};

function getAll(messages, errors) {
    return fetch(`${config.apiUrl}/me/domains`, getWithAuth()).then(handleCrudResponse(messages, errors));
}

function getById(domainId, messages, errors) {
    return fetch(`${config.apiUrl}/me/domains/${domainId}`, getWithAuth()).then(handleCrudResponse(messages, errors));
}
