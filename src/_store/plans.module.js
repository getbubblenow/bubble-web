import { planService } from '../_services';

const state = {
    loading: null,
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
        state.loading = true;
    },
    getAllSuccess(state, plans) {
        state.loading = false;
        state.plans = plans;
    },
    getAllFailure(state, error) {
        state.loading = false;
        state.error = { error };
    },
    getByUuidRequest(state) {
        state.loading = true;
    },
    getByUuidSuccess(state, plan) {
        state.loading = false;
        state.plan = plan;
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
        // remove deleted plan from state
        if (state.plans) {
            state.plans = state.plans.filter(plan => plan.uuid !== id)
        }
    },
    deleteFailure(state, { id, error }) {
        state.loading = false;
        // remove 'deleting:true' property and add 'deleteError:[error]' property to user
        state.error = error;
    }
};

export const plans = {
    namespaced: true,
    state,
    actions,
    mutations
};
