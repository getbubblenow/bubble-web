import { systemService, userService } from '../_services';
import { account } from "./account.module";
import { router } from "../_helpers";

const state = {
    configs: {
        allowRegistration: false,
        paymentsEnabled: false,
        sageLauncher: false,
        cloudDrivers: [],
        entityClasses: [],
        locales: ['en_US']
    },
    status: { activating: false },
    activated: null,
    error: null,
    messages: {
        durationToMillis: function(count, units) {
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
    contactTypes: []
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
    activate({ commit }, activation) {
        commit('activateRequest');
        systemService.activate(activation)
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
    }
};

const getters = {
    menu: function () {
        const configs = state.configs;
        const messages = state.messages;
        const menu = [{
            href: '/',
            title: messages.label_menu_dashboard,
            icon: messages.label_menu_dashboard_icon
        }, {
            href: '/me',
            title: messages.label_menu_account,
            icon: messages.label_menu_account_icon
        }, {
            href: '/notifications',
            title: messages.label_menu_notifications,
            icon: messages.label_menu_notifications_icon
        }, {
            href: '/logout',
            title: messages.label_menu_logout,
            icon: messages.label_menu_logout_icon
        }];
        if (configs.sageLauncher) {
            menu.splice(3, 0, {
                href: '/me/networks',
                title: messages.label_menu_networks,
                icon: messages.label_menu_networks_icon
            });
        }
        if (configs.paymentsEnabled) {
            menu.splice(4, 0,{
                href: '/me/bills',
                title: messages.label_menu_bills,
                icon: messages.label_menu_bills_icon
            });
        }
        if (account.state.user.admin === true) {
            const admin_menu = {
                href: '/admin',
                title: messages.label_menu_admin,
                icon: messages.label_menu_admin_icon,
                child: [{
                    href: '/admin/users',
                    title: messages.label_menu_admin_users,
                    icon: messages.label_menu_admin_users_icon
                }, {
                    href: '/admin/model',
                    title: messages.label_menu_admin_model,
                    icon: messages.label_menu_admin_model_icon
                }]
            };
            menu.splice(1, 0, admin_menu);
            if (configs.sageLauncher)  {
                admin_menu.child.push({
                    href: '/admin/networks',
                    title: messages.label_menu_admin_networks,
                    icon: messages.label_menu_admin_networks_icon
                });
            }
            if (configs.paymentsEnabled) {
                admin_menu.child.push({
                    href: '/admin/bills',
                    title: messages.label_menu_admin_bills,
                    icon: messages.label_menu_admin_bills_icon
                });
            }
        }
        return menu;
    }
};

const messageNotFoundHandler = {
    get: function (target, name) {
        if (typeof name === 'undefined') return '???undefined';
        if (name === null) return '???null';
        if (name === '') return '???empty';
        if (target.hasOwnProperty(name)) return target[name];
        const altName = name.toString().replace(/\./g, '_');
        if (target.hasOwnProperty(altName)) return target[altName];
        return '???'+name.toString();
    }
};

const mutations = {
    loadIsActivatedRequest(state) {},
    loadIsActivatedSuccess(state, activated) {
        state.activated = activated;
    },
    loadIsActivatedFailure(state, error) {
        state.errors.activated = error;
    },

    activateRequest(state) {
        state.status.activating = true;
    },
    activateSuccess(state, admin) {
        state.status.activating = false;
        state.activated = true;
        state.user = admin;
        state.status = { loggedIn: (admin !== null) };
        localStorage.setItem('user', JSON.stringify(admin));
    },
    activateFailure(state, error) {
        state.status.activating = false;
        state.errors.activated = error;
    },

    loadSystemConfigsRequest(state) {},
    loadSystemConfigsSuccess(state, configs) {
        state.configs = configs;
    },
    loadSystemConfigsFailure(state, error) {
        state.error = error;
    },
    loadMessagesRequest(state) {},
    loadMessagesSuccess(state, {group, messages}) {
        if (state.messageGroupsLoaded.indexOf(group) === -1) state.messageGroupsLoaded.push(group);
        state.messages = new Proxy(Object.assign({}, state.messages, messages), messageNotFoundHandler);
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
        state.detectedLocale = state.locales[0];
    },
    detectLocaleFailure(state, error) {
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
