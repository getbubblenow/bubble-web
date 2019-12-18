import { userService } from '../_services';
import { account } from '../_store/account.module';

const state = {
    all: {},
    user: null
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
    updateRequest(state, user) {
        // todo: add 'updating:true' property to user being updated
    },
    updateSuccess(state, user) {
        // todo: why doesn't this work?
        user.token = account.user.token;  // preserve token
        state.user = account.user = user;
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
