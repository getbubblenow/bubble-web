import { networkService } from '../_services';
import { accountPlanService } from '../_services';
import { util } from '../_helpers';

const state = {
    loading: {
        networks: false, network: false, deleting: false,
        nearestRegions: false, startingNetwork: false, networkStatuses: false, networkNodes: false
    },
    creating: null,
    error: null,
    networks: null,
    network: null,
    nearestRegions: null,
    newNodeNotification: null,
    networkStatuses: {},
    networkNodes: null
};

const actions = {
    getAllNetworks({ commit }, {userId, messages, errors}) {
        commit('getAllNetworksRequest');
        networkService.getAllNetworks(userId, messages, errors)
            .then(
                networks => commit('getAllNetworksSuccess', networks),
                error => commit('getAllNetworksFailure', error)
            );
    },

    getNetworkById({ commit }, {userId, networkId, messages, errors}) {
        commit('getNetworkByIdRequest');
        networkService.getNetworkById(userId, networkId, messages, errors)
            .then(
                network => commit('getNetworkByIdSuccess', network),
                error => commit('getNetworkByIdFailure', error)
            );
    },

    addPlanAndStartNetwork({ commit }, {userId, accountPlan, cloud, region, messages, errors}) {
        commit('addPlanAndStartNetworkRequest');
        accountPlanService.newAccountPlan(userId, accountPlan, messages, errors)
            .then(
                plan => {
                    networkService.startNetwork(userId, plan.name, cloud, region, messages, errors)
                        .then(
                            newNodeNotification => commit('addPlanAndStartNetworkSuccess', newNodeNotification),
                            error => commit('addPlanSuccessStartNetworkFailure', error)
                        );
                },
                error => commit('addPlanFailure', error)
            );
    },

    getStatusesByNetworkId({ commit }, {userId, networkId, messages, errors}) {
        commit('getStatusesByNetworkIdRequest', networkId);
        networkService.getStatusesByNetworkId(userId, networkId, messages, errors)
            .then(
                statuses => commit('getStatusesByNetworkIdSuccess', { networkId, statuses }),
                error => commit('getStatusesByNetworkIdFailure', { networkId, error })
            );
    },

    getNodesByNetworkId({ commit }, {userId, networkId, messages, errors}) {
        commit('getNodesByNetworkIdRequest', networkId);
        networkService.getNodesByNetworkId(userId, networkId, messages, errors)
            .then(
                nodes => commit('getNodesByNetworkIdSuccess', nodes),
                error => commit('getNodesByNetworkIdFailure', error)
            );
    },

    deleteNetwork({ commit }, {userId, networkId, messages, errors}) {
        commit('deleteRequest', id);
        networkService.deleteNetwork(userId, networkId, messages, errors)
            .then(
                network => commit('deleteSuccess', network),
                error => commit('deleteFailure', { networkId, error: error.toString() })
            );
    },

    getNearestRegions({ commit }, {footprintId, messages, errors}) {
        commit('getNearestRegionsRequest');
        networkService.getNearestRegions(footprintId, messages, errors)
            .then(
                regions => commit('getNearestRegionsSuccess', regions),
                error => commit('getNearestRegionsFailure', error)
            );
    },
};

const mutations = {
    getAllNetworksRequest(state) {
        state.loading.networks = true;
    },
    getAllNetworksSuccess(state, networks) {
        state.loading.networks = false;
        state.networks = networks;
    },
    getAllNetworksFailure(state, error) {
        state.loading.networks = false;
        state.error = { error };
    },
    getNetworkByIdRequest(state) {
        state.loading.network = true;
    },
    getNetworkByIdSuccess(state, network) {
        state.loading.network = false;
        state.network = network;
    },
    getNetworkByIdFailure(state, error) {
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

    getStatusesByNetworkIdRequest(state, networkId) {
        state.loading.networkStatuses = true;
    },
    getStatusesByNetworkIdSuccess(state, {networkId, statuses}) {
        state.loading.networkStatuses = false;
        const newStatuses = {};
        newStatuses[networkId] = statuses;
        state.networkStatuses = Object.assign({}, state.networkStatuses, newStatuses);
    },
    getStatusesByNetworkIdFailure(state, {networkId, error}) {
        state.loading.networkStatuses = false;
        state.error = { error };
    },

    getNodesByNetworkIdRequest(state, networkId) {
        state.loading.networkNodes = true;
    },
    getNodesByNetworkIdSuccess(state, nodes) {
        state.loading.networkNodes = false;
        state.networkNodes = nodes;
    },
    getNodesByNetworkIdFailure(state, error) {
        state.loading.networkNodes = false;
        state.error = { error };
    },

    deleteRequest(state, id) {
        state.loading.deleting = true;
    },
    deleteSuccess(state, id) {
        state.loading.deleting = false;
        // remove deleted network from state
        if (state.networks) {
            state.networks = state.networks.filter(network => (network.uuid !== id && network.name !== id))
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
