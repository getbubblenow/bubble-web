/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
const state = {
    type: null,
    message: null
};

const actions = {
    success({ commit }, message) {
        commit('success', message);
    },
    error({ commit }, message) {
        commit('error', message);
    },
    clear({ commit }, message) {
        commit('success', message);
    }
};

const mutations = {
    success(state, message) {
        state.type = 'alert-success';
        state.message = message;
    },
    error(state, message) {
        state.type = 'alert-danger';
        state.message = message;
    },
    clear(state) {
        state.type = null;
        state.message = null;
    }
};

export const alert = {
    namespaced: true,
    state,
    actions,
    mutations
};
