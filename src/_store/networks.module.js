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
        requestNetworkKeys: false, retrieveNetworkKeys: false, queueBackup: false, managingLogFlag: false,
        preparingLatestBackup: false
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
    restoreKey: null,
    backups: null,
    logFlag: null
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

    addPlanAndStartNetwork({ commit }, {userId, accountPlan, cloud, region, exactRegion, messages, errors}) {
        commit('addPlanAndStartNetworkRequest');
        accountPlanService.newAccountPlan(userId, accountPlan, messages, errors)
            .then(
                plan => {
                    if (accountPlan.forkHost && accountPlan.forkHost !== '') {
                        networkService.forkNetwork(userId, plan.name, accountPlan.forkHost, accountPlan.adminEmail, cloud, region, exactRegion, messages, errors)
                            .then(
                                newNodeNotification => commit('addPlanAndStartNetworkSuccess', newNodeNotification),
                                error => commit('addPlanSuccessStartNetworkFailure', error)
                            );

                    } else {
                        networkService.startNetwork(userId, plan.name, cloud, region, exactRegion, messages, errors)
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
                      .then(ok => commit('retrieveNetworkKeysSuccess'),
                            error => commit('retrieveNetworkKeysFailure', error));
    },

    buildLatestBackupPackage({ commit }, {userId, networkId, code, password}) {
        commit('buildLatestBackupPackageRequest');
        networkService.startBackupPackageDownload(userId, networkId, code, password, state.backups[0].uuid)
                .then(ok => commit('buildLatestBackupPackageSuccess'),
                      error => commit('buildLatestBackupPackageFailure', error));
    },
    latestBackupBuildingStatus({ commit }, { userId, networkId, code, messages, errors }) {
        commit('latestBackupBuildingStatusRequest');
        networkService.backupPackageStatus(userId, networkId, code, messages, errors)
                      .then(status => commit('latestBackupBuildingStatusSuccess', status),
                            error => commit('latestBackupBuildingStatusFailure', error));
    },
    latestBackupDownload({ commit }, { userId, networkId, code, messages, errors }) {
        commit('latestBackupDownloadRequest');
        networkService.backupPackageDownload(userId, networkId, code, messages, errors)
                      .then(ok => commit('latestBackupDownloadSuccess'),
                            error => commit('latestBackupDownloadFailure', error));
    },

    getLogFlag({ commit }, { networkId, messages, errors }) {
        commit('getLogFlagRequest');
        networkService.getLogFlag(networkId, messages, errors)
                      .then(logFlag => commit('getLogFlagSuccess', logFlag),
                            error => commit('getLogFlagFailure', error));
    },
    disableLog({ commit }, { networkId, messages, errors }) {
        commit('disableLogRequest');
        networkService.disableLog(networkId, messages, errors)
                      .then((ok) => commit('disableLogSuccess'), (error) => commit('disableLogFailure', error));
    },
    enableLog({ commit, dispatch }, { disableInDays, networkId, messages, errors }) {
        commit('enableLogRequest');
        networkService.enableLog(disableInDays, networkId, messages, errors)
                      .then((ok) => commit('enableLogSuccess'), (error) => commit('enableLogFailure', error))
                      .then((r) => dispatch('getLogFlag',
                                            { networkId: networkId, messages: messages, errors: errors }));
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
    },
    retrieveNetworkKeysSuccess(state) {
        state.loading.retrieveNetworkKeys = false;
    },
    retrieveNetworkKeysFailure(state, error) {
        state.loading.retrieveNetworkKeys = false;
        state.error = { error };
    },

    buildLatestBackupPackageRequest(state) {
        state.loading.retrieveNetworkKeys = true;
        state.loading.preparingLatestBackup = true;
        state.networkKeysRequested = null;
    },
    buildLatestBackupPackageSuccess(state) {
        // noop
    },
    buildLatestBackupPackageFailure(state, error) {
        state.loading.retrieveNetworkKeys = false;
        state.loading.preparingLatestBackup = false;
        state.error = { error };
    },
    latestBackupBuildingStatusRequest(state) {
        state.loading.retrieveNetworkKeys = true;
        state.loading.preparingLatestBackup = true;
    },
    latestBackupBuildingStatusSuccess(state, packageBuildingStatus) {
        if (packageBuildingStatus && packageBuildingStatus.done === true) {
            if (packageBuildingStatus.error) {
                return latestBackupBuildingStatusFailure(state, packageBuildingStatus.error);
            }
            state.loading.preparingLatestBackup = false;
        }
    },
    latestBackupBuildingStatusFailure(state, error) {
        state.loading.retrieveNetworkKeys = false;
        state.loading.preparingLatestBackup = false;
        state.error = { error };
    },
    latestBackupDownloadRequest(state) {
        // noop
    },
    latestBackupDownloadSuccess(state) {
        state.loading.retrieveNetworkKeys = false;
    },
    latestBackupDownloadFailure(state, error) {
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
    },
    getLogFlagRequest(state) {
        state.logFlag = null;
        state.loading.managingLogFlag = true;
    },
    getLogFlagSuccess(state, logFlag) {
        state.logFlag = logFlag;
        state.loading.managingLogFlag = false;
    },
    getLogFlagFailure(state, error) {
        state.logFlag = null;
        state.loading.managingLogFlag = false;
        state.error = { error };
    },
    disableLogRequest(state) {
        state.loading.managingLogFlag = true;
    },
    disableLogSuccess(state) {
        state.logFlag = {flag: false}; // no need to reload this now
        state.loading.managingLogFlag = false;
    },
    disableLogFailure(state, error) {
        state.loading.managingLogFlag = false;
        state.error = { error };
    },
    enableLogRequest(state) {
        state.loading.managingLogFlag = true;
    },
    enableLogSuccess(state) {
        state.logFlag = null;
        state.loading.managingLogFlag = false;
    },
    enableLogFailure(state, error) {
        state.loading.managingLogFlag = false;
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
