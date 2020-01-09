import config from 'config';
import { util } from '../_helpers';
// import { util.getWithAuth, util.putWithAuth, util.handleCrudResponse } from '../_helpers';

export const accountPlanService = {
    getAllAccountPlans,
    getAccountPlanById,
    newAccountPlan
};

function getAllAccountPlans(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/accountPlans`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getAccountPlanById(userId, accountPlanId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/accountPlans/${accountPlanId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function newAccountPlan(userId, accountPlan, messages, errors) {
    return fetch(`${config.apiUrl}/me/plans`, util.putWithAuth(accountPlan)).then(util.handleCrudResponse(messages, errors));
}
