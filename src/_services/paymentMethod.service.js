import config from 'config';
import { util } from '../_helpers';

export const paymentMethodService = {
    getAllPaymentMethods,
    getPublicById,
    getAllByAccount,
    getByAccountAndId,
    addAccountPaymentMethod
};

function getAllPaymentMethods(messages, errors) {
    return fetch(`${config.apiUrl}/paymentMethods`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getPublicById(paymentMethodId, messages, errors) {
    return fetch(`${config.apiUrl}/paymentMethods/${paymentMethodId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getAllByAccount(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/paymentMethods`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getByAccountAndId(userId, paymentMethodId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/paymentMethods/${paymentMethodId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function addAccountPaymentMethod(userId, paymentMethod, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/paymentMethods`, util.putWithAuth(paymentMethod)).then(util.handleCrudResponse(messages, errors));
}
