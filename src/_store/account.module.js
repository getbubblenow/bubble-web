import { userService } from '../_services';
import { router, getLandingPage, resetLandingPage } from '../_helpers';

// todo: why can't we import currentUser from api-util and use that here?
// when I try to do that, webpack succeeds but then an error occurs loading any page, with the
// error message "_helpers.currentUser is not defined"
const user = JSON.parse(localStorage.getItem('user'));
const state = user
    ? { status: { loggedIn: true }, user, actionStatus: {} }
    : { status: {}, user: null, actionStatus: {} };

const actions = {
    login({ dispatch, commit }, { user, messages, errors }) {
        commit('loginRequest', { name: user.name });
        userService.login(user.name, user.password, messages, errors)
            .then(
                user => {
                    commit('loginSuccess', user);
                    const landing = getLandingPage();
                    if (landing === null) {
                        router.push('/');
                    } else {
                        resetLandingPage();
                        router.push(landing.fullPath);
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

};

const mutations = {
    loginRequest(state, user) {
        state.status = { loggingIn: true };
        state.user = user;
    },
    loginSuccess(state, user) {
        state.status = { loggedIn: true };
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
    }

};

export const account = {
    namespaced: true,
    state,
    actions,
    mutations
};