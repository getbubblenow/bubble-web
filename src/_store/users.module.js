import { userService } from '../_services';
import { account } from '../_store/account.module';
import { util } from '../_helpers';

const state = {
    loading: {
        users: false, user: false, updating: false, deleting: false,
        policy: false, updatingPolicy: false, addPolicyContact: false, removePolicyContact: false
    },
    errors: {},
    users: null,
    user: null,
    policy: {},
    contact: null,
    authenticator: {}
};

export const CONTACT_TYPE_AUTHENTICATOR = 'authenticator';
export function isAuthenticator (val) {
    return val === CONTACT_TYPE_AUTHENTICATOR || (val != null && typeof val.type !== 'undefined' && val.type === CONTACT_TYPE_AUTHENTICATOR);
}
export function isNotAuthenticator (val) { return !isAuthenticator(val); }

const LOCALSTORAGE_AUTHENTICATOR = 'authenticator';

function setAuthenticator(policy) {
    const storedAuthJson = localStorage.getItem(LOCALSTORAGE_AUTHENTICATOR);
    const storedAuth = storedAuthJson !== null ? JSON.parse(storedAuthJson) : null;
    if (policy && policy.accountContacts) {
        const contacts = policy.accountContacts;
        for (let i=0; i<contacts.length; i++) {
            if (isAuthenticator(contacts[i])) {
                const newAuth = JSON.parse(contacts[i].info);
                if (newAuth.masked) {
                    if (storedAuth != null) {
                        state.authenticator = contacts[i].info = storedAuth;
                        return;
                    } else {
                        contacts[i].masked = true;
                    }
                } else {
                    state.authenticator = contacts[i].info = storedAuth;
                    localStorage.setItem(LOCALSTORAGE_AUTHENTICATOR, JSON.stringify(state.authenticator));
                }
            }
        }
    }
    state.authenticator = {};
    return state.authenticator;
}

const actions = {
    getAllUsers({ commit }, {messages, errors}) {
        commit('getAllUsersRequest');
        userService.getAllUsers(messages, errors)
            .then(
                users => commit('getAllUsersSuccess', users),
                error => commit('getAllUsersFailure', error)
            );
    },

    getUserById({ commit }, {userId, messages, errors}) {
        commit('getUserByIdRequest');
        userService.getUserById(userId, messages, errors)
            .then(
                users => commit('getUserByIdSuccess', users),
                error => commit('getUserByIdFailure', error)
            );
    },

    updateUser({ commit }, {user, messages, errors}) {
        commit('updateUserRequest', user);
        userService.updateUser(user, messages, errors)
            .then(
                user => commit('updateUserSuccess', user),
                error => commit('updateUserFailure', { user, error: error.toString() })
            );
    },

    getPolicyByUserId({ commit }, {userId, messages, errors}) {
        commit('getPolicyByUserIdRequest');
        userService.getPolicyByUserId(userId, messages, errors)
            .then(
                policy => commit('getPolicyByUserIdSuccess', policy),
                error => commit('getPolicyByUserIdFailure', error)
            );
    },

    updatePolicyByUserId({ commit }, {userId, policy, messages, errors}) {
        commit('updatePolicyByUserIdRequest');
        userService.updatePolicyByUserId(userId, policy, messages, errors)
            .then(
                policy => commit('updatePolicyByUserIdSuccess', policy),
                error => commit('updatePolicyByUserIdFailure', error)
            );
    },

    addPolicyContactByUserId({ commit }, {userId, contact, messages, errors}) {
        commit('addPolicyContactByUserIdRequest');
        userService.addPolicyContactById(userId, contact, messages, errors)
            .then(
                contact => commit('addPolicyContactByUserIdSuccess', contact),
                error => commit('addPolicyContactByUserIdFailure', error)
            );
    },

    removePolicyContactByUserId({ commit }, {userId, contactUuid, messages, errors}) {
        commit('removePolicyContactByUserIdRequest');
        userService.removePolicyContactByUserId(userId, contactUuid, messages, errors)
            .then(
                policy => commit('removePolicyContactByUserIdSuccess', policy),
                error => commit('removePolicyContactByUserIdFailure', error)
            );
    },

    delete({ commit }, {userId, messages, errors}) {
        commit('deleteRequest', userId);
        userService.deleteUser(userId, messages, errors)
            .then(
                id => commit('deleteSuccess', id),
                error => commit('deleteFailure', { id, error: error.toString() })
            );
    }
};

const mutations = {
    getAllUsersRequest(state) {
        state.loading.users = true;
    },
    getAllUsersSuccess(state, users) {
        state.loading.users = false;
        state.users = users;
    },
    getAllUsersFailure(state, error) {
        state.loading.users = false;
        state.errors.all = error;
    },

    getUserByIdRequest(state) {
        state.loading.user = true;
    },
    getUserByIdSuccess(state, user) {
        state.loading.user = false;
        state.user = user;
    },
    getUserByIdFailure(state, error) {
        state.loading.user = false;
        state.errors.user = error;
    },

    getPolicyByUserIdRequest(state) {
        state.loading.policy = true;
        state.user = { loading: true };
    },
    getPolicyByUserIdSuccess(state, policy) {
        state.loading.policy = false;
        state.policy = policy;
        setAuthenticator(policy);
    },
    getPolicyByUserIdFailure(state, error) {
        state.loading.policy = false;
        state.errors.policy = error;
    },

    updatePolicyByUserIdRequest(state) {
        state.loading.updatingPolicy = true;
    },
    updatePolicyByUserIdSuccess(state, policy) {
        state.loading.updatingPolicy = false;
        state.policy = policy;
        setAuthenticator(policy);
    },
    updatePolicyByUserIdFailure(state, error) {
        state.loading.updatingPolicy = false;
        state.policy = { error };
    },

    addPolicyContactByUserIdRequest(state) {
        state.loading.addPolicyContact = true;
    },
    addPolicyContactByUserIdSuccess(state, contact) {
        state.loading.addPolicyContact = false;
        state.contact = contact;
        if (isAuthenticator(contact)) {
            state.authenticator = JSON.parse(contact.info);
            localStorage.setItem(LOCALSTORAGE_AUTHENTICATOR, JSON.stringify(state.authenticator));
        }
    },
    addPolicyContactByUserIdFailure(state, error) {
        state.loading.addPolicyContact = false;
        state.errors.contact = error;
    },

    removePolicyContactByUserIdRequest(state) {
        state.loading.removePolicyContact = true;
    },
    removePolicyContactByUserIdSuccess(state, policy) {
        state.loading.removePolicyContact = false;
        state.policy = policy;
    },
    removePolicyContactByUserIdFailure(state, error) {
        state.loading.removePolicyContact = false;
        state.errors.policy = error;
    },

    updateUserRequest(state, user) {
        state.loading.updating = true;
    },
    updateUserSuccess(state, user) {
        state.loading.updating = false;
        user.token = account.state.user.token;  // preserve token
        state.user = account.state.user = user;
        localStorage.setItem('user', JSON.stringify(user));
    },
    updateUserFailure(state, { id, error }) {
        state.loading.updating = false;
        state.errors.update = error;
    },

    deleteRequest(state, id) {
        // todo: use proper delete API
        // add 'deleting:true' property to user being deleted
        state.loading.deleting = true;
        state.users = state.users.map(user =>
            user.uuid === id
                ? { ...user, deleting: true }
                : user
        )
    },
    deleteSuccess(state, id) {
        state.loading.deleting = false;
        // remove deleted user from state
        state.users = state.users.filter(user => user.uuid !== id)
    },
    deleteFailure(state, { id, error }) {
        state.loading.deleting = false;
        // remove 'deleting:true' property and add 'deleteError:[error]' property to user 
        state.users = state.users.map(user => {
            if (user.uuid === id) {
                // make copy of user without 'deleting:true' property
                const { deleting, ...userCopy } = user;
                // return copy of user with 'deleteError:[error]' property
                return { ...userCopy, deleteError: error };
            }

            return user;
        })
    }
};

const getters = {
    loading: util.checkLoading(state.loading)
};

export const users = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
