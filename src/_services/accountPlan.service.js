/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import config from 'config';
import { util } from '~/_helpers';
// import { util.getWithAuth, util.putWithAuth, util.handleCrudResponse } from '~/_helpers';

export const accountPlanService = {
    getAllAccountPlans,
    getAccountPlanById,
    newAccountPlan
};

function getAllAccountPlans(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/plans`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getAccountPlanById(userId, accountPlanId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/plans/${accountPlanId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function newAccountPlan(userId, accountPlan, messages, errors) {
    return fetch(`${config.apiUrl}/me/plans`, util.putWithAuth(accountPlan)).then(util.handleCrudResponse(messages, errors));
}
