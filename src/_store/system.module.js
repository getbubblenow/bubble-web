/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import { systemService } from '../_services';
import { account } from "./account.module";
import { router, util } from "../_helpers";

const state = {
    configs: {
        networkUuid: null,
        allowRegistration: false,
        paymentsEnabled: false,
        sageLauncher: false,
        bubbleNode: null,
        entityClasses: [],
        locales: ['en_US'],
        cloudConfigs: {},
        sslPort: null,
        locked: null,
        launchLock: null,
        promoCodePolicy: null,
        requireSendMetrics: null,
        isWaitingRestoring: false,
        support: {},
        securityLevels: null
    },
    entityConfigs: {},
    searchResults: [],
    status: { activating: false, searching: false, creatingEntity: false, modelSetupInProgress: false },
    activated: null,
    error: null,
    messages: {
        durationToMillis: function(count, units) {
            if (typeof count === 'undefined' || count === null || count === '') return null;
            return parseInt(count) * parseInt(state.messages['time_duration_'+units+'_factor']);
        },
        millisToDuration: function (ms) {
            const durations = state.timeDurationOptionsReversed;
            for (let i=0; i<durations.length; i++) {
                const durationMillis = parseInt(state.messages['time_duration_'+durations[i]+'_factor']);
                if (ms >= durationMillis && ((ms % durationMillis) === 0 || i === durations.length-1)) {
                    return {count: parseInt(ms) / durationMillis, units: durations[i]};
                }
            }
            return {count: parseInt(ms), units: ''};
        }
    },
    messageGroupsLoaded: [],
    countries: [],
    locales: [],
    timezones: [],
    detectedTimezone: null,
    detectedLocale: null,
    accountDeletionOptions: [],
    timeDurationOptions: [],
    timeDurationOptionsReversed: [],
    contactTypes: [],
    appLinks: null
};

const actions = {
    loadIsActivated({ commit }) {
        commit('loadIsActivatedRequest');
        systemService.loadIsActivated()
            .then(
                activated => commit('loadIsActivatedSuccess', activated),
                error => commit('loadIsActivatedFailure', error)
            );
    },
    activate({ commit }, {activation, messages, errors}) {
        commit('activateRequest');
        systemService.activate(activation, messages, errors)
            .then(
                admin => {
                    commit('activateSuccess', admin);
                    router.replace('/');
                },
                error => commit('activateFailure', error)
            );
    },

    loadSystemConfigs({ commit }) {
        commit('loadSystemConfigsRequest');
        systemService.loadSystemConfigs()
            .then(
                configs => commit('loadSystemConfigsSuccess', configs),
                error => commit('loadSystemConfigsFailure', error)
            );
    },
    loadEntityConfigs({ commit }) {
        commit('loadEntityConfigsRequest');
        systemService.loadEntityConfigs()
            .then(
                configs => commit('loadEntityConfigsSuccess', configs),
                error => commit('loadEntityConfigsFailure', error)
            );
    },
    search({ commit }, type, query) {
        commit('searchRequest');
        systemService.search(type, query)
            .then(
                results => commit('searchSuccess', {type, query, results}),
                error => commit('searchFailure', error)
            );
    },
    createEntity({ commit }, {entityConfig, json, messages, errors}) {
        commit('createEntityRequest');
        systemService.createEntity(entityConfig, json, messages, errors)
            .then(
                entity => commit('createEntitySuccess', entity),
                error => commit('createEntityFailure', error)
            );
    },
    modelSetup({ commit }, {file, messages, errors}) {
        commit('modelSetupRequest');
        systemService.modelSetup(file, messages, errors)
            .then(
                ok => commit('modelSetupSuccess'),
                errors => commit('modelSetupFailure', errors)
            );
    },
    loadMessages({ commit }, group, locale) {
        commit('loadMessagesRequest');
        systemService.loadMessages(group, locale)
            .then(
                messages => commit('loadMessagesSuccess', {group, messages}),
                error => commit('loadMessagesFailure', error)
            );
    },
    loadTimezones({ commit }) {
        commit('loadTimezonesRequest');
        systemService.loadTimezones().then(
            timezones => commit('loadTimezonesSuccess', timezones),
            error => commit('loadTimezonesFailure', error)
        )
    },
    detectTimezone({ commit }) {
        commit('detectTimezoneRequest');
        systemService.detectTimezone().then(
            timezone => commit('detectTimezoneSuccess', timezone),
            error => commit('detectTimezoneFailure', error)
        )
    },
    detectLocale({ commit }) {
        commit('detectLocaleRequest');
        systemService.detectLocale().then(
            locales => commit('detectLocaleSuccess', locales),
            error => commit('detectLocaleFailure', error)
        )
    },
    getAppLinks({ commit }, locale) {
        commit('getAppLinksRequest');
        systemService.getAppLinks(locale).then(
            links => commit('getAppLinksSuccess', links),
            error => commit('getAppLinksFailure', error)
        )
    }
};

const getters = {
    dashboardApps: function () {
        const configs = state.configs;
        const messages = state.messages;
        const isAdmin = account.state.user !== null && account.state.user.admin === true;
        const dashApps = [];
        dashApps.push({
            href: '/me',
            title: messages.label_menu_account,
            icon: messages.label_menu_account_icon,
            index: 0
        });
        if (configs.sageLauncher) {
            dashApps.push({
                href: '/bubbles',
                title: messages.label_menu_networks,
                icon: messages.label_menu_networks_icon,
                index: 1
            });
        } else {
            if (isAdmin) {
                dashApps.push({
                    href: '/bubble/' + configs.networkUuid,
                    title: messages.label_menu_network,
                    icon: messages.label_menu_networks_icon,
                    index: 1
                });
            }
            dashApps.push({
                href: '/devices',
                title: messages.label_menu_devices,
                icon: messages.label_menu_devices_icon,
                index: 2
            });
            dashApps.push({
                href: '/apps',
                title: messages.label_menu_apps,
                icon: messages.label_menu_apps_icon,
                index: 3
            });
        }
        if (isAdmin && configs.sageLauncher) {
            const adminApps = [{
                href: '/',
                title: messages.label_menu_dashboard,
                icon: messages.label_menu_dashboard_icon,
                index: 0
            }];
            adminApps.push({
                href: '/admin/accounts',
                title: messages.label_menu_admin_users,
                icon: messages.label_menu_admin_users_icon,
                index: 1
            });
            adminApps.push({
                href: '/admin/model',
                title: messages.label_menu_admin_model,
                icon: messages.label_menu_admin_model_icon,
                index: 2
            });
            adminApps.push({
                href: '/admin/bubbles',
                title: messages.label_menu_admin_networks,
                icon: messages.label_menu_admin_networks_icon,
                index: 3
            });
            if (configs.paymentsEnabled) {
                adminApps.push({
                    href: '/admin/bills',
                    title: messages.label_menu_admin_bills,
                    icon: messages.label_menu_admin_bills_icon,
                    index: 4
                });
            }
            dashApps.push({
                href: '/?app=admin',
                title: messages.label_menu_admin,
                icon: messages.label_menu_admin_icon,
                index: 4,
                apps: adminApps
            });
        } else if (isAdmin) {
            dashApps.push({
                href: '/admin/accounts',
                title: messages.label_menu_admin_users,
                icon: messages.label_menu_admin_users_icon,
                index: 4
            });
        }
        dashApps.push({
            href: '/logout',
            title: messages.label_menu_logout,
            icon: messages.label_menu_logout_icon,
            index: 1000
        });
        return dashApps;
    },
    promoCodesEnabled: function () { return state.promoCodePolicy === 'required' || state.promoCodePolicy === 'optional'; },
    promoCodeRequired: function () { return state.promoCodePolicy === 'required'; }
};

const mutations = {
    loadIsActivatedRequest(state) {},
    loadIsActivatedSuccess(state, activated) {
        state.activated = activated;
    },
    loadIsActivatedFailure(state, error) {
        state.error = error;
    },

    activateRequest(state) {
        state.status.activating = true;
    },
    activateSuccess(state, admin) {
        state.status.activating = false;
        state.activated = true;
        state.user = admin;
        state.status = { loggedIn: (admin !== null) };
        localStorage.setItem(util.USER_KEY, JSON.stringify(admin));
    },
    activateFailure(state, error) {
        state.status.activating = false;
        state.error = error;
    },

    loadSystemConfigsRequest(state) {},
    loadSystemConfigsSuccess(state, configs) {
        state.configs = configs;
    },
    loadSystemConfigsFailure(state, error) {
        state.error = error;
    },
    loadEntityConfigsRequest(state) {},
    loadEntityConfigsSuccess(state, configs) {
        // console.log('loadEntityConfigsSuccess: received configs='+JSON.stringify(configs));
        const newConfigs = {};
        for (let i=0; i<configs.length; i++) {
            for (let j=0; j<configs[i].names.length; j++) {
                newConfigs[configs[i].names[j]] = configs[i].entityConfig;
            }
        }
        state.entityConfigs = newConfigs;
    },
    loadEntityConfigsFailure(state, error) {
        state.error = error;
    },
    searchRequest(state) {
        state.status.searching = true;
    },
    searchSuccess(state, {type, query, results}) {
        state.status.searching = false;
        state.searchResults = results;
    },
    searchFailure(state, error) {
        state.status.searching = false;
        state.error = error;
    },
    createEntityRequest(state) {
        state.status.creatingEntity = true;
    },
    createEntitySuccess(state, {entity}) {
        state.status.creatingEntity = false;
    },
    createEntityFailure(state, error) {
        state.status.creatingEntity = false;
        state.error = error;
    },
    modelSetupRequest(state) {
        state.status.modelSetupInProgress = true;
    },
    modelSetupSuccess(state) {
        state.status.modelSetupInProgress = false;
    },
    modelSetupFailure(state, errors) {
        state.status.modelSetupInProgress = false;
        state.error = errors;
    },
    loadMessagesRequest(state) {},
    loadMessagesSuccess(state, {group, messages}) {
        if (state.messageGroupsLoaded.indexOf(group) === -1) state.messageGroupsLoaded.push(group);
        state.messages = util.addMessages(state.messages, messages);
        if (messages.country_codes) {
            const countries = [];
            const codes = messages.country_codes.split(',');
            for (let i=0; i<codes.length; i++) {
                countries.push({code: codes[i], countryName: messages['country_'+codes[i]]});
            }
            state.countries = countries;
        }
        if (messages.locale_codes) {
            const locales = [];
            const codes = messages.locale_codes.split(',');
            for (let i=0; i<codes.length; i++) {
                locales.push({localeCode: codes[i], localeName: messages['locale_'+codes[i]]});
            }
            state.locales = locales;
        }
        if (messages.field_label_policy_account_deletion_options) {
            state.accountDeletionOptions = messages.field_label_policy_account_deletion_options.split(',');
        }
        if (messages.time_duration_options) {
            state.timeDurationOptions = messages.time_duration_options.split(',');
            state.timeDurationOptionsReversed = state.timeDurationOptions.slice().reverse();
        }
        if (messages.field_label_policy_contact_type_options) {
            state.contactTypes = messages.field_label_policy_contact_type_options.split(',');
        }
    },
    loadMessagesFailure(state, error) {
        state.error = error;
    },
    loadTimezonesRequest(state) {},
    loadTimezonesSuccess(state, timezones) {
        state.timezones = timezones;
    },
    loadTimezonesFailure(state, error) {
        state.error = error;
    },
    detectTimezoneRequest(state) {},
    detectTimezoneSuccess(state, detectedTimezone) {
        state.detectedTimezone = detectedTimezone;
    },
    detectTimezoneFailure(state, error) {
        state.error = error;
    },
    detectLocaleRequest(state) {},
    detectLocaleSuccess(state, detectedLocales) {
        if (detectedLocales.length) {
            for (let i=0; i<detectedLocales.length; i++) {
                if (state.locales.indexOf(detectedLocales[i])) {
                    state.detectedLocale = detectedLocales[i];
                    return;
                }
            }
        }
        console.warn('detectLocaleSuccess: server detected locales '+JSON.stringify(detectedLocales)+' but none were found in locales list: '+JSON.stringify(state.locales));

        // keep current value, or assign default if no current value
        if (state.detectedLocale === null && state.locales && state.locales.length > 0) state.detectedLocale = state.locales[0];
    },
    detectLocaleFailure(state, error) {
        state.error = error;

        // keep current value, or assign default if no current value
        if (state.detectedLocale === null && state.locales && state.locales.length > 0) state.detectedLocale = state.locales[0];
    },

    getAppLinksRequest(state) {},
    getAppLinksSuccess(state, links) {
        state.appLinks = links;
    },
    getAppLinksFailure(state, error) {
        state.error = error;
    }
};

export const system = {
    namespaced: true,
    getters,
    state,
    actions,
    mutations
};
