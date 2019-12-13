import config from 'config';
import { getWithAuth, putWithAuth, handleCrudResponse } from '../_helpers';

export const accountPlanService = {
    getAll,
    getById,
    newAccountPlan
};

function getAll(userId) {
    return fetch(`${config.apiUrl}/users/${userId}/accountPlans`, getWithAuth()).then(handleCrudResponse);
}

function getById(userId, accountPlanId) {
    return fetch(`${config.apiUrl}/users/${userId}/accountPlans/${accountPlanId}`, getWithAuth()).then(handleCrudResponse);
}

function newAccountPlan(userId, accountPlan) {
    return fetch(`${config.apiUrl}/users/${userId}/accountPlans`, putWithAuth(accountPlan)).then(handleCrudResponse);
}
