import { deviceService } from '../_services';
import { util } from '../_helpers';

const state = {
    loading: {
        devices: false, addDevice: false, removeDevice: false
    },
    error: null,
    devices: [],
    device: null
};

const actions = {
    getDevicesByUserId({ commit }, {userId, messages, errors}) {
        commit('getDevicesByUserIdRequest');
        deviceService.getDevicesByUserId(userId, messages, errors)
            .then(
                devices => commit('getDevicesByUserIdSuccess', devices),
                error => commit('getDevicesByUserIdFailure', error)
            );
    },

    addDeviceByUserId({ commit }, {userId, device, messages, errors}) {
        commit('addDeviceByUserIdRequest');
        deviceService.addDeviceByUserId(userId, device, messages, errors)
            .then(
                device => commit('addDeviceByUserIdSuccess', device),
                error => commit('addDeviceByUserIdFailure', error)
            );
    },

    removeDeviceByUserId({ commit }, {userId, deviceId, messages, errors}) {
        commit('removeDeviceByUserIdRequest', deviceId);
        deviceService.removeDeviceByUserId(userId, deviceId, messages, errors)
            .then(
                ok => commit('removeDeviceByUserIdSuccess', deviceId),
                error => commit('removeDeviceByUserIdFailure', error)
            );
    }
};

const mutations = {
    getDevicesByUserIdRequest(state) {
        state.loading.devices = true;
    },
    getDevicesByUserIdSuccess(state, devices) {
        state.loading.devices = false;
        state.devices = devices;
    },
    getDevicesByUserIdFailure(state, error) {
        state.loading.users = false;
        state.error = error;
    },

    addDeviceByUserIdRequest(state) {
        state.loading.addDevice = true;
    },
    addDeviceByUserIdSuccess(state, device) {
        state.loading.addDevice = false;
        state.devices.push(device);
        state.device = device;
    },
    addDeviceByUserIdFailure(state, error) {
        state.loading.addDevice = false;
        state.error = error;
    },

    removeDeviceByUserIdRequest(state, deviceId) {
        state.loading.removeDevice = true;
    },
    removeDeviceByUserIdSuccess(state, deviceId) {
        state.loading.removeDevice = false;
        state.devices = state.devices.filter(function(d) { return d.uuid !== deviceId; });
    },
    removeDeviceByUserIdFailure(state, error) {
        state.loading.removeDevice = false;
        state.error = error;
    }
};

const getters = {
    loading: util.checkLoading(state.loading)
};

export const devices = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
