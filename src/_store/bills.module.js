import { billService } from '../_services';
import { util } from '../_helpers';

const state = {
    loading: {
        bills: false, bill: false
    },
    error: null,
    bills: null,
    bill: null
};

const actions = {
    getAllBillsByAccount({ commit }, {userId, messages, errors}) {
        commit('getAllBillsByAccountRequest');
        billService.getAllBillsByAccount(userId, messages, errors)
            .then(
                bills => commit('getAllBillsByAccountSuccess', bills),
                error => commit('getAllBillsByAccountFailure', error)
            );
    },
    getBillByAccountAndId({ commit }, {userId, billId, messages, errors}) {
        commit('getBillByAccountAndIdRequest');
        billService.getBillByAccountAndId(userId, billId, messages, errors)
            .then(
                bill => commit('getBillByAccountAndIdSuccess', bill),
                error => commit('getBillByAccountAndIdFailure', error)
            );
    }
};

const mutations = {
    getAllBillsByAccountRequest(state) {
        state.loading.bills = true;
    },
    getAllBillsByAccountSuccess(state, bills) {
        state.loading.bills = false;
        state.bills = bills;
    },
    getAllBillsByAccountFailure(state, error) {
        state.loading.bills = false;
        state.error = { error };
    },
    getBillByAccountAndIdRequest(state) {
        state.loading.bill = true;
    },
    getBillByAccountAndIdSuccess(state, bill) {
        state.loading.bill = false;
        state.bill = bill;
    },
    getBillByAccountAndIdFailure(state, error) {
        state.loading.bill = false;
        state.error = { error };
    }
};

const getters = {
    loading: util.checkLoading(state.loading)
};

export const bills = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};