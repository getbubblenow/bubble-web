import { domainService } from '../_services';

const state = {
    loading: null,
    error: null,
    domains: null,
    domain: null
};

const actions = {
    getAll({ commit }, userId) {
        commit('getAllRequest');
        domainService.getAll(userId)
            .then(
                domains => commit('getAllSuccess', domains),
                error => commit('getAllFailure', error)
            );
    },

    getByUuid({ commit }, userId, uuid) {
        commit('getByUuidRequest');
        domainService.getById(userId, uuid)
            .then(
                domain => commit('getByUuidSuccess', domain),
                error => commit('getByUuidFailure', error)
            );
    }
};

const mutations = {
    getAllRequest(state) {
        state.loading = true;
    },
    getAllSuccess(state, domains) {
        state.loading = false;
        state.domains = domains;
    },
    getAllFailure(state, error) {
        state.loading = false;
        state.error = { error };
    },
    getByUuidRequest(state) {
        state.loading = true;
    },
    getByUuidSuccess(state, domain) {
        state.loading = false;
        state.domain = domain;
    },
    getByUuidFailure(state, error) {
        state.loading = false;
        state.error = { error };
    }
};

export const domains = {
    namespaced: true,
    state,
    actions,
    mutations
};
