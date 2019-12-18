import { userService } from '../_services';
import { router } from '../_helpers';

// todo: why can't we import currentUser from api-util and use that here?
// when I try to do that, webpack succeeds but then an error occurs loading any page, with the
// error message "_helpers.currentUser is not defined"
const user = JSON.parse(localStorage.getItem('user'));
const state = user
    ? { status: { loggedIn: true }, user }
    : { status: {}, user: null };

const actions = {
    login({ dispatch, commit }, { user, messages, errors }) {
        commit('loginRequest', { name: user.name });
        userService.login(user.name, user.password, messages, errors)
            .then(
                user => {
                    commit('loginSuccess', user);
                    router.push('/');
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
                        dispatch('alert/success', 'Profile update was successful', { root: true });
                    })
                },
                error => {
                    commit('updateFailure', error);
                    dispatch('alert/error', error, { root: true });
                }
            );
    }
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
    }
};

export const account = {
    namespaced: true,
    state,
    actions,
    mutations
};