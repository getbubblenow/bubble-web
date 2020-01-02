import config from 'config';
import { util } from '../_helpers';

export const domainService = {
    getAll,
    getById
};

function getAll(messages, errors) {
    return fetch(`${config.apiUrl}/me/domains`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getById(domainId, messages, errors) {
    return fetch(`${config.apiUrl}/me/domains/${domainId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}
