/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import { footprintService } from '../_services';
import { util } from '../_helpers';

const state = {
    loading: { footprints: false, footprint: false },
    error: null,
    footprints: null,
    footprint: null
};

const actions = {
    getAllFootprints({ commit }, {userId, messages, errors}) {
        commit('getAllFootprintsRequest');
        footprintService.getAllFootprints(userId, messages, errors)
            .then(
                footprints => commit('getAllFootprintsSuccess', footprints),
                error => commit('getAllFootprintsFailure', error)
            );
    },

    getFootprintById({ commit }, {userId, footprintId, messages, errors}) {
        commit('getFootprintByIdRequest');
        footprintService.getFootprintById(userId, footprintId, messages, errors)
            .then(
                footprint => commit('getFootprintByIdSuccess', footprint),
                error => commit('getFootprintByIdFailure', error)
            );
    }
};

const mutations = {
    getAllFootprintsRequest(state) {
        state.loading.footprints = true;
    },
    getAllFootprintsSuccess(state, footprints) {
        state.loading.footprints = false;
        state.footprints = footprints;
    },
    getAllFootprintsFailure(state, error) {
        state.loading.footprints = false;
        state.error = { error };
    },
    getFootprintByIdRequest(state) {
        state.loading.footprint = true;
    },
    getFootprintByIdSuccess(state, footprint) {
        state.loading.footprint = false;
        state.footprint = footprint;
    },
    getFootprintByIdFailure(state, error) {
        state.loading.footprint = false;
        state.error = { error };
    }
};

const getters = {
    loading: util.checkLoading(state.loading, 'footprints')
};

export const footprints = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
