import config from 'config';
import { getWithAuth, handleCrudResponse } from '../_helpers';

export const paymentMethodService = {
    getAll,
    getById
};

function getAll() {
    return fetch(`${config.apiUrl}/paymentMethods`, getWithAuth()).then(handleCrudResponse);
}

function getById(paymentMethodId) {
    return fetch(`${config.apiUrl}/paymentMethods/${paymentMethodId}`, getWithAuth()).then(handleCrudResponse);
}
