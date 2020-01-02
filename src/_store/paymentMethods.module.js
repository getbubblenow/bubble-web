import { paymentMethodService } from '../_services';
import { util } from '../_helpers';

const state = {
    loading: {
        paymentMethods: false, paymentMethod: false,
        accountPaymentMethods: false, accountPaymentMethod: false,
        adding: false
    },
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
        state.loading.paymentMethods = true;
    },
    getAllSuccess(state, paymentMethods) {
        state.loading.paymentMethods = false;
        state.paymentMethods = paymentMethods;
    },
    getAllFailure(state, error) {
        state.loading.paymentMethods = false;
        state.error = { error };
    },
    getByUuidRequest(state) {
        state.loading.paymentMethod = true;
    },
    getByUuidSuccess(state, paymentMethod) {
        state.loading.paymentMethod = false;
        state.paymentMethod = paymentMethod;
    },
    getByUuidFailure(state, error) {
        state.loading.paymentMethod = false;
        state.error = { error };
    },

    setPaymentMethodSuccess(state, pm) {
        state.paymentInfo = null;
        state.paymentStatus = {};
        state.paymentMethod = pm;
    },

    getAllByAccountRequest(state) {
        state.loading.accountPaymentMethods = true;
    },
    getAllByAccountSuccess(state, paymentMethods) {
        state.loading.accountPaymentMethods = false;
        state.accountPaymentMethods = paymentMethods;
    },
    getAllByAccountFailure(state, error) {
        state.loading.accountPaymentMethods = false;
        state.error = { error };
    },

    getByAccountAndIdRequest(state) {
        state.loading.accountPaymentMethod = true;
    },
    getByAccountAndIdSuccess(state, paymentMethod) {
        state.loading.accountPaymentMethod = false;
        state.accountPaymentMethod = paymentMethod;
    },
    getByAccountAndIdFailure(state, error) {
        state.loading.accountPaymentMethod = false;
        state.error = { error };
    },

    addAccountPaymentMethodRequest(state) {
        state.loading.adding = true;
        state.errors = null;
        state.paymentStatus = { addingPaymentMethod: true };
    },
    addAccountPaymentMethodSuccess(state, {paymentMethod, originalPaymentMethod}) {
        state.loading.adding = false;
        state.paymentStatus = { addedPaymentMethod: true };
        state.accountPaymentMethod = paymentMethod;
        state.paymentInfo = originalPaymentMethod.paymentInfo;
    },
    addAccountPaymentMethodFailure(state, errors) {
        state.loading.adding = false;
        state.paymentStatus = {};
        state.errors = errors;
    },

    clearPaymentInfoSuccess(state) {
        state.paymentInfo = null;
    }
};

const getters = {
    loading: util.checkLoading(state.loading)
};

export const paymentMethods = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};