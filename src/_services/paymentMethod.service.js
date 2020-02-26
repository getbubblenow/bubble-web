/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://git.bubblev.org/bubblev/bubble/src/branch/master/LICENSE.md
 */
import config from 'config';
import { util } from '../_helpers';

export const paymentMethodService = {
    getAllPaymentMethods,
    getAllAccountPaymentMethods,
    getPublicById,
    getAllByAccount,
    getByAccountAndId,
    addAccountPaymentMethod,
    setAccountPaymentMethodForPlan,
    deleteAccountPaymentMethod,
};

function getAllPaymentMethods(messages, errors) {
    return fetch(`${config.apiUrl}/paymentMethods`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getAllAccountPaymentMethods(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/paymentMethods?all=true`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
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

function setAccountPaymentMethodForPlan(userId, planId, pmId, messages, errors) {
    const update = {paymentMethod: pmId};
    return fetch(`${config.apiUrl}/users/${userId}/plans/${planId}`, util.postWithAuth(update)).then(util.handleCrudResponse(messages, errors));
}

function deleteAccountPaymentMethod(userId, pmId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/paymentMethods/${pmId}`, util.deleteWithAuth()).then(util.handleCrudResponse(messages, errors));
}
