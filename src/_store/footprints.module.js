import { footprintService } from '../_services';

const state = {
    loading: null,
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
        state.loading = true;
    },
    getAllSuccess(state, footprints) {
        state.loading = false;
        state.footprints = footprints;
    },
    getAllFailure(state, error) {
        state.loading = false;
        state.error = { error };
    },
    getByUuidRequest(state) {
        state.loading = true;
    },
    getByUuidSuccess(state, footprint) {
        state.loading = false;
        state.footprint = footprint;
    },
    getByUuidFailure(state, error) {
        state.loading = false;
        state.error = { error };
    }
};

export const footprints = {
    namespaced: true,
    state,
    actions,
    mutations
};
