/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://git.bubblev.org/bubblev/bubble/src/branch/master/LICENSE.md
 */
import config from 'config';
import { util } from '../_helpers';

export const footprintService = {
    getAllFootprints,
    getFootprintById
};

function getAllFootprints(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/footprints`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getFootprintById(userId, footprintId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/footprints/${footprintId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}
