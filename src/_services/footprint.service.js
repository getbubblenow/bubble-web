import config from 'config';
import { getWithAuth, handleCrudResponse } from '../_helpers';

export const footprintService = {
    getAll,
    getById
};

function getAll(messages, errors) {
    return fetch(`${config.apiUrl}/me/footprints`, getWithAuth()).then(handleCrudResponse(messages, errors));
}

function getById(footprintId, messages, errors) {
    return fetch(`${config.apiUrl}/me/footprints/${footprintId}`, getWithAuth()).then(handleCrudResponse(messages, errors));
}
