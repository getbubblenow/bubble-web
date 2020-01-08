import { networkService } from '../_services';
import { accountPlanService } from '../_services';
import { util } from '../_helpers';

const state = {
    loading: {
        networks: false, network: false, deleting: false,
        nearestRegions: false, startingNetwork: false, networkStatuses: false
    },
    creating: null,
    error: null,
    networks: null,
    network: null,
    nearestRegions: null,
    newNodeNotification: null,
    networkStatuses: {}
};

const actions = {
    getAll({ commit }, {userId, messages, errors}) {
        commit('getAllRequest');
        networkService.getAll(userId, messages, errors)
            .then(
                networks => commit('getAllSuccess', networks),
                error => commit('getAllFailure', error)
            );
    },

    getByUuid({ commit }, {userId, uuid, messages, errors}) {
        commit('getByUuidRequest');
        networkService.getById(userId, uuid, messages, errors)
            .then(
                network => commit('getByUuidSuccess', network),
                error => commit('getByUuidFailure', error)
            );
    },

    addPlanAndStartNetwork({ commit }, {userId, accountPlan, cloud, region, messages, errors}) {
        commit('addPlanAndStartNetworkRequest');
        accountPlanService.newAccountPlan(userId, accountPlan, messages, errors)
            .then(
                plan => {
                    networkService.startNetwork(userId, plan.name, cloud, region, messages, errors)
                        .then(
                            network => commit('addPlanAndStartNetworkSuccess', network),
                            error => commit('addPlanSuccessStartNetworkFailure', error)
                        );
                },
                error => commit('addPlanFailure', error)
            );
    },

    getNetworkStatuses({ commit }, {userId, network, messages, errors}) {
        commit('getNetworkStatusRequest', network);
        networkService.getNetworkStatuses(userId, network, messages, errors)
            .then(
                statuses => commit('getNetworkStatusSuccess', { network, statuses }),
                error => commit('getNetworkStatusFailure', { network, error })
            );
    },

    delete({ commit }, {userId, id, messages, errors}) {
        commit('deleteRequest', id);
        networkService.delete(userId, id, messages, errors)
            .then(
                network => commit('deleteSuccess', network),
                error => commit('deleteFailure', { id, error: error.toString() })
            );
    },

    getNearestRegions({ commit }, {footprint, messages, errors}) {
        commit('getNearestRegionsRequest');
        networkService.getNearestRegions(footprint, messages, errors)
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

    addPlanAndStartNetworkRequest(state) {
        state.loading.startingNetwork = true;
    },
    addPlanAndStartNetworkSuccess(state, newNodeNotification) {
        state.loading.startingNetwork = false;
        state.newNodeNotification = newNodeNotification;
    },
    addPlanSuccessStartNetworkFailure(state, error) {
        state.loading.startingNetwork = false;
        state.error = { error };
    },
    addPlanFailure(state, error) {
        state.loading.startingNetwork = false;
        state.error = { error };
    },

    getNetworkStatusRequest(state, network) {
        state.loading.networkStatuses = true;
    },
    getNetworkStatusSuccess(state, {network, statuses}) {
        state.loading.networkStatuses = false;
        state.networkStatuses[network] = statuses;
    },
    getNetworkStatusFailure(state, {network, error}) {
        state.loading.networkStatuses = false;
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
    loading: util.checkLoading(state.loading)
};

export const networks = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
