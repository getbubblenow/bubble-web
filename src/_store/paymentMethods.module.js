import {footprintService, paymentMethodService} from '../_services';

const state = {
    loading: null,
    paymentStatus: {},
    error: null,
    errors: null,
    paymentMethods: null,
    paymentMethod: null,
    paymentInfo: null,
    accountPaymentMethods: null,
    accountPaymentMethod: null,
    accountPaymentUuid: null
};

const actions = {
    getAll({ commit }, {messages, errors}) {
        commit('getAllRequest');
        paymentMethodService.getAll(messages, errors)
            .then(
                paymentMethods => commit('getAllSuccess', paymentMethods),
                error => commit('getAllFailure', error)
            );
    },
    getById({ commit }, {uuid, messages, errors}) {
        commit('getByUuidRequest');
        paymentMethodService.getById(uuid, messages, errors)
            .then(
                paymentMethod => commit('getByUuidSuccess', paymentMethod),
                error => commit('getByUuidFailure', error)
            );
    },

    setPaymentMethod({commit}, pm) {
        commit("setPaymentMethodSuccess", pm);
    },

    getAllByAccount({ commit }, {messages, errors}) {
        commit('getAllByAccountRequest');
        paymentMethodService.getAllByAccount(messages, errors)
            .then(
                paymentMethods => commit('getAllByAccountSuccess', paymentMethods),
                error => commit('getAllByAccountFailure', error)
            );
    },

    getByAccountAndId({ commit }, {uuid, messages, errors}) {
        commit('getByAccountAndIdRequest');
        paymentMethodService.getById(uuid, messages, errors)
            .then(
                paymentMethod => commit('getByAccountAndIdSuccess', paymentMethod),
                error => commit('getByAccountAndIdFailure', error)
            );
    },

    addAccountPaymentMethod({ commit }, {paymentMethod, messages, errors}) {
        console.log("pmModule: paymentMethod="+JSON.stringify(paymentMethod));
        commit('addAccountPaymentMethodRequest');
        paymentMethodService.addAccountPaymentMethod(paymentMethod, messages, errors)
            .then(
                pm => commit('addAccountPaymentMethodSuccess', {paymentMethod: pm, originalPaymentMethod: paymentMethod}),
                errors => commit('addAccountPaymentMethodFailure', errors)
            );
    },
    clearPaymentInfo({ commit }) {
        commit('clearPaymentInfoSuccess');
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
    },

    setPaymentMethodSuccess(state, pm) {
        state.paymentInfo = null;
        state.paymentStatus = {};
        state.paymentMethod = pm;
    },

    getAllByAccountRequest(state) {
        state.loading = true;
    },
    getAllByAccountSuccess(state, paymentMethods) {
        state.loading = false;
        state.accountPaymentMethods = paymentMethods;
    },
    getAllByAccountFailure(state, error) {
        state.loading = false;
        state.error = { error };
    },

    getByAccountAndIdRequest(state) {
        state.loading = true;
    },
    getByAccountAndIdSuccess(state, paymentMethod) {
        state.loading = false;
        state.accountPaymentMethod = paymentMethod;
    },
    getByAccountAndIdFailure(state, error) {
        state.loading = false;
        state.error = { error };
    },

    addAccountPaymentMethodRequest(state) {
        state.errors = null;
        state.paymentStatus = { addingPaymentMethod: true };
        state.loading = true;
    },
    addAccountPaymentMethodSuccess(state, {paymentMethod, originalPaymentMethod}) {
        state.paymentStatus = { addedPaymentMethod: true };
        state.loading = false;
        state.accountPaymentMethod = paymentMethod;
        state.paymentInfo = originalPaymentMethod.paymentInfo;
    },
    addAccountPaymentMethodFailure(state, errors) {
        console.log("addAccountPaymentMethodFailure: errors="+JSON.stringify(errors));
        state.paymentStatus = {};
        state.loading = false;
        state.errors = errors;
    },

    clearPaymentInfoSuccess(state) {
        state.paymentInfo = null;
    }
};

export const paymentMethods = {
    namespaced: true,
    state,
    actions,
    mutations
};