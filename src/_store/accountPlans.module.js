/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import { accountPlanService } from '~/_services';
import { util } from '~/_helpers';

const state = {
    loading: {plans: false, plan: false, deleting: false},
    error: null,
    accountPlans: null,
    accountPlan: null
};

const actions = {
    getAllAccountPlans({ commit }, {userId, messages, errors}) {
        commit('getAllAccountPlansRequest');

        accountPlanService.getAllAccountPlans(userId, messages, errors)
            .then(
                accountPlans => commit('getAllAccountPlansSuccess', accountPlans),
                error => commit('getAllAccountPlansFailure', error)
            );
    },

    getAccountPlanById({ commit }, {userId, accountPlanId, messages, errors}) {
        commit('getAccountPlanByIdRequest');

        accountPlanService.getAccountPlanById(userId, accountPlanId, messages, errors)
            .then(
                accountPlan => commit('getAccountPlanByIdSuccess', accountPlan),
                error => commit('getAccountPlanByIdFailure', error)
            );
    },

    delete({ commit }, {userId, accountPlanId, messages, errors}) {
        commit('deleteRequest', accountPlanId);

        accountPlanService.delete(userId, accountPlanId, messages, errors)
            .then(
                accountPlan => commit('deleteSuccess', accountPlan),
                error => commit('deleteFailure', { accountPlanId, error: error.toString() })
            );
    }
};

const mutations = {
    getAllAccountPlansRequest(state) {
        state.loading.plans = true;
    },
    getAllAccountPlansSuccess(state, accountPlans) {
        state.loading.plans = false;
        state.accountPlans = accountPlans;
    },
    getAllAccountPlansFailure(state, error) {
        state.loading.plans = false;
        state.error = { error };
    },
    getAccountPlanByIdRequest(state) {
        state.loading.plan = true;
    },
    getAccountPlanByIdSuccess(state, accountPlan) {
        state.loading.plan = false;
        state.accountPlan = accountPlan;
    },
    getAccountPlanByIdFailure(state, error) {
        state.loading.plan = false;
        state.error = { error };
    },
    deleteRequest(state, id) {
        state.loading.deleting = true;
    },
    deleteSuccess(state, id) {
        state.loading.deleting = false;
        // remove deleted accountPlan from state
        if (state.accountPlans) {
            state.accountPlans = state.accountPlans.filter(accountPlan => accountPlan.uuid !== id)
        }
    },
    deleteFailure(state, { id, error }) {
        state.loading.deleting = false;
        // remove 'deleting:true' property and add 'deleteError:[error]' property to accountPlan
        state.error = error;
    }
};

const getters = {
    loading: util.checkLoading(state.loading, 'accountPlans')
};

export const accountPlans = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
