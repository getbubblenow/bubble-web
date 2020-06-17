/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import { appService } from '../_services';
import { util } from '../_helpers';

const state = {
    loading: {
        apps: false, app: false, enableApp: false, disableApp: false,
        sites: false, site: false, enableSite: false, disableSite: false,
        appData: false, appConfig: false, action: false
    },
    error: null,
    apps: [],
    icons: {},
    app: null,
    sites: [],
    site: null,
    appData: null,
    appConfigData: null,
    actionResult: null
};

const actions = {
    // Apps
    getAppsByUserId({ commit }, {userId, messages, errors}) {
        commit('getAppsByUserIdRequest');
        appService.getAppsByUserId(userId, messages, errors)
            .then(
                apps => {
                    if (apps && apps.length && apps.length > 0) {
                        for (let i=0; i<apps.length; i++) {
                            let app = apps[i];
                            if (typeof state.icons[app.name] === 'undefined' || state.icons[app.name] === null) {
                                appService.getAppAssetByUserId(
                                    userId, app.name, 'icon', messages, errors
                                ).then(
                                    assetData => {
                                        if (typeof app.assets === 'undefined' || app.assets === null) {
                                            app.assets = {};
                                        }
                                        const newIcon = {};
                                        newIcon[app.name] = assetData;
                                        state.icons = Object.assign({}, state.icons, newIcon);
                                    }
                                );
                            }
                        }
                    }
                    commit('getAppsByUserIdSuccess', apps);
                },
                error => commit('getAppsByUserIdFailure', error)
            );
    },

    getAppByUserId({ commit }, {userId, appId, messages, errors}) {
        commit('getAppByUserIdRequest');
        appService.getAppByUserId(userId, appId, messages, errors)
            .then(
                app => commit('getAppByUserIdSuccess', app),
                error => commit('getAppByUserIdFailure', error)
            );
    },

    enableAppByUserId({ commit }, {userId, appId, messages, errors}) {
        commit('enableAppByUserIdRequest');
        appService.enableAppByUserId(userId, appId, messages, errors)
            .then(
                app => commit('enableAppByUserIdSuccess', app),
                error => commit('enableAppByUserIdFailure', error)
            );
    },

    disableAppByUserId({ commit }, {userId, appId, messages, errors}) {
        commit('disableAppByUserIdRequest');
        appService.disableAppByUserId(userId, appId, messages, errors)
            .then(
                app => commit('disableAppByUserIdSuccess', app),
                error => commit('disableAppByUserIdFailure', error)
            );
    },

    // Sites
    getAppSitesByUserId({ commit }, {userId, appId, messages, errors}) {
        commit('getAppSitesByUserIdRequest');
        appService.getAppSitesByUserId(userId, appId, messages, errors)
            .then(
                sites => commit('getAppSitesByUserIdSuccess', sites),
                error => commit('getAppSitesByUserIdFailure', error)
            );
    },

    getAppSiteByUserId({ commit }, {userId, appId, siteId, messages, errors}) {
        commit('getAppSiteByUserIdRequest');
        appService.getAppSiteByUserId(userId, appId, siteId, messages, errors)
            .then(
                site => commit('getAppSiteByUserIdSuccess', site),
                error => commit('getAppSiteByUserIdFailure', error)
            );
    },

    enableAppSiteByUserId({ commit }, {userId, appId, siteId, messages, errors}) {
        commit('enableAppSiteByUserIdRequest');
        appService.enableAppSiteByUserId(userId, appId, siteId, messages, errors)
            .then(
                site => commit('enableAppSiteByUserIdSuccess', site),
                error => commit('enableAppSiteByUserIdFailure', error)
            );
    },

    disableAppSiteByUserId({ commit }, {userId, appId, siteId, messages, errors}) {
        commit('disableAppSiteByUserIdRequest');
        appService.disableAppSiteByUserId(userId, appId, siteId, messages, errors)
            .then(
                site => commit('disableAppSiteByUserIdSuccess', site),
                error => commit('disableAppSiteByUserIdFailure', error)
            );
    },

    // App Data
    resetAppData({ commit }) {
        commit('resetAppDataSuccess');
    },

    getAppDataByUserId({ commit }, {userId, appId, viewId, query, messages, errors}) {
        commit('getAppDataByUserIdRequest');
        appService.getAppDataByUserId(userId, appId, viewId, query, messages, errors)
            .then(
                appData => commit('getAppDataByUserIdSuccess', appData),
                error => commit('getAppDataByUserIdFailure', error)
            );
    },

    getAppSiteDataByUserId({ commit }, {userId, appId, siteId, viewId, query, messages, errors}) {
        commit('getAppSiteDataByUserIdRequest');
        appService.getAppSiteDataByUserId(userId, appId, siteId, viewId, query, messages, errors)
            .then(
                appData => commit('getAppSiteDataByUserIdSuccess', appData),
                error => commit('getAppSiteDataByUserIdFailure', error)
            );
    },

    takeDataAction({ commit }, {userId, appId, dataId, action, messages, errors}) {
        commit('takeDataActionRequest');
        appService.takeDataAction(userId, appId, dataId, action, messages, errors)
            .then(
                appData => commit('takeDataActionSuccess', appData),
                error => commit('takeDataActionFailure', error)
            );
    },

    // App Config
    getAppConfigViewByUserId({ commit }, {userId, appId, viewId, itemId, messages, errors}) {
        commit('getAppConfigViewByUserIdRequest');
        appService.getAppConfigViewByUserId(userId, appId, viewId, itemId, messages, errors)
            .then(
                appConfigData => commit('getAppConfigViewByUserIdSuccess', appConfigData),
                error => commit('getAppConfigViewByUserIdFailure', error)
            );
    },

    takeConfigItemAction({ commit }, {userId, appId, viewId, itemId, params, action, messages, errors}) {
        commit('takeConfigItemActionRequest');
        appService.takeConfigItemAction(userId, appId, viewId, itemId, params, action, messages, errors)
            .then(
                actionResult => commit('takeConfigItemActionSuccess', actionResult),
                error => commit('takeConfigItemActionFailure', error)
            );
    },

    takeConfigAppAction({ commit }, {userId, appId, viewId, itemId, params, action, messages, errors}) {
        commit('takeConfigAppActionRequest');
        appService.takeConfigAppAction(userId, appId, viewId, itemId, params, action, messages, errors)
            .then(
                actionResult => commit('takeConfigAppActionSuccess', actionResult),
                error => commit('takeConfigAppActionFailure', error)
            );
    }
};

const mutations = {
    // Apps
    getAppsByUserIdRequest(state) {
        state.loading.apps = true;
    },
    getAppsByUserIdSuccess(state, apps) {
        state.loading.apps = false;
        state.apps = apps;
    },
    getAppsByUserIdFailure(state, error) {
        state.loading.apps = false;
        state.error = error;
    },

    getAppByUserIdRequest(state) {
        state.loading.app = true;
    },
    getAppByUserIdSuccess(state, app) {
        state.loading.app = false;
        state.app = app;
    },
    getAppByUserIdFailure(state, error) {
        state.loading.app = false;
        state.error = error;
    },

    enableAppByUserIdRequest(state) {
        state.loading.enableApp = true;
    },
    enableAppByUserIdSuccess(state, app) {
        state.loading.enableApp = false;
        state.app = app;
    },
    enableAppByUserIdFailure(state, error) {
        state.loading.enableApp = false;
        state.error = error;
    },

    disableAppByUserIdRequest(state) {
        state.loading.disableApp = true;
    },
    disableAppByUserIdSuccess(state, app) {
        state.loading.disableApp = false;
        state.app = app;
    },
    disableAppByUserIdFailure(state, error) {
        state.loading.disableApp = false;
        state.error = error;
    },

    // Sites
    getAppSitesByUserIdRequest(state) {
        state.loading.sites = true;
    },
    getAppSitesByUserIdSuccess(state, sites) {
        state.loading.sites = false;
        state.sites = sites;
    },
    getAppSitesByUserIdFailure(state, error) {
        state.loading.sites = false;
        state.error = error;
    },

    getAppSiteByUserIdRequest(state) {
        state.loading.site = true;
    },
    getAppSiteByUserIdSuccess(state, site) {
        state.loading.site = false;
        state.site = site;
    },
    getAppSiteByUserIdFailure(state, error) {
        state.loading.site = false;
        state.error = error;
    },

    enableAppSiteByUserIdRequest(state) {
        state.loading.enableSite = true;
    },
    enableAppSiteByUserIdSuccess(state, site) {
        state.loading.enableSite = false;
        state.site = site;
    },
    enableAppSiteByUserIdFailure(state, error) {
        state.loading.enableSite = false;
        state.error = error;
    },

    disableAppSiteByUserIdRequest(state) {
        state.loading.disableSite = true;
    },
    disableAppSiteByUserIdSuccess(state, site) {
        state.loading.disableSite = false;
        state.site = site;
    },
    disableAppSiteByUserIdFailure(state, error) {
        state.loading.disableSite = false;
        state.error = error;
    },

    resetAppDataSuccess(state) {
        state.loading.appData = false;
        state.appData = null;
    },

    // App Data
    getAppDataByUserIdRequest(state) {
        state.loading.appData = true;
    },
    getAppDataByUserIdSuccess(state, appData) {
        state.loading.appData = false;
        state.appData = appData;
    },
    getAppDataByUserIdFailure(state, error) {
        state.loading.appData = false;
        state.error = error;
    },

    // App Site Data
    getAppSiteDataByUserIdRequest(state) {
        state.loading.appData = true;
    },
    getAppSiteDataByUserIdSuccess(state, appData) {
        state.loading.appData = false;
        state.appData = appData;
    },
    getAppSiteDataByUserIdFailure(state, error) {
        state.loading.appData = false;
        state.error = error;
    },

    takeDataActionRequest(state) {
        state.loading.action = true;
    },
    takeDataActionSuccess(state, result) {
        state.loading.action = false;
        state.actionResult = result;
    },
    takeDataActionFailure(state, error) {
        state.loading.action = false;
        state.error = error;
    },

    // App Config
    getAppConfigViewByUserIdRequest(state) {
        state.loading.appConfig = true;
    },
    getAppConfigViewByUserIdSuccess(state, appConfigData) {
        state.loading.appConfig = false;
        state.appConfigData = appConfigData;
    },
    getAppConfigViewByUserIdFailure(state, error) {
        state.loading.appConfig = false;
        state.error = error;
    },

    takeConfigItemActionRequest(state) {
        state.loading.action = true;
    },
    takeConfigItemActionSuccess(state, actionResult) {
        state.loading.action = false;
        state.actionResult = actionResult;
    },
    takeConfigItemActionFailure(state, error) {
        state.loading.action = false;
        state.error = error;
    },

    takeConfigAppActionRequest(state) {
        state.loading.action = true;
    },
    takeConfigAppActionSuccess(state, actionResult) {
        state.loading.action = false;
        state.actionResult = actionResult;
    },
    takeConfigAppActionFailure(state, error) {
        state.loading.action = false;
        state.error = error;
    }
};

const getters = {
    loading: util.checkLoading(state.loading, 'apps')
};

export const apps = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
