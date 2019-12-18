import { networkService } from '../_services';
import { account } from '../_store/account.module';

const state = {
    loading: null,
    creating: null,
    error: null,
    networks: null,
    network: null
};

const actions = {
    getAll({ commit }, {messages, errors}) {
        commit('getAllRequest');
        networkService.getAll(account.state.user.uuid, messages, errors)
            .then(
                networks => commit('getAllSuccess', networks),
                error => commit('getAllFailure', error)
            );
    },

    getByUuid({ commit }, {uuid, messages, errors}) {
        commit('getByUuidRequest');
        networkService.getById(account.state.user.uuid, uuid, messages, errors)
            .then(
                network => commit('getByUuidSuccess', network),
                error => commit('getByUuidFailure', error)
            );
    },

    create({ commit }, {accountPlan, messages, errors}) {
        // todo
    },

    delete({ commit }, {id, messages, errors}) {
        commit('deleteRequest', id);
        networkService.delete(account.state.user.uuid, id, messages, errors)
            .then(
                network => commit('deleteSuccess', network),
                error => commit('deleteFailure', { id, error: error.toString() })
            );
    }
};

const mutations = {
    getAllRequest(state) {
        state.loading = true;
    },
    getAllSuccess(state, networks) {
        state.loading = false;
        state.networks = networks;
    },
    getAllFailure(state, error) {
        state.loading = false;
        state.error = { error };
    },
    getByUuidRequest(state) {
        state.loading = true;
    },
    getByUuidSuccess(state, network) {
        state.loading = false;
        state.network = network;
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
        // remove deleted network from state
        if (state.networks) {
            state.networks = state.networks.filter(network => network.uuid !== id)
        }
    },
    deleteFailure(state, { id, error }) {
        state.loading = false;
        // remove 'deleting:true' property and add 'deleteError:[error]' property to network
        state.error = error;
    }
};

export const networks = {
    namespaced: true,
    state,
    actions,
    mutations
};
