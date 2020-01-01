import { accountPlanService } from '../_services';
import { account } from '../_store/account.module';
import { checkLoading } from "../_helpers";

const state = {
    loading: {plans: false, plan: false, deleting: false},
    error: null,
    accountPlans: null,
    accountPlan: null
};

const actions = {
    getAll({ commit }, {messages, errors}) {
        commit('getAllRequest');

        accountPlanService.getAll(account.user.uuid, messages, errors)
            .then(
                accountPlans => commit('getAllSuccess', accountPlans),
                error => commit('getAllFailure', error)
            );
    },

    getByUuid({ commit }, {uuid, messages, errors}) {
        commit('getByUuidRequest');

        accountPlanService.getById(account.user.uuid, uuid, messages, errors)
            .then(
                accountPlan => commit('getByUuidSuccess', accountPlan),
                error => commit('getByUuidFailure', error)
            );
    },

    delete({ commit }, {id, messages, errors}) {
        commit('deleteRequest', id);

        accountPlanService.delete(account.user.uuid, id, messages, errors)
            .then(
                accountPlan => commit('deleteSuccess', accountPlan),
                error => commit('deleteFailure', { id, error: error.toString() })
            );
    }
};

const mutations = {
    getAllRequest(state) {
        state.loading.plans = true;
    },
    getAllSuccess(state, accountPlans) {
        state.loading.plans = false;
        state.accountPlans = accountPlans;
    },
    getAllFailure(state, error) {
        state.loading.plans = false;
        state.error = { error };
    },
    getByUuidRequest(state) {
        state.loading.plan = true;
    },
    getByUuidSuccess(state, accountPlan) {
        state.loading.plan = false;
        state.accountPlan = accountPlan;
    },
    getByUuidFailure(state, error) {
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
    loading: checkLoading(state.loading)
};

export const accountPlans = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
