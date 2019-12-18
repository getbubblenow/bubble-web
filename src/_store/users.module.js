import { userService } from '../_services';
import { account } from '../_store/account.module';

const state = {
    all: {},
    user: null,
    policy: {},
    policyStatus: {}
};

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

        userService.updatePolicyById(uuid, contact, messages, errors)
            .then(
                policy => commit('addPolicyContactByUuidSuccess', policy),
                error => commit('addPolicyContactByUuidFailure', error)
            );
    },

    removePolicyContactByTypeAndInfo({ commit }, {uuid, type, info, messages, errors}) {
        commit('removePolicyContactByTypeAndInfoRequest');

        userService.removePolicyContactByTypeAndInfo(uuid, type, info, messages, errors)
            .then(
                policy => commit('removePolicyContactByTypeAndInfoSuccess', policy),
                error => commit('removePolicyContactByTypeAndInfoFailure', error)
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
    },
    updatePolicyByUuidFailure(state, error) {
        state.policyStatus = {};
        state.policy = { error };
    },

    addPolicyContactByUuidRequest(state) {
        state.user = { loading: true };
    },
    addPolicyContactByUuidSuccess(state, policy) {
        state.policy = policy;
    },
    addPolicyContactByUuidFailure(state, error) {
        state.policy = { error };
    },

    removePolicyContactByTypeAndInfoRequest(state) {
        state.user = { loading: true };
    },
    removePolicyContactByTypeAndInfoSuccess(state, policy) {
        state.policy = policy;
    },
    removePolicyContactByTypeAndInfoFailure(state, error) {
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
