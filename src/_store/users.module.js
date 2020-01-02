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
    getAll({ commit }, {messages, errors}) {
        commit('getAllRequest');
        userService.getAll(messages, errors)
            .then(
                users => commit('getAllSuccess', users),
                error => commit('getAllFailure', error)
            );
    },

    getByUuid({ commit }, {uuid, messages, errors}) {
        commit('getByUuidRequest');
        userService.getById(uuid, messages, errors)
            .then(
                users => commit('getByUuidSuccess', users),
                error => commit('getByUuidFailure', error)
            );
    },

    update({ commit }, {user, messages, errors}) {
        commit('updateRequest', user);
        userService.update(user, messages, errors)
            .then(
                user => commit('updateSuccess', user),
                error => commit('updateFailure', { user, error: error.toString() })
            );
    },

    getPolicyByUuid({ commit }, {uuid, messages, errors}) {
        commit('getPolicyByUuidRequest');
        userService.getPolicyById(uuid, messages, errors)
            .then(
                policy => commit('getPolicyByUuidSuccess', policy),
                error => commit('getPolicyByUuidFailure', error)
            );
    },

    updatePolicyByUuid({ commit }, {uuid, policy, messages, errors}) {
        commit('updatePolicyByUuidRequest');
        userService.updatePolicyById(uuid, policy, messages, errors)
            .then(
                policy => commit('updatePolicyByUuidSuccess', policy),
                error => commit('updatePolicyByUuidFailure', error)
            );
    },

    addPolicyContactByUuid({ commit }, {uuid, contact, messages, errors}) {
        commit('addPolicyContactByUuidRequest');
        userService.addPolicyContactById(uuid, contact, messages, errors)
            .then(
                contact => commit('addPolicyContactByUuidSuccess', contact),
                error => commit('addPolicyContactByUuidFailure', error)
            );
    },

    removePolicyContactByUuid({ commit }, {uuid, contactUuid, messages, errors}) {
        commit('removePolicyContactByUuidRequest');
        userService.removePolicyContactByUuid(uuid, contactUuid, messages, errors)
            .then(
                policy => commit('removePolicyContactByUuidSuccess', policy),
                error => commit('removePolicyContactByUuidFailure', error)
            );
    },

    delete({ commit }, {id, messages, errors}) {
        commit('deleteRequest', id);
        userService.delete(id, messages, errors)
            .then(
                id => commit('deleteSuccess', id),
                error => commit('deleteFailure', { id, error: error.toString() })
            );
    }
};

const mutations = {
    getAllRequest(state) {
        state.loading.users = true;
    },
    getAllSuccess(state, users) {
        state.loading.users = false;
        state.users = users;
    },
    getAllFailure(state, error) {
        state.loading.users = false;
        state.errors.all = error;
    },

    getByUuidRequest(state) {
        state.loading.user = true;
    },
    getByUuidSuccess(state, user) {
        state.loading.user = false;
        state.user = user;
    },
    getByUuidFailure(state, error) {
        state.loading.user = false;
        state.errors.user = error;
    },

    getPolicyByUuidRequest(state) {
        state.loading.policy = true;
        state.user = { loading: true };
    },
    getPolicyByUuidSuccess(state, policy) {
        state.loading.policy = false;
        state.policy = policy;
        setAuthenticator(policy);
    },
    getPolicyByUuidFailure(state, error) {
        state.loading.policy = false;
        state.errors.policy = error;
    },

    updatePolicyByUuidRequest(state) {
        state.loading.updatingPolicy = true;
    },
    updatePolicyByUuidSuccess(state, policy) {
        state.loading.updatingPolicy = false;
        state.policy = policy;
        setAuthenticator(policy);
    },
    updatePolicyByUuidFailure(state, error) {
        state.loading.updatingPolicy = false;
        state.policy = { error };
    },

    addPolicyContactByUuidRequest(state) {
        state.loading.addPolicyContact = true;
    },
    addPolicyContactByUuidSuccess(state, contact) {
        state.loading.addPolicyContact = false;
        state.contact = contact;
        if (isAuthenticator(contact)) {
            state.authenticator = JSON.parse(contact.info);
            localStorage.setItem(LOCALSTORAGE_AUTHENTICATOR, JSON.stringify(state.authenticator));
        }
    },
    addPolicyContactByUuidFailure(state, error) {
        state.loading.addPolicyContact = false;
        state.errors.contact = error;
    },

    removePolicyContactByUuidRequest(state) {
        state.loading.removePolicyContact = true;
    },
    removePolicyContactByUuidSuccess(state, policy) {
        state.loading.removePolicyContact = false;
        state.policy = policy;
    },
    removePolicyContactByUuidFailure(state, error) {
        state.loading.removePolicyContact = false;
        state.errors.policy = error;
    },

    updateRequest(state, user) {
        state.loading.updating = true;
    },
    updateSuccess(state, user) {
        state.loading.updating = false;
        user.token = account.state.user.token;  // preserve token
        state.user = account.state.user = user;
        localStorage.setItem('user', JSON.stringify(user));
    },
    updateFailure(state, { id, error }) {
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
