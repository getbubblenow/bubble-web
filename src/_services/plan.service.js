import config from 'config';
import { getWithAuth, handleCrudResponse } from '../_helpers';

export const planService = {
    getAll,
    getById
};

function getAll(messages, errors) {
    return fetch(`${config.apiUrl}/plans`, getWithAuth()).then(handleCrudResponse(messages, errors));
}

function getById(planId, messages, errors) {
    return fetch(`${config.apiUrl}/plans/${planId}`, getWithAuth()).then(handleCrudResponse(messages, errors));
}
