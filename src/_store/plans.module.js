import { planService } from '../_services';
import { util } from '../_helpers';

const state = {
    loading: {plans: false, plan: false, deleting: false},
    error: null,
    plans: null,
    plan: null
};

const actions = {
    getAll({ commit }, {messages, errors}) {
        commit('getAllRequest');
        planService.getAll(messages, errors)
            .then(
                plans => commit('getAllSuccess', plans),
                error => commit('getAllFailure', error)
            );
    },

    getByUuid({ commit }, {uuid, messages, errors}) {
        commit('getByUuidRequest');
        planService.getById(uuid, messages, errors)
            .then(
                plan => commit('getByUuidSuccess', plan),
                error => commit('getByUuidFailure', error)
            );
    },

    delete({ commit }, {id, messages, errors}) {
        commit('deleteRequest', id);
        planService.delete(id, messages, errors)
            .then(
                plan => commit('deleteSuccess', plan),
                error => commit('deleteFailure', { id, error: error.toString() })
            );
    }
};

const mutations = {
    getAllRequest(state) {
        state.loading.plans = true;
    },
    getAllSuccess(state, plans) {
        state.loading.plans = false;
        state.plans = plans;
    },
    getAllFailure(state, error) {
        state.loading.plans = false;
        state.error = { error };
    },
    getByUuidRequest(state) {
        state.loading.plan = true;
    },
    getByUuidSuccess(state, plan) {
        state.loading.plan = false;
        state.plan = plan;
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
        // remove deleted plan from state
        if (state.plans) {
            state.plans = state.plans.filter(plan => plan.uuid !== id)
        }
    },
    deleteFailure(state, { id, error }) {
        state.loading.deleting = false;
        // remove 'deleting:true' property and add 'deleteError:[error]' property to user
        state.error = error;
    }
};

const getters = {
    loading: util.checkLoading(state.loading)
};

export const plans = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
