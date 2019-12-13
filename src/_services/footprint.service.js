import config from 'config';
import { getWithAuth, handleCrudResponse } from '../_helpers';

export const footprintService = {
    getAll,
    getById
};

function getAll() {
    return fetch(`${config.apiUrl}/me/footprints`, getWithAuth()).then(handleCrudResponse);
}

function getById(footprintId) {
    return fetch(`${config.apiUrl}/me/footprints/${footprintId}`, getWithAuth()).then(handleCrudResponse);
}
