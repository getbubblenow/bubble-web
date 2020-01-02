import { footprintService } from '../_services';
import { util } from '../_helpers';

const state = {
    loading: { footprints: false, footprint: false },
    error: null,
    footprints: null,
    footprint: null
};

const actions = {
    getAll({ commit }, {messages, errors}) {
        commit('getAllRequest');
        footprintService.getAll(messages, errors)
            .then(
                footprints => commit('getAllSuccess', footprints),
                error => commit('getAllFailure', error)
            );
    },

    getByUuid({ commit }, {uuid, messages, errors}) {
        commit('getByUuidRequest');
        footprintService.getById(uuid, messages, errors)
            .then(
                footprint => commit('getByUuidSuccess', footprint),
                error => commit('getByUuidFailure', error)
            );
    }
};

const mutations = {
    getAllRequest(state) {
        state.loading.footprints = true;
    },
    getAllSuccess(state, footprints) {
        state.loading.footprints = false;
        state.footprints = footprints;
    },
    getAllFailure(state, error) {
        state.loading.footprints = false;
        state.error = { error };
    },
    getByUuidRequest(state) {
        state.loading.footprint = true;
    },
    getByUuidSuccess(state, footprint) {
        state.loading.footprint = false;
        state.footprint = footprint;
    },
    getByUuidFailure(state, error) {
        state.loading.footprint = false;
        state.error = { error };
    }
};

const getters = {
    loading: util.checkLoading(state.loading)
};

export const footprints = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
