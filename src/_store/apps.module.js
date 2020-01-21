import { appService } from '../_services';
import { util } from '../_helpers';

const state = {
    loading: {
        enableMitm: false, disableMitm: false,
        apps: false, app: false, enableApp: false, disableApp: false
    },
    mitmEnabled: null,
    error: null,
    apps: [],
    app: null
};

const actions = {
    getMitmStatus({ commit }, {userId, messages, errors}) {
        commit('getMitmStatusRequest');
        appService.getMitmStatus(userId, messages, errors)
            .then(
                enabled => commit('getMitmStatusSuccess', enabled),
                error => commit('getMitmStatusFailure', error)
            );
    },

    enableMitm({ commit }, {userId, messages, errors}) {
        commit('enableMitmRequest');
        appService.enableMitm(userId, messages, errors)
            .then(
                enabled => commit('enableMitmSuccess', enabled),
                error => commit('enableMitmFailure', error)
            );
    },

    disableMitm({ commit }, {userId, messages, errors}) {
        commit('disableMitmRequest');
        appService.disableMitm(userId, messages, errors)
            .then(
                enabled => commit('disableMitmSuccess', enabled),
                error => commit('disableMitmFailure', error)
            );
    },

    getAppsByUserId({ commit }, {userId, messages, errors}) {
        commit('getAppsByUserIdRequest');
        appService.getAppsByUserId(userId, messages, errors)
            .then(
                apps => commit('getAppsByUserIdSuccess', apps),
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
    }
};

const mutations = {
    getMitmStatusRequest(state) {
        state.loading.getMitmStatus = true;
    },
    getMitmStatusSuccess(state, enabled) {
        state.loading.getMitmStatus = false;
        state.mitmEnabled = enabled;
    },
    getMitmStatusFailure(state, error) {
        state.loading.getMitmStatus = false;
        state.error = error;
    },

    enableMitmRequest(state) {
        state.loading.enableMitm = true;
    },
    enableMitmSuccess(state, enabled) {
        state.loading.enableMitm = false;
        state.mitmEnabled = enabled;
    },
    enableMitmFailure(state, error) {
        state.loading.apps = false;
        state.error = error;
    },

    disableMitmRequest(state) {
        state.loading.disableMitm = true;
    },
    disableMitmSuccess(state, enabled) {
        state.loading.disableMitm = false;
        state.mitmEnabled = enabled;
    },
    disableMitmFailure(state, error) {
        state.loading.apps = false;
        state.error = error;
    },

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
    }

};

const getters = {
    loading: util.checkLoading(state.loading)
};

export const apps = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
