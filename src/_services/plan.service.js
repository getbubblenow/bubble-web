import config from 'config';
import { getWithAuth, handleCrudResponse } from '../_helpers';

export const planService = {
    getAll,
    getById
};

function getAll() {
    return fetch(`${config.apiUrl}/plans`, getWithAuth()).then(handleCrudResponse);
}

function getById(planId) {
    return fetch(`${config.apiUrl}/plans/${planId}`, getWithAuth()).then(handleCrudResponse);
}
