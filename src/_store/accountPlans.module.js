import { accountPlanService } from '../_services';
import { account } from '../_store/account.module';

const state = {
    loading: null,
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
        state.loading = true;
    },
    getAllSuccess(state, accountPlans) {
        state.loading = false;
        state.accountPlans = accountPlans;
    },
    getAllFailure(state, error) {
        state.loading = false;
        state.error = { error };
    },
    getByUuidRequest(state) {
        state.loading = true;
    },
    getByUuidSuccess(state, accountPlan) {
        state.loading = false;
        state.accountPlan = accountPlan;
    },
    getByUuidFailure(state, error) {
        state.loading = false;
        state.error = { error };
    },
    deleteRequest(state, id) {
        state.loading = true;
    },
    deleteSuccess(state, id) {
        state.loading = false;
        // remove deleted accountPlan from state
        if (state.accountPlans) {
            state.accountPlans = state.accountPlans.filter(accountPlan => accountPlan.uuid !== id)
        }
    },
    deleteFailure(state, { id, error }) {
        state.loading = false;
        // remove 'deleting:true' property and add 'deleteError:[error]' property to accountPlan
        state.error = error;
    }
};

export const accountPlans = {
    namespaced: true,
    state,
    actions,
    mutations
};
