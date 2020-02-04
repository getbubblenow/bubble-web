import { userService } from '../_services';
import { account } from '../_store/account.module';
import { util } from '../_helpers';

const state = {
    loading: {
        users: false, user: false, creating: false, updating: false, deleting: false, changingPassword: false,
        policy: false, updatingPolicy: false, addPolicyContact: false, removePolicyContact: false,
        listSshKeys: false, addSshKey: false, removeSshKey: false
    },
    errors: {},
    users: null,
    user: null,
    policy: {},
    contact: null,
    authenticator: {},
    sshKey: null,
    sshKeys: [],
    changePasswordResponse: null
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
    searchAccounts({ commit }, {query, messages, errors}) {
        commit('searchAccountsRequest');
        userService.searchAccounts(query, messages, errors)
            .then(
                users => commit('searchAccountsSuccess', users),
                error => commit('searchAccountsFailure', error)
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

    createUser({ commit }, {user, messages, errors}) {
        commit('createUserRequest', user);
        userService.createUser(user, messages, errors)
            .then(
                user => commit('createUserSuccess', user),
                error => commit('createUserFailure', { user, error: error.toString() })
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

    updateSelf({ commit }, {user, messages, errors}) {
        commit('updateSelfRequest', user);
        userService.updateUser(user, messages, errors)
            .then(
                user => commit('updateSelfSuccess', user),
                error => commit('updateSelfFailure', { user, error: error.toString() })
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

    addSshKeyByUserId({ commit }, {userId, sshKey, messages, errors}) {
        commit('addSshKeyByUserIdRequest');
        userService.addSshKeyByUserId(userId, sshKey, messages, errors)
            .then(
                key => commit('addSshKeyByUserIdSuccess', key),
                error => commit('addSshKeyByUserIdFailure', error)
            );
    },

    removeSshKeyByUserId({ commit }, {userId, sshKeyId, messages, errors}) {
        commit('removeSshKeyByUserIdRequest');
        userService.removeSshKeyByUserId(userId, sshKeyId, messages, errors)
            .then(
                ok => commit('removeSshKeyByUserIdSuccess', sshKeyId),
                error => commit('removeSshKeyByUserIdFailure', error)
            );
    },

    listSshKeysByUserId({ commit }, {userId, messages, errors}) {
        commit('listSshKeysByUserIdRequest');
        userService.listSshKeysByUserId(userId, messages, errors)
            .then(
                sshKeys => commit('listSshKeysByUserIdSuccess', sshKeys),
                error => commit('listSshKeysByUserIdFailure', error)
            );
    },

    deleteUser({ commit }, {userId, messages, errors}) {
        commit('deleteRequest', userId);
        userService.deleteUser(userId, messages, errors)
            .then(
                id => commit('deleteSuccess', id),
                error => commit('deleteFailure', { userId, error: error.toString() })
            );
    },

    changePassword({ commit }, {request, messages, errors}) {
        commit('changePasswordRequest', request);
        userService.changePasswordUser(request, messages, errors)
            .then(
                response => commit('changePasswordSuccess', response),
                error => commit('changePasswordFailure', { error: error.toString() })
            );
    },

    adminChangePassword({ commit }, {userId, request, messages, errors}) {
        commit('changePasswordRequest', userId);
        userService.adminChangePassword(userId, request, messages, errors)
            .then(
                id => commit('changePasswordSuccess', id),
                error => commit('changePasswordFailure', { error: error.toString() })
            );
    }

};

const mutations = {
    searchAccountsRequest(state) {
        state.loading.users = true;
    },
    searchAccountsSuccess(state, users) {
        state.loading.users = false;
        state.users = users;
    },
    searchAccountsFailure(state, error) {
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
        state.errors.policy = { error };
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

    createUserRequest(state, user) {
        state.loading.creating = true;
    },
    createUserSuccess(state, user) {
        state.loading.creating = false;
        state.user = user;
    },
    createUserFailure(state, { id, error }) {
        state.loading.creating = false;
        state.errors.create = error;
    },

    updateUserRequest(state, user) {
        state.loading.updating = true;
    },
    updateUserSuccess(state, user) {
        state.loading.updating = false;
        state.user = user;
    },
    updateUserFailure(state, { id, error }) {
        state.loading.updating = false;
        state.errors.update = error;
    },

    updateSelfRequest(state, user) {
        state.loading.updating = true;
    },
    updateSelfSuccess(state, user) {
        state.loading.updating = false;
        user.token = account.state.user.token;  // preserve token
        state.user = account.state.user = user;
        localStorage.setItem(util.USER_KEY, JSON.stringify(user));
    },
    updateSelfFailure(state, { id, error }) {
        state.loading.updating = false;
        state.errors.update = error;
    },

    addSshKeyByUserIdRequest(state) {
        state.loading.addSshKey = true;
    },
    addSshKeyByUserIdSuccess(state, sshKey) {
        state.loading.addSshKey = false;
        state.sshKey = sshKey;
        state.sshKeys.push(sshKey);
    },
    addSshKeyByUserIdFailure(state, error) {
        state.loading.addSshKey = false;
        state.errors.sshKey = error;
    },

    removeSshKeyByUserIdRequest(state) {
        state.loading.removeSshKey = true;
    },
    removeSshKeyByUserIdSuccess(state, sshKeyId) {
        state.loading.removeSshKey = false;
        state.sshKey = null;
        state.sshKeys = state.sshKeys.filter(function(k) { return k.uuid !== sshKeyId; })
    },
    removeSshKeyByUserIdFailure(state, error) {
        state.loading.removeSshKey = false;
        state.errors.sshKey = error;
    },

    listSshKeysByUserIdRequest(state) {
        state.loading.listSshKeys = true;
    },
    listSshKeysByUserIdSuccess(state, sshKeys) {
        state.loading.listSshKeys = false;
        state.sshKeys = sshKeys;
    },
    listSshKeysByUserIdFailure(state, error) {
        state.loading.listSshKeys = false;
        state.errors.sshKey = error;
    },

    deleteRequest(state, id) {
        // todo: use proper delete API
        // add 'deleting:true' property to user being deleted
        state.loading.deleting = true;
    },
    deleteSuccess(state, id) {
        state.loading.deleting = false;
        state.users = [];
    },
    deleteFailure(state, { id, error }) {
        state.loading.deleting = false;
        state.errors.deleteUser = error;
    },

    changePasswordRequest(state, id) {
        state.loading.changingPassword = true;
    },
    changePasswordSuccess(state, response) {
        state.loading.changingPassword = false;
        state.changePasswordResponse = response;
    },
    changePasswordFailure(state, { error }) {
        state.loading.deleting = false;
        state.errors.changePassword = error;
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
