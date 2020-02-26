/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://git.bubblev.org/bubblev/bubble/src/branch/master/LICENSE.md
 */
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
    getAllDomains({ commit }, {userId, messages, errors}) {
        commit('getAllDomainsRequest');
        domainService.getAllDomains(userId, messages, errors)
            .then(
                domains => commit('getAllDomainsSuccess', domains),
                error => commit('getAllDomainsFailure', error)
            );
    },

    getDomainById({ commit }, {userId, domainId, messages, errors}) {
        commit('getDomainByIdRequest');
        domainService.getDomainById(userId, domainId, messages, errors)
            .then(
                domain => commit('getDomainByIdSuccess', domain),
                error => commit('getDomainByIdFailure', error)
            );
    }
};

const mutations = {
    getAllDomainsRequest(state) {
        state.loading.domains = true;
    },
    getAllDomainsSuccess(state, domains) {
        state.loading.domains = false;
        state.domains = domains;
    },
    getAllDomainsFailure(state, error) {
        state.loading.domains = false;
        state.error = { error };
    },
    getDomainByIdRequest(state) {
        state.loading.domain = true;
    },
    getDomainByIdSuccess(state, domain) {
        state.loading.domain = false;
        state.domain = domain;
    },
    getDomainByIdFailure(state, error) {
        state.loading.domain = false;
        state.error = { error };
    }
};

const getters = {
    loading: util.checkLoading(state.loading, 'domains')
};

export const domains = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
