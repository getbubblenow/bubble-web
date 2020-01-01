import { networkService } from '../_services';
import { account } from '../_store/account.module';
import { checkLoading } from "../_helpers";

const state = {
    loading: {
        networks: false, network: false, deleting: false, nearestRegions: false
    },
    creating: null,
    error: null,
    networks: null,
    network: null,
    nearestRegions: null
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
        // todo: create account plan, then start network
    },

    delete({ commit }, {id, messages, errors}) {
        commit('deleteRequest', id);
        networkService.delete(account.state.user.uuid, id, messages, errors)
            .then(
                network => commit('deleteSuccess', network),
                error => commit('deleteFailure', { id, error: error.toString() })
            );
    },

    getNearestRegions({ commit }, {footprint, messages, errors}) {
        commit('getNearestRegionsRequest');
        networkService.getNearestRegions(account.state.user.uuid, footprint, messages, errors)
            .then(
                regions => commit('getNearestRegionsSuccess', regions),
                error => commit('getNearestRegionsFailure', error)
            );
    },
};

const mutations = {
    getAllRequest(state) {
        state.loading.networks = true;
    },
    getAllSuccess(state, networks) {
        state.loading.networks = false;
        state.networks = networks;
    },
    getAllFailure(state, error) {
        state.loading.networks = false;
        state.error = { error };
    },
    getByUuidRequest(state) {
        state.loading.network = true;
    },
    getByUuidSuccess(state, network) {
        state.loading.network = false;
        state.network = network;
    },
    getByUuidFailure(state, error) {
        state.loading.network = false;
        state.error = { error };
    },
    deleteRequest(state, id) {
        state.loading.deleting = true;
    },
    deleteSuccess(state, id) {
        state.loading.deleting = false;
        // remove deleted network from state
        if (state.networks) {
            state.networks = state.networks.filter(network => network.uuid !== id)
        }
    },
    deleteFailure(state, { id, error }) {
        state.loading.deleting = false;
        // remove 'deleting:true' property and add 'deleteError:[error]' property to network
        state.error = error;
    },
    getNearestRegionsRequest(state) {
        state.loading.nearestRegions = true;
    },
    getNearestRegionsSuccess(state, regions) {
        state.loading.nearestRegions = false;
        state.nearestRegions = regions;
    },
    getNearestRegionsFailure(state, error) {
        state.loading.nearestRegions = false;
        state.error = { error };
    }
};

const getters = {
    loading: checkLoading(state.loading)
};

export const networks = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
