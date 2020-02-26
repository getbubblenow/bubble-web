/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://git.bubblev.org/bubblev/bubble/src/branch/master/LICENSE.md
 */
import { paymentMethodService } from '../_services';
import { util } from '../_helpers';

const state = {
    loading: {
        paymentMethods: false, paymentMethod: false,
        accountPaymentMethods: false, accountPaymentMethod: false,
        adding: false, updating: false, deleting: false
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
    getAllPaymentMethods({ commit }, {messages, errors}) {
        commit('getAllPaymentMethodsRequest');
        paymentMethodService.getAllPaymentMethods(messages, errors)
            .then(
                paymentMethods => commit('getAllPaymentMethodsSuccess', paymentMethods),
                error => commit('getAllPaymentMethodsFailure', error)
            );
    },

    getAllAccountPaymentMethods({ commit }, {userId, messages, errors}) {
        commit('getAllAccountPaymentMethodsRequest');
        paymentMethodService.getAllAccountPaymentMethods(userId, messages, errors)
            .then(
                paymentMethods => commit('getAllAccountPaymentMethodsSuccess', paymentMethods),
                error => commit('getAllAccountPaymentMethodsFailure', error)
            );
    },

    getPublicById({ commit }, {paymentMethodId, messages, errors}) {
        commit('getPublicByIdRequest');
        paymentMethodService.getPublicById(paymentMethodId, messages, errors)
            .then(
                paymentMethod => commit('getPublicByIdSuccess', paymentMethod),
                error => commit('getPublicByIdFailure', error)
            );
    },

    setPaymentMethod({commit}, pm) {
        commit("setPaymentMethodSuccess", pm);
    },

    getAllByAccount({ commit }, {userId, messages, errors}) {
        commit('getAllByAccountRequest');
        paymentMethodService.getAllByAccount(userId, messages, errors)
            .then(
                paymentMethods => commit('getAllByAccountSuccess', paymentMethods),
                error => commit('getAllByAccountFailure', error)
            );
    },

    getByAccountAndId({ commit }, {userId, paymentMethodId, messages, errors}) {
        commit('getByAccountAndIdRequest');
        paymentMethodService.getByAccountAndId(userId, paymentMethodId, messages, errors)
            .then(
                paymentMethod => commit('getByAccountAndIdSuccess', paymentMethod),
                error => commit('getByAccountAndIdFailure', error)
            );
    },

    addAccountPaymentMethod({ commit }, {userId, paymentMethod, messages, errors}) {
        commit('addAccountPaymentMethodRequest');
        paymentMethodService.addAccountPaymentMethod(userId, paymentMethod, messages, errors)
            .then(
                pm => commit('addAccountPaymentMethodSuccess', {paymentMethod: pm, originalPaymentMethod: paymentMethod}),
                errors => commit('addAccountPaymentMethodFailure', errors)
            );
    },
    setAccountPaymentMethodForPlan({ commit }, {userId, planId, pmId, messages, errors}) {
        commit('setAccountPaymentMethodForPlanRequest');
        paymentMethodService.setAccountPaymentMethodForPlan(userId, planId, pmId, messages, errors)
            .then(
                pm => commit('setAccountPaymentMethodForPlanSuccess', pm),
                errors => commit('setAccountPaymentMethodForPlanFailure', errors)
            );
    },
    deleteAccountPaymentMethod({ commit }, {userId, pmId, messages, errors}) {
        commit('deleteAccountPaymentMethodRequest');
        paymentMethodService.deleteAccountPaymentMethod(userId, pmId, messages, errors)
            .then(
                ok => commit('deleteAccountPaymentMethodSuccess', ok),
                errors => commit('deleteAccountPaymentMethodFailure', errors)
            );
    },
    clearPaymentInfo({ commit }) {
        commit('clearPaymentInfoSuccess');
    }
};

const mutations = {
    getAllPaymentMethodsRequest(state) {
        state.loading.paymentMethods = true;
    },
    getAllPaymentMethodsSuccess(state, paymentMethods) {
        state.loading.paymentMethods = false;
        state.paymentMethods = paymentMethods;
    },
    getAllPaymentMethodsFailure(state, error) {
        state.loading.paymentMethods = false;
        state.error = { error };
    },

    getAllAccountPaymentMethodsRequest(state) {
        state.loading.accountPaymentMethods = true;
    },
    getAllAccountPaymentMethodsSuccess(state, paymentMethods) {
        state.loading.accountPaymentMethods = false;
        state.accountPaymentMethods = paymentMethods;
    },
    getAllAccountPaymentMethodsFailure(state, error) {
        state.loading.accountPaymentMethods = false;
        state.error = { error };
    },

    getPublicByIdRequest(state) {
        state.loading.paymentMethod = true;
    },
    getPublicByIdSuccess(state, paymentMethod) {
        state.loading.paymentMethod = false;
        state.paymentMethod = paymentMethod;
    },
    getPublicByIdFailure(state, error) {
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

    setAccountPaymentMethodForPlanRequest(state) {
        state.loading.updating = true;
        state.errors = null;
        state.paymentStatus = { updatingPaymentMethod: true };
    },
    setAccountPaymentMethodForPlanSuccess(state, pm) {
        state.loading.updating = false;
        state.paymentStatus = { updatedPaymentMethod: true };
    },
    setAccountPaymentMethodForPlanFailure(state, errors) {
        state.loading.updating = false;
        state.paymentStatus = {};
        state.errors = errors;
    },

    deleteAccountPaymentMethodRequest(state) {
        state.loading.deleting = true;
        state.paymentStatus = { deletingPaymentMethod: true };
        state.errors = null;
    },
    deleteAccountPaymentMethodSuccess(state, ok) {
        state.loading.deleting = false;
        state.paymentStatus = { deletedPaymentMethod: true };
        state.errors = null;
    },
    deleteAccountPaymentMethodFailure(state, errors) {
        state.loading.deleting = false;
        state.paymentStatus = {};
    },

    clearPaymentInfoSuccess(state) {
        state.paymentInfo = null;
    }
};

const getters = {
    loading: util.checkLoading(state.loading, 'paymentMethods')
};

export const paymentMethods = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};