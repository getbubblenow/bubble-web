import config from 'config';
import { getWithAuth, putWithAuth, handleCrudResponse } from '../_helpers';

export const accountPlanService = {
    getAll,
    getById,
    newAccountPlan
};

function getAll(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/accountPlans`, getWithAuth()).then(handleCrudResponse(messages, errors));
}

function getById(userId, accountPlanId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/accountPlans/${accountPlanId}`, getWithAuth()).then(handleCrudResponse(messages, errors));
}

function newAccountPlan(userId, accountPlan, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/accountPlans`, putWithAuth(accountPlan)).then(handleCrudResponse(messages, errors));
}
