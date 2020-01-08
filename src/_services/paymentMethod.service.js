import config from 'config';
import { util } from '../_helpers';

export const paymentMethodService = {
    getAll,
    getById,
    getAllByAccount,
    getByAccountAndId,
    addAccountPaymentMethod
};

function getAll(messages, errors) {
    return fetch(`${config.apiUrl}/paymentMethods`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getById(paymentMethodId, messages, errors) {
    return fetch(`${config.apiUrl}/paymentMethods/${paymentMethodId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getAllByAccount(messages, errors) {
    return fetch(`${config.apiUrl}/me/paymentMethods`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getByAccountAndId(paymentMethodId, messages, errors) {
    return fetch(`${config.apiUrl}/me/paymentMethods/${paymentMethodId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function addAccountPaymentMethod(paymentMethod, messages, errors) {
    return fetch(`${config.apiUrl}/me/paymentMethods`, util.putWithAuth(paymentMethod)).then(util.handleCrudResponse(messages, errors));
}
