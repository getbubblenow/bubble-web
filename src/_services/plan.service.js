import config from 'config';
import { util } from '../_helpers';

export const planService = {
    getAll,
    getById
};

function getAll(messages, errors) {
    return fetch(`${config.apiUrl}/plans`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getById(planId, messages, errors) {
    return fetch(`${config.apiUrl}/plans/${planId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}
