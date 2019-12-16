import { paymentMethodService } from '../_services';

const state = {
    loading: null,
    error: null,
    paymentMethods: null,
    paymentMethod: null
};

const actions = {
    getAll({ commit }) {
        commit('getAllRequest');
        paymentMethodService.getAll()
            .then(
                paymentMethods => commit('getAllSuccess', paymentMethods),
                error => commit('getAllFailure', error)
            );
    },

    getByUuid({ commit }, uuid) {
        commit('getByUuidRequest');
        paymentMethodService.getById(uuid)
            .then(
                paymentMethod => commit('getByUuidSuccess', paymentMethod),
                error => commit('getByUuidFailure', error)
            );
    }
};

const mutations = {
    getAllRequest(state) {
        state.loading = true;
    },
    getAllSuccess(state, paymentMethods) {
        state.loading = false;
        state.paymentMethods = paymentMethods;
    },
    getAllFailure(state, error) {
        state.loading = false;
        state.error = { error };
    },
    getByUuidRequest(state) {
        state.loading = true;
    },
    getByUuidSuccess(state, paymentMethod) {
        state.loading = false;
        state.paymentMethod = paymentMethod;
    },
    getByUuidFailure(state, error) {
        state.loading = false;
        state.error = { error };
    }
};

export const paymentMethods = {
    namespaced: true,
    state,
    actions,
    mutations
};
