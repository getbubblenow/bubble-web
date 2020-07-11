/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import { networkService } from '~/_services';
import { accountPlanService } from '~/_services';
import { util } from '~/_helpers';

const state = {
    loading: {
        networks: false, network: false, stopping: false, restoring: false, deleting: false,
        nearestRegions: false, startingNetwork: false, networkStatuses: false, networkNodes: false,
        requestNetworkKeys: false, retrieveNetworkKeys: false, queueBackup: false
    },
    creating: null,
    error: null,
    networks: null,
    network: null,
    nearestRegions: null,
    newNodeNotification: null,
    networkStatuses: [],
    networkNodes: null,
    deletedNetworkUuid: null,
    networkKeysRequested: null,
    networkKeys: null,
    restoreKey: null,
    backups: null,
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

    getBackups({ commit }, { userId, networkId, messages, errors }) {
        commit('getNetworkBackupsRequest');
        networkService.getNetworkBackups(userId, networkId, messages, errors)
                      .then(backups => commit('getNetworkBackupsSuccess', backups),
                            error => commit('getNetworkBackupsFailure', error));
    },

    getNetworkById({ commit }, {userId, networkId, messages, errors}) {
        commit('getNetworkByIdRequest');
        networkService.getNetworkById(userId, networkId, messages, errors)
                      .then(network => commit('getNetworkByIdSuccess', network),
                            error => commit('getNetworkByIdFailure', error));
    },

    addPlanAndStartNetwork({ commit }, {userId, accountPlan, cloud, region, messages, errors}) {
        commit('addPlanAndStartNetworkRequest');
        accountPlanService.newAccountPlan(userId, accountPlan, messages, errors)
            .then(
                plan => {
                    if (accountPlan.forkHost && accountPlan.forkHost !== '') {
                        networkService.forkNetwork(userId, plan.name, accountPlan.forkHost, cloud, region, messages, errors)
                            .then(
                                newNodeNotification => commit('addPlanAndStartNetworkSuccess', newNodeNotification),
                                error => commit('addPlanSuccessStartNetworkFailure', error)
                            );

                    } else {
                        networkService.startNetwork(userId, plan.name, cloud, region, messages, errors)
                            .then(
                                newNodeNotification => commit('addPlanAndStartNetworkSuccess', newNodeNotification),
                                error => commit('addPlanSuccessStartNetworkFailure', error)
                            );
                    }
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

    stopNetwork({ commit }, {userId, networkId, messages, errors}) {
        commit('stopNetworkRequest', networkId);
        networkService.stopNetwork(userId, networkId, messages, errors)
            .then(
                ok => commit('stopNetworkSuccess', {networkId, ok}),
                error => commit('stopNetworkFailure', { networkId, error: error.toString() })
            );
    },

    queueBackup({ commit, dispatch }, { userId, networkId, messages, errors }) {
        commit('queueBackupRequest', networkId);
        networkService.queueBackup(userId, networkId, messages, errors)
                      .then(backup => commit('queueBackupSuccess', backup),
                            error => commit('queueBackupFailure', { networkId, error: error.toString() }))
                      .then(r => dispatch('getBackups',
                            { userId: userId, networkId: networkId,
                              messages: messages, errors: errors }));
    },

    restoreNetwork({ commit }, { userId, networkId, messages, errors }) {
        commit('restoreNetworkRequest', networkId);
        networkService.restoreNetwork(userId, networkId, messages, errors)
            .then(
                network => commit('restoreNetworkSuccess', network),
                error => commit('restoreNetworkFailure', { networkId, error: error.toString() })
            );
    },

    deleteNetwork({ commit }, {userId, networkId, messages, errors}) {
        commit('deleteNetworkRequest', networkId);
        networkService.deleteNetwork(userId, networkId, messages, errors)
            .then(
                plan => commit('deleteNetworkSuccess', plan),
                error => commit('deleteNetworkFailure', { networkId, error: error.toString() })
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

    requestNetworkKeys({ commit }, {userId, networkId, messages, errors}) {
        commit('requestNetworkKeysRequest');
        networkService.requestNetworkKeys(userId, networkId, messages, errors)
            .then(
                ok => commit('requestNetworkKeysSuccess', networkId),
                error => commit('requestNetworkKeysFailure', error)
            );
    },

    retrieveNetworkKeys({ commit }, {userId, networkId, code, password, messages, errors}) {
        commit('retrieveNetworkKeysRequest');
        networkService.retrieveNetworkKeys(userId, networkId, code, password, messages, errors)
            .then(
                keys => commit('retrieveNetworkKeysSuccess', keys),
                error => commit('retrieveNetworkKeysFailure', error)
            );
    },

    resetRestoreKey({ commit }) { commit('resetRestoreKey'); }
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
        if (error === 'Not Found') {
            state.network = { uuid: 'Not Found' };
        } else {
            console.log('getNetworkByIdFailure: error='+JSON.stringify(error));
        }
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
        state.networkStatuses = statuses;
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

    stopNetworkRequest(state, id) {
        state.loading.stopping = true;
    },
    stopNetworkSuccess(state, { networkId, ok }) {
        state.loading.stopping = false;
        if (state.network && state.network.uuid && state.network.uuid === networkId) {
            state.network.state = 'stopping';
        }
    },
    stopNetworkFailure(state, { id, error }) {
        state.loading.stopping = false;
        state.error = error;
    },

    queueBackupRequest(state, id) {
        state.loading.queueBackup = true;
    },
    queueBackupSuccess(state, id) {
        // noop - state.loading.queueBackup will be set to false only after backup info is loaded to prevent allowing
        // another backup in queue before this one i really processed.
    },
    queueBackupFailure(state, { id, error }) {
        state.loading.queueBackup = false;
        state.error = error;
    },

    restoreNetworkRequest(state, networkId) {
        state.loading.restoring = true;
        state.restoreKey = null;
    },
    restoreNetworkSuccess(state, restoreNodeNotification) {
        state.restoreKey = restoreNodeNotification.restoreKey;
        state.loading.restoring = false;
    },
    restoreNetworkFailure(state, { restoreNodeNotification, error }) {
        state.loading.restoring = false;
        state.error = error;
    },
    resetRestoreKey(state) {
        state.restoreKey = null;
    },

    deleteNetworkRequest(state, id) {
        state.loading.deleting = true;
    },
    deleteNetworkSuccess(state, deletedPlan) {
        state.loading.deleting = false;
        const deletedNet = deletedPlan.deletedNetwork;
        // remove deleted network from state
        if (state.networks) {
            state.networks = state.networks.filter(network => network.uuid !== deletedNet)
        }
        state.deletedNetworkUuid = deletedNet;
    },
    deleteNetworkFailure(state, { net, error }) {
        state.loading.deleting = false;
        // remove 'deleting:true' property and add 'deleteNetworkError:[error]' property to network
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
    },

    requestNetworkKeysRequest(state) {
        state.loading.requestNetworkKeys = true;
        state.networkKeysRequested = null;
        state.networkKeys = null;
    },
    requestNetworkKeysSuccess(state, networkId) {
        state.loading.requestNetworkKeys = false;
        state.networkKeysRequested = networkId;
    },
    requestNetworkKeysFailure(state, error) {
        state.loading.requestNetworkKeys = false;
        state.error = { error };
    },

    retrieveNetworkKeysRequest(state) {
        state.loading.retrieveNetworkKeys = true;
        state.networkKeysRequested = null;
        state.networkKeys = null;
    },
    retrieveNetworkKeysSuccess(state, keys) {
        state.loading.retrieveNetworkKeys = false;
        state.networkKeys = keys;
    },
    retrieveNetworkKeysFailure(state, error) {
        state.loading.retrieveNetworkKeys = false;
        state.error = { error };
    },
    getNetworkBackupsRequest(state, backups) {
        state.backups = null;
    },
    getNetworkBackupsSuccess(state, backups) {
        state.backups = backups;
        state.loading.queueBackup = false;
    },
    getNetworkBackupsFailure(state, error) {
        state.backups = null;
        state.loading.queueBackup = false;
        state.error = { error };
    }
};

const getters = {
    loading: util.checkLoading(state.loading, 'networks')
};

export const networks = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
