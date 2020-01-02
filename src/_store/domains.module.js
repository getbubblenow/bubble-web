import { domainService } from '../_services';
import { util } from '../_helpers';

const state = {
    loading: {
        domains: false, domain: false
    },
    error: null,
    domains: null,
    domain: null
};

const actions = {
    getAll({ commit }, {messages, errors}) {
        commit('getAllRequest');
        domainService.getAll(messages, errors)
            .then(
                domains => commit('getAllSuccess', domains),
                error => commit('getAllFailure', error)
            );
    },

    getByUuid({ commit }, {uuid, messages, errors}) {
        commit('getByUuidRequest');
        domainService.getById(uuid, messages, errors)
            .then(
                domain => commit('getByUuidSuccess', domain),
                error => commit('getByUuidFailure', error)
            );
    }
};

const mutations = {
    getAllRequest(state) {
        state.loading.domains = true;
    },
    getAllSuccess(state, domains) {
        state.loading.domains = false;
        state.domains = domains;
    },
    getAllFailure(state, error) {
        state.loading.domains = false;
        state.error = { error };
    },
    getByUuidRequest(state) {
        state.loading.domain = true;
    },
    getByUuidSuccess(state, domain) {
        state.loading.domain = false;
        state.domain = domain;
    },
    getByUuidFailure(state, error) {
        state.loading.domain = false;
        state.error = { error };
    }
};

const getters = {
    loading: util.checkLoading(state.loading)
};

export const domains = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
