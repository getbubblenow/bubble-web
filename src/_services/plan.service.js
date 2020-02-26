/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://git.bubblev.org/bubblev/bubble/src/branch/master/LICENSE.md
 */
import config from 'config';
import { util } from '../_helpers';

export const planService = {
    getAllPlans,
    getPlanById
};

function getAllPlans(messages, errors) {
    return fetch(`${config.apiUrl}/plans`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getPlanById(planId, messages, errors) {
    return fetch(`${config.apiUrl}/plans/${planId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}
