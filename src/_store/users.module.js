import { userService } from '../_services';
import { account } from '../_store/account.module';

const state = {
    all: {},
    user: null,
    policy: {},
    policyStatus: {},
    contact: null,
    authenticator: {}
};

function setAuthenticator(policy) {
    if (policy && policy.accountContacts) {
        const contacts = policy.accountContacts;
        for (let i=0; i<contacts.length; i++) {
            if (contacts[i].type === 'authenticator') {
                state.authenticator = JSON.parse(contacts[i].info);
                return;
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
        state.all = { loading: true };
    },
    getAllSuccess(state, users) {
        state.all = { items: users };
    },
    getAllFailure(state, error) {
        state.all = { error };
    },

    getByUuidRequest(state) {
        state.user = { loading: true };
    },
    getByUuidSuccess(state, user) {
        state.user = user;
    },
    getByUuidFailure(state, error) {
        state.user = { error };
    },

    getPolicyByUuidRequest(state) {
        state.user = { loading: true };
    },
    getPolicyByUuidSuccess(state, policy) {
        state.policy = policy;
        setAuthenticator(policy);
    },
    getPolicyByUuidFailure(state, error) {
        state.policy = { error };
    },

    updatePolicyByUuidRequest(state) {
        state.policyStatus = { updating: true };
    },
    updatePolicyByUuidSuccess(state, policy) {
        state.policyStatus = {};
        state.policy = policy;
        setAuthenticator(policy);
    },
    updatePolicyByUuidFailure(state, error) {
        state.policyStatus = {};
        state.policy = { error };
    },

    addPolicyContactByUuidRequest(state) {
        state.user = { loading: true };
    },
    addPolicyContactByUuidSuccess(state, contact) {
        state.contact = contact;
        if (contact.type === 'authenticator') {
            state.authenticator = JSON.parse(contact.info);
        }
    },
    addPolicyContactByUuidFailure(state, error) {
        state.contact = { error };
    },

    removePolicyContactByUuidRequest(state) {
        state.user = { loading: true };
    },
    removePolicyContactByUuidSuccess(state, policy) {
        state.policy = policy;
    },
    removePolicyContactByUuidFailure(state, error) {
        state.policy = { error };
    },

    updateRequest(state, user) {
        // todo: add 'updating:true' property to user being updated
    },
    updateSuccess(state, user) {
        user.token = account.state.user.token;  // preserve token
        state.user = account.state.user = user;
        localStorage.setItem('user', JSON.stringify(user));
    },
    updateFailure(state, { id, error }) {
        // todo: remove 'updating:true' property and add 'updateError:[error]' property to user
    },

    deleteRequest(state, id) {
        // add 'deleting:true' property to user being deleted
        state.all.items = state.all.items.map(user =>
            user.uuid === id
                ? { ...user, deleting: true }
                : user
        )
    },
    deleteSuccess(state, id) {
        // remove deleted user from state
        state.all.items = state.all.items.filter(user => user.uuid !== id)
    },
    deleteFailure(state, { id, error }) {
        // remove 'deleting:true' property and add 'deleteError:[error]' property to user 
        state.all.items = state.items.map(user => {
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

export const users = {
    namespaced: true,
    state,
    actions,
    mutations
};
