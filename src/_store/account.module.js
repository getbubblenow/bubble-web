/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import { userService } from '../_services';
import { router, util } from '../_helpers';

const user = util.currentUser();

const defaultStatus = {
    loggingIn: false,
    loggedIn: false,
    registering: false,
    updating: false,
    settingLocale: false,
    activating: false,
    approving: false,
    denying: false,
    authenticating: false,
    sendingVerification: false,
    sendingResetPasswordMessage: false,
    registrationError: null,
    requestAccountDownloadRequestSent: false,
    downloadingAccount: false
};

const state = {
    activated: null,
    status: Object.assign({}, defaultStatus, {loggedIn: (user != null)}),
    user: user,
    actionStatus: {},
    loginError: null,
    resetPasswordMessageSent: false,
    locale: user == null ? 'detect' : (typeof user.locale !== 'undefined' && user.locale !== null ? user.locale : 'detect')
};

const actions = {
    refreshUser({ commit }) {
        commit('refreshUser', JSON.parse(localStorage.getItem(util.USER_KEY)));
    },
    checkSession({ commit }, { messages, errors }) {
        commit('checkSessionRequest');
        userService.getMe(messages, errors)
            .then(
                user => commit('checkSessionSuccess', user),
                error => {
                    commit('checkSessionFailure', error);
                    if (error === 'Unauthorized' || error === 'Not Found' || error === 'Forbidden' ) {
                        userService.logout(messages, errors).then(
                            ok => router.replace('/login'),
                            error => router.replace('/login')
                        );
                    }
                }
            );
    },
    login({ dispatch, commit }, { user, systemConfigs, messages, errors }) {
        commit('loginRequest', { name: user.name });
        userService.login(user.name, user.password, user.totpToken, user.unlockKey, messages, errors)
            .then(
                user => {
                    commit('loginSuccess', user);
                    if (user.token) {
                        if (user.unlockKey) {
                            console.log('account.login: reloading system configs after unlock');
                            dispatch('system/loadSystemConfigs');
                        }
                        const landing = util.getLandingPage();
                        if (landing === null) {
                            console.log('account.login: no landing page, systemConfigs.bubbleNode=='+systemConfigs.bubbleNode+', systemConfigs.sageLauncher=='+systemConfigs.sageLauncher);
                            if (systemConfigs.bubbleNode === false || systemConfigs.sageLauncher === true) {
                                router.replace('/bubbles');
                            } else if (systemConfigs.bubbleNode === true) {
                                router.replace('/devices');
                            } else {
                                router.replace('/');
                            }
                        } else {
                            console.log('account.login: landing page=='+JSON.stringify(landing)+', systemConfigs.bubbleNode=='+systemConfigs.bubbleNode);
                            util.resetLandingPage();
                            router.replace(landing.fullPath);
                        }
                    } else if (user.multifactorAuth) {
                        router.replace('/auth');
                    }
                },
                error => commit('loginFailure', error)
            );
    },
    appLogin({ commit }, { session, uri, messages, errors }) {
        commit('appLoginRequest');
        userService.appLogin(session, messages, errors)
            .then(
                user => commit('appLoginSuccess', {user, uri}),
                error => {
                    commit('appLoginFailure', error);
                    if (error === 'Unauthorized' || error === 'Not Found' || error === 'Forbidden' ) {
                        userService.logout(messages, errors).then(
                            ok => router.replace('/login'),
                            error => router.replace('/login')
                        );
                    }
                }
            );
    },
    logout({ commit }, {messages, errors}) {
        commit('logoutRequest');
        userService.logout(messages, errors)
            .then(
                ok => commit('logoutSuccess'),
                error => commit('logoutFailure', error)
            );
    },
    forgotPassword({ commit }, {username, messages, errors}) {
        commit('forgotPasswordRequest');
        userService.forgotPassword(username, messages, errors)
            .then(
                ok => commit('forgotPasswordSuccess'),
                error => commit('forgotPasswordFailure', error)
            );
    },
    register({ dispatch, commit }, {user, messages, errors}) {
        commit('registerRequest', user);
        userService.register(user, messages, errors)
            .then(
                user => {
                    commit('registerSuccess', user);
                    router.push('/new_bubble');
                    setTimeout(() => {
                        // display success message after route change completes
                        dispatch('alert/success', messages.alert_registration_success, { root: true });
                    })
                },
                error => commit('registerFailure', error)
            );
    },
    setLocale({ commit }, {locale, messages, errors}) {
        state.locale = locale;
        commit('setLocaleRequest', locale);
        userService.setLocale(locale, messages, errors)
            .then(
                user => commit('setLocaleSuccess', user),
                error => commit('setLocaleFailure', error)
            );
    },
    update({ dispatch, commit }, {user, messages, errors}) {
        commit('updateRequest', user);
        userService.update(user, messages, errors)
            .then(
                user => {
                    commit('updateSuccess', user);
                    router.push('/me');
                    setTimeout(() => {
                        // display success message after route change completes
                        dispatch('alert/success', messages.message_profile_update_success, { root: true });
                    })
                },
                error => {
                    commit('updateFailure', error);
                    dispatch('alert/error', error, { root: true });
                }
            );
    },

    approveAction({ commit }, {userId, code, data, messages, errors, enableTotpModal}) {
        commit('approveActionRequest');
        userService.approveAction(userId, code, data, messages, errors, enableTotpModal)
            .then(
                policy => commit('approveActionSuccess', policy),
                error => commit('approveActionFailure', error)
            );
    },
    denyAction({ commit }, {userId, code, messages, errors}) {
        commit('denyActionRequest');
        userService.denyAction(userId, code, messages, errors)
            .then(
                policy => commit('denyActionSuccess', policy),
                error => commit('denyActionFailure', error)
            );
    },
    sendAuthenticatorCode({ commit }, {userId, code, authOnly, verifyOnly, messages, errors}) {
        commit('sendAuthenticatorCodeRequest');
        userService.sendAuthenticatorCode(userId, code, authOnly, verifyOnly, messages, errors)
            .then(
                user => commit('sendAuthenticatorCodeSuccess', {user, messages}),
                error => commit('sendAuthenticatorCodeFailure', error)
            );
    },
    resendVerificationCode({ dispatch, commit }, {userId, contact, messages, errors}) {
        commit('resendVerificationCodeRequest');
        userService.resendVerificationCode(userId, contact, messages, errors)
            .then(
                policy => {
                    commit('resendVerificationCodeSuccess', policy);
                    setTimeout(() => {
                        // display success message after message sent
                        dispatch('alert/success', messages.alert_resend_verification_success, { root: true });
                    });
                },
                error => commit('resendVerificationCodeFailure', error)
            );
    },
    requestAccountDownload({ commit }, {messages, errors}) {
        commit('requestAccountDownloadRequest');
        userService.requestAccountDownload(messages, errors)
                   .then(ok => commit('requestAccountDownloadSuccess'),
                         error => commit('requestAccountDownloadFailure', error));
    },
    downloadAccount({ commit }, {token, messages, errors}) {
        commit('downloadAccountRequest');
        userService.downloadAccount(token, messages, errors)
                   .then(ok => commit('downloadAccountSuccess'),
                         error => commit('downloadAccountFailure', error));
    }
};

const mutations = {
    refreshUser(state, user) {
        state.status = Object.assign({}, state.status, {loggedIn: (user !== null)});
        state.user = user;
    },
    checkSessionRequest(state) {},
    checkSessionSuccess(state, user) {
        if (user.token) {
            if (util.currentUser() === null) {
                // we must have logged out while this request was in flight... do nothing
                state.user = null;
            } else {
                localStorage.setItem(util.USER_KEY, JSON.stringify(user));
                state.status = Object.assign({}, state.status, {loggingIn: false, loggedIn: true});
                state.user = user;
            }
        }
        state.locale = (typeof user.locale !== 'undefined' && user.locale !== null ? user.locale : state.locale);
    },
    checkSessionFailure(state, error) {
        state.user = null;
        state.status = Object.assign({}, state.status, {loggedIn: false});
    },
    loginRequest(state, user) {
        state.loginError = null;
        state.status = Object.assign({}, state.status, {loggingIn: true});
        state.user = user;
    },
    loginSuccess(state, user) {
        if (user.token) {
            state.status = Object.assign({}, state.status, {loggingIn: false, loggedIn: true});
        } else if (user.multifactorAuth) {
            state.status = { multifactorAuth: true };
        } else {
            state.status = {};
        }
        localStorage.setItem(util.USER_KEY, JSON.stringify(user));
        state.user = user;
        state.locale = (typeof user.locale !== 'undefined' && user.locale !== null ? user.locale : state.locale);
    },
    loginFailure(state, error) {
        state.loginError = error;
        state.status = Object.assign({}, state.status, {loggingIn: false, loggedIn: false});
        state.user = null;
    },

    appLoginRequest(state) {
        state.loginError = null;
        state.status = Object.assign({}, state.status, {loggingIn: true});
    },
    appLoginSuccess(state, {user, uri}) {
        if (user.token) {
            if (util.currentUser() === null) {
                // we must have logged out while this request was in flight... do nothing
                state.user = null;
            } else {
                localStorage.setItem(util.USER_KEY, JSON.stringify(user));
                state.status = Object.assign({}, state.status, {loggingIn: false, loggedIn: true});
                state.user = user;
            }
        }
        state.locale = (typeof user.locale !== 'undefined' && user.locale !== null ? user.locale : state.locale);
        if (user.token) router.replace(uri);
    },
    appLoginFailure(state, error) {
        state.user = null;
        state.status = Object.assign({}, state.status, {loggedIn: false});
    },

    logoutRequest(state) {},
    logoutSuccess(state) {
        state.status = Object.assign({}, defaultStatus);
        localStorage.removeItem(util.USER_KEY);
        state.user = null;
    },
    logoutFailure(state, error) {
        console.log('logout failed: '+JSON.stringify(error));
    },

    forgotPasswordRequest(state) {
        state.status = Object.assign({}, {sendingResetPasswordMessage: true});
        state.resetPasswordMessageSent = false;
    },
    forgotPasswordSuccess(state) {
        state.status = Object.assign({}, defaultStatus);
        state.resetPasswordMessageSent = true;
    },
    forgotPasswordFailure(state, error) {
        state.status = Object.assign({}, defaultStatus);
        console.log('forgotPassword failed: '+JSON.stringify(error));
    },

    registerRequest(state, user) {
        state.status = Object.assign({}, state.status, {registering: true});
        state.user = user;
    },
    registerSuccess(state, user) {
        state.user = user;
        state.status = Object.assign({}, state.status, {registering: false});
        localStorage.setItem(util.USER_KEY, JSON.stringify(user));
        state.locale = (typeof user.locale !== 'undefined' && user.locale !== null ? user.locale : state.locale);
        state.registrationError = null;
    },
    registerFailure(state, error) {
        state.status = Object.assign({}, state.status, {registering: false});
        state.status = {};
        state.registrationError = error;
    },

    setLocaleRequest(state, locale) {
        state.status = Object.assign({}, state.status, {settingLocale: true});
        state.locale = locale;
        const user = util.currentUser();
        if (user === null) {
            localStorage.setItem(util.USER_KEY, JSON.stringify({locale: locale}));
        } else {
            user.locale = locale;
            localStorage.setItem(util.USER_KEY, JSON.stringify(user));
        }
        state.user = user;
    },
    setLocaleSuccess(state, user) {
        state.locale = ''+state.locale;
        state.status = Object.assign({}, state.status, {settingLocale: false});
    },
    setLocaleFailure(state) {
        state.status = Object.assign({}, state.status, {settingLocale: false});
        state.status = {};
    },

    updateRequest(state, user) {
        state.status = Object.assign({}, state.status, {updating: true});
        state.user = user;
    },
    updateSuccess(state, user) {
        state.status = Object.assign({}, state.status, {updating: false});
        localStorage.setItem(util.USER_KEY, JSON.stringify(user));
        state.user = user;
        state.locale = (typeof user.locale !== 'undefined' && user.locale !== null ? user.locale : state.locale);
    },
    updateFailure(state) {
        state.status = Object.assign({}, state.status, {updating: false});
        state.status = {};
    },

    approveActionRequest(state) {
        state.status = Object.assign({}, state.status, {approving: true});
        state.actionStatus = { requesting: true, type: 'approve' };
    },
    approveActionSuccess(state, user) {
        state.status = Object.assign({}, state.status, {approving: false});
        state.actionStatus = { success: true, type: 'approve', result: user };
        if (user.token) {
            localStorage.setItem(util.USER_KEY, JSON.stringify(user));
            state.user = user;
        }
    },
    approveActionFailure(state, error) {
        state.status = Object.assign({}, state.status, {approving: false});
        state.actionStatus = { error: error, type: 'approve' };
    },
    denyActionRequest(state) {
        state.status = Object.assign({}, state.status, {denying: true});
        state.actionStatus = { requesting: true, type: 'deny' };
    },
    denyActionSuccess(state, denial) {
        state.status = Object.assign({}, state.status, {denying: false});
        state.actionStatus = { success: true, type: 'deny', result: denial };
        state.denial = denial;
    },
    denyActionFailure(state, error) {
        state.status = Object.assign({}, state.status, {denying: false});
        state.actionStatus = { error: error, type: 'deny' };
    },
    sendAuthenticatorCodeRequest(state) {
        state.status = Object.assign({}, state.status, {authenticating: true});
        state.actionStatus = { requesting: true, type: 'approve' };
    },
    sendAuthenticatorCodeSuccess(state, user, messages) {
        state.status = Object.assign({}, state.status, {authenticating: false});
        state.actionStatus = { success: true, type: 'approve', result: user };
        console.log('auth successful -- setting window.showTotpModal = false');
        window.showTotpModal = false;

        if (user.token) {
            state.user = user;
            localStorage.setItem(util.USER_KEY, JSON.stringify(user));

        } else if (user.multifactorAuth) {
            state.user.multifactorAuth = user.multifactorAuth;
            localStorage.setItem(util.USER_KEY, JSON.stringify(user));
        }
    },
    sendAuthenticatorCodeFailure(state, error) {
        state.status = Object.assign({}, state.status, {authenticating: false});
        state.actionStatus = { error: error, type: 'approve' };
    },

    resendVerificationCodeRequest(state) {
        state.status = Object.assign({}, state.status, {sendingVerification: true});
        state.actionStatus = { requesting: true, type: 'verify' };
    },
    resendVerificationCodeSuccess(state, policy) {
        state.status = Object.assign({}, state.status, {sendingVerification: false});
        state.actionStatus = { success: true, type: 'verify', result: policy };
    },
    resendVerificationCodeFailure(state, error) {
        state.status = Object.assign({}, state.status, {sendingVerification: false});
        state.actionStatus = { error: error, type: 'verify' };
    },

    requestAccountDownloadRequest(state) {
        state.status = Object.assign({}, state.status,
                                     { downloadingAccount: false, requestAccountDownloadRequestSent: false });
        state.actionStatus = { requesting: true, type: 'requestDownload' };
    },
    requestAccountDownloadSuccess(state) {
        state.status = Object.assign({}, state.status, { requestAccountDownloadRequestSent: true });
        state.actionStatus = { success: true, type: 'requestDownload' };
    },
    requestAccountDownloadFailure(state, error) {
        state.actionStatus = { error: error, type: 'requestDownload' };
        console.log('requestAccountDownloadFailure: ' + JSON.stringify(error));
    },

    downloadAccountRequest(state) {
        state.status = Object.assign({}, state.status, { downloadingAccount: true });
        state.actionStatus = { requesting: true, type: 'download' };
    },
    downloadAccountSuccess(state) {
        state.status = Object.assign({}, state.status, { downloadingAccount: false });
        state.actionStatus = { success: true, type: 'download' };
    },
    downloadAccountFailure(state, error) {
        state.actionStatus = { error: error, type: 'download' };
        console.log('downloadAccountFailure: ' + JSON.stringify(error));
    }
};

export const account = {
    namespaced: true,
    state,
    actions,
    mutations
};