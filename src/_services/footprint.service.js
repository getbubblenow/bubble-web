import config from 'config';
import { util } from '../_helpers';

export const footprintService = {
    getAll,
    getById
};

function getAll(messages, errors) {
    return fetch(`${config.apiUrl}/me/footprints`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getById(footprintId, messages, errors) {
    return fetch(`${config.apiUrl}/me/footprints/${footprintId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}
