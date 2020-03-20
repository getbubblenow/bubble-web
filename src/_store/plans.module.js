/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://bubblev.com/bubble-license/
 */
import { planService } from '../_services';
import { util } from '../_helpers';

const state = {
    loading: {plans: false, plan: false, deleting: false},
    error: null,
    plans: null,
    plan: null
};

const actions = {
    getAllPlans({ commit }, {messages, errors}) {
        commit('getAllPlansRequest');
        planService.getAllPlans(messages, errors)
            .then(
                plans => commit('getAllPlansSuccess', plans),
                error => commit('getAllPlansFailure', error)
            );
    },

    getCurrentPlans({ commit }, {messages, errors}) {
        commit('getCurrentPlansRequest');
        planService.getCurrentPlans(messages, errors)
            .then(
                plans => commit('getCurrentPlansSuccess', plans),
                error => commit('getCurrentPlansFailure', error)
            );
    },

    getPlanById({ commit }, {planId, messages, errors}) {
        commit('getPlanByIdRequest');
        planService.getPlanById(planId, messages, errors)
            .then(
                plan => commit('getPlanByIdSuccess', plan),
                error => commit('getPlanByIdFailure', error)
            );
    }
};

const mutations = {
    getAllPlansRequest(state) {
        state.loading.plans = true;
    },
    getAllPlansSuccess(state, plans) {
        state.loading.plans = false;
        state.plans = plans;
    },
    getAllPlansFailure(state, error) {
        state.loading.plans = false;
        state.error = { error };
    },

    getCurrentPlansRequest(state) {
        state.loading.plans = true;
    },
    getCurrentPlansSuccess(state, plans) {
        state.loading.plans = false;
        state.plans = plans;
    },
    getCurrentPlansFailure(state, error) {
        state.loading.plans = false;
        state.error = { error };
    },

    getPlanByIdRequest(state) {
        state.loading.plan = true;
    },
    getPlanByIdSuccess(state, plan) {
        state.loading.plan = false;
        state.plan = plan;
    },
    getPlanByIdFailure(state, error) {
        state.loading.plan = false;
        state.error = { error };
    }
};

const getters = {
    loading: util.checkLoading(state.loading, 'plans')
};

export const plans = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
