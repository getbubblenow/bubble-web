/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import { deviceService } from '~/_services';
import { util } from '~/_helpers';

const state = {
    loading: {
        devices: false, addDevice: false, removeDevice: false,
        qrCode: false, vpnConf: false, deviceTypes: false
    },
    error: null,
    devices: [],
    device: null,
    deviceTypes: null,
    qrCodeImageBase64: null,
    vpnConfBase64: null
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

    getAllDevicesByUserId({ commit }, {userId, messages, errors}) {
        commit('getDevicesByUserIdRequest');
        deviceService.getAllDevicesByUserId(userId, messages, errors)
            .then(
                devices => commit('getDevicesByUserIdSuccess', devices),
                error => commit('getDevicesByUserIdFailure', error)
            );
    },

    getAllDeviceTypesByUserId({ commit }, {userId, messages, errors}) {
        commit('getAllDeviceTypesByUserIdRequest');
        deviceService.getAllDeviceTypesByUserId(userId, messages, errors)
            .then(
                devices => commit('getAllDeviceTypesByUserIdSuccess', devices),
                error => commit('getAllDeviceTypesByUserIdFailure', error)
            );
    },

    setDeviceSecurityLevel({ commit }, {userId, deviceId, securityLevel, messages, errors}) {
        commit('setDeviceSecurityLevelRequest');
        deviceService.setDeviceSecurityLevel(userId, deviceId, securityLevel, messages, errors)
            .then(
                device => commit('setDeviceSecurityLevelSuccess', device),
                error => commit('setDeviceSecurityLevelFailure', error)
            );
    },

    getDeviceQRcodeById({ commit }, {userId, deviceId, messages, errors}) {
        commit('getDeviceQRcodeByIdRequest');
        deviceService.getDeviceQRcodeById(userId, deviceId, messages, errors)
            .then(
                qrData => commit('getDeviceQRcodeByIdSuccess', qrData),
                error => commit('getDeviceQRcodeByIdFailure', error)
            );
    },

    getDeviceVPNconfById({ commit }, {userId, deviceId, messages, errors}) {
        commit('getDeviceVPNconfByIdRequest');
        deviceService.getDeviceVPNconfById(userId, deviceId, messages, errors)
            .then(
                conf => commit('getDeviceVPNconfByIdSuccess', conf),
                error => commit('getDeviceVPNconfByIdFailure', error)
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
        state.loading.devices = false;
        state.error = error;
    },

    getAllDeviceTypesByUserIdRequest(state) {
        state.loading.deviceTypes = true;
    },
    getAllDeviceTypesByUserIdSuccess(state, deviceTypes) {
        state.loading.deviceTypes = false;
        state.deviceTypes = deviceTypes;
    },
    getAllDeviceTypesByUserIdFailure(state, error) {
        state.loading.deviceTypes = false;
        state.error = error;
    },

    setDeviceSecurityLevelRequest(state) {
        state.loading.setSecurityLevel = true;
    },
    setDeviceSecurityLevelSuccess(state, device) {
        state.loading.setSecurityLevel = false;
    },
    setDeviceSecurityLevelFailure(state, error) {
        state.loading.setSecurityLevel = false;
        state.error = error;
    },

    getDeviceQRcodeByIdRequest(state) {
        state.loading.qrCode = true;
        state.qrCodeImageBase64 = null;
    },
    getDeviceQRcodeByIdSuccess(state, qrCodeImageBase64) {
        state.loading.qrCode = false;
        state.qrCodeImageBase64 = qrCodeImageBase64;
    },
    getDeviceQRcodeByIdFailure(state, error) {
        state.loading.qrCode = false;
        state.error = error;
    },

    getDeviceVPNconfByIdRequest(state) {
        state.loading.vpnConf = true;
        state.vpnConfBase64 = null;
    },
    getDeviceVPNconfByIdSuccess(state, confData) {
        state.loading.vpnConf = false;
        state.vpnConfBase64 = confData;
    },
    getDeviceVPNconfByIdFailure(state, error) {
        state.loading.vpnConf = false;
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
    loading: util.checkLoading(state.loading, 'devices')
};

export const devices = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
