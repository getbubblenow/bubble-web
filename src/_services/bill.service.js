/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import config from 'config';
import { util } from '~/_helpers';

export const billService = {
    getAllBillsByAccount,
    getBillByAccountAndId
};

function getAllBillsByAccount(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/bills`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getBillByAccountAndId(userId, billId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/bills/${billId}?payments=true`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}
