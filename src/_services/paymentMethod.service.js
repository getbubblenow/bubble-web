import config from 'config';
import { getWithAuth, putWithAuth, handleCrudResponse } from '../_helpers';

export const paymentMethodService = {
    getAll,
    getById,
    getAllByAccount,
    getByAccountAndId,
    addAccountPaymentMethod
};

function getAll(messages, errors) {
    return fetch(`${config.apiUrl}/paymentMethods`, getWithAuth()).then(handleCrudResponse(messages, errors));
}

function getById(paymentMethodId, messages, errors) {
    return fetch(`${config.apiUrl}/paymentMethods/${paymentMethodId}`, getWithAuth()).then(handleCrudResponse(messages, errors));
}

function getAllByAccount(messages, errors) {
    return fetch(`${config.apiUrl}/me/paymentMethods`, getWithAuth()).then(handleCrudResponse(messages, errors));
}

function getByAccountAndId(paymentMethodId, messages, errors) {
    return fetch(`${config.apiUrl}/me/paymentMethods/${paymentMethodId}`, getWithAuth()).then(handleCrudResponse(messages, errors));
}

function addAccountPaymentMethod(paymentMethod, messages, errors) {
    console.log("pmService: paymentMethod="+JSON.stringify(paymentMethod));
    return fetch(`${config.apiUrl}/me/paymentMethods`, putWithAuth(paymentMethod)).then(handleCrudResponse(messages, errors));
}
