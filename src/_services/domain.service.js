import config from 'config';
import { util } from '../_helpers';

export const domainService = {
    getAllDomains,
    getDomainById
};

function getAllDomains(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/domains`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getDomainById(userId, domainId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/domains/${domainId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}
