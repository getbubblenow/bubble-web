import { userService } from '../_services';
import { router, getLandingPage, resetLandingPage } from '../_helpers';

// todo: why can't we import currentUser from api-util and use that here?
// when I try to do that, webpack succeeds but then an error occurs loading any page, with the
// error message "_helpers.currentUser is not defined"
const user = JSON.parse(localStorage.getItem('user'));
const state = {
    status: { loggedIn: (user !== null) },
    user: user,
    actionStatus: {}
};

const actions = {
    refreshUser({ commit }) {
        commit('refreshUser', JSON.parse(localStorage.getItem('user')));
    },
    login({ dispatch, commit }, { user, messages, errors }) {
        commit('loginRequest', { name: user.name });
        userService.login(user.name, user.password, messages, errors)
            .then(
                user => {
                    commit('loginSuccess', user);
                    if (user.token) {
                        const landing = getLandingPage();
                        if (landing === null) {
                            router.replace('/');
                        } else {
                            resetLandingPage();
                            router.replace(landing.fullPath);
                        }
                    } else if (user.multifactorAuth) {
                        router.replace('/auth');
                    }
                },
                error => {
                    commit('loginFailure', error);
                    dispatch('alert/error', error, { root: true });
                }
            );
    },
    logout({ commit }) {
        userService.logout();
        commit('logout');
    },
    register({ dispatch, commit }, {user, messages, errors}) {
        commit('registerRequest', user);
        userService.register(user, messages, errors)
            .then(
                user => {
                    commit('registerSuccess', user);
                    router.push('/');
                    setTimeout(() => {
                        // display success message after route change completes
                        dispatch('alert/success', messages.alert_registration_success, { root: true });
                    })
                },
                error => {
                    commit('registerFailure');
                    dispatch('alert/error', error, { root: true });
                }
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

    approveAction({ commit }, {uuid, code, messages, errors}) {
        commit('approveActionRequest');
        userService.approveAction(uuid, code, messages, errors)
            .then(
                policy => commit('approveActionSuccess', policy),
                error => commit('approveActionFailure', error)
            );
    },
    denyAction({ commit }, {uuid, code, messages, errors}) {
        commit('denyActionRequest');
        userService.denyAction(uuid, code, messages, errors)
            .then(
                policy => commit('denyActionSuccess', policy),
                error => commit('denyActionFailure', error)
            );
    },
    sendAuthenticatorCode({ commit }, {uuid, code, verifyOnly, messages, errors}) {
        commit('sendAuthenticatorCodeRequest');
        userService.sendAuthenticatorCode(uuid, code, verifyOnly, messages, errors)
            .then(
                user => commit('sendAuthenticatorCodeSuccess', user),
                error => commit('sendAuthenticatorCodeFailure', error)
            );
    },
    resendVerificationCode({ dispatch, commit }, {uuid, contact, messages, errors}) {
        commit('resendVerificationCodeRequest');
        userService.resendVerificationCode(uuid, contact, messages, errors)
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
    }
};

const mutations = {
    refreshUser(state, user) {
        state.user = user;
    },
    loginRequest(state, user) {
        state.status = { loggingIn: true };
        state.user = user;
    },
    loginSuccess(state, user) {
        if (user.token) {
            state.status = { loggedIn: true };
        } else if (user.multifactorAuth) {
            state.status = { multifactorAuth: true };
        } else {
            state.status = {};
        }
        localStorage.setItem('user', JSON.stringify(user));
        state.user = user;
    },
    loginFailure(state) {
        state.status = {};
        state.user = null;
    },

    logout(state) {
        state.status = {};
        state.user = null;
    },

    registerRequest(state, user) {
        state.status = { registering: true };
        state.user = user;
    },
    registerSuccess(state, user) {
        state.status = {};
        state.user = user;
    },
    registerFailure(state) {
        state.status = {};
    },

    approveActionRequest(state) {
        state.actionStatus = { requesting: true, type: 'approve' };
    },
    approveActionSuccess(state, user) {
        state.actionStatus = { success: true, type: 'approve', result: user };
        if (user.token) state.user = user;
    },
    approveActionFailure(state, error) {
        state.actionStatus = { error: error, type: 'approve' };
    },
    denyActionRequest(state) {
        state.actionStatus = { requesting: true, type: 'deny' };
    },
    denyActionSuccess(state, denial) {
        state.actionStatus = { success: true, type: 'deny', result: denial };
        state.denial = denial;
    },
    denyActionFailure(state, error) {
        state.actionStatus = { error: error, type: 'deny' };
    },
    sendAuthenticatorCodeRequest(state) {
        state.actionStatus = { requesting: true, type: 'approve' };
    },
    sendAuthenticatorCodeSuccess(state, user) {
        console.log("sendAuthenticatorCodeSuccess: user="+JSON.stringify(user));
        state.actionStatus = { success: true, type: 'approve', result: user };
        if (user.token) {
            state.user = user;
        } else if (user.multifactorAuth) {
            state.user.multifactorAuth = user.multifactorAuth;
            localStorage.setItem('user', JSON.stringify(user));
        }
    },
    sendAuthenticatorCodeFailure(state, error) {
        state.actionStatus = { error: error, type: 'approve' };
    },

    resendVerificationCodeRequest(state) {
        state.actionStatus = { requesting: true, type: 'verify' };
    },
    resendVerificationCodeSuccess(state, policy) {
        console.log("resendVerificationCodeSuccess: policy="+JSON.stringify(policy));
        state.actionStatus = { success: true, type: 'verify', result: policy };
    },
    resendVerificationCodeFailure(state, error) {
        state.actionStatus = { error: error, type: 'verify' };
    }
};

export const account = {
    namespaced: true,
    state,
    actions,
    mutations
};