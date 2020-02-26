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

    getPlanById({ commit }, {userId, accountPlanId, messages, errors}) {
        commit('getPlanByIdRequest');
        planService.getPlanById(userId, accountPlanId, messages, errors)
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
