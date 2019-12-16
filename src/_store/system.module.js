import { systemService } from '../_services';

const state = {
    configs: {
        allowRegistration: null,
        paymentsEnabled: true
    },
    messages: {},
    countries: [],
    locales: [],
    timezones: [],
    detectedTimezone: null,
    menu: [],
    error: null
};

const actions = {
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
            timezones => commit('detectTimezoneSuccess', timezones),
            error => commit('detectTimezoneFailure', error)
        )
    }
};

const mutations = {
    loadSystemConfigsRequest(state) {},
    loadSystemConfigsSuccess(state, configs) {
        state.configs = configs;
    },
    loadSystemConfigsFailure(state, error) {
        state.error = error;
    },
    loadMessagesRequest(state) {},
    loadMessagesSuccess(state, {group, messages}) {
        // console.log('loadMessages (group='+group+'), messages='+JSON.stringify(messages));
        state.messages = Object.assign({}, state.messages, messages);
        state.menu = [{
            href: '/',
            title: messages.label_menu_dashboard,
            icon: messages.label_menu_dashboard_icon
        }, {
            href: '/profile',
            title: messages.label_menu_account,
            icon: messages.label_menu_account_icon,
            child: [{
                href: '/profile/policy',
                title: messages.label_menu_account_policy,
                icon: messages.label_menu_account_policy_icon
            }, {
                href: '/profile/contacts',
                title: messages.label_menu_account_contacts,
                icon: messages.label_menu_account_contacts_icon
            }]
        }, {
            href: '/me/networks',
            title: messages.label_menu_networks,
            icon: messages.label_menu_networks_icon
        }, {
            href: '/logout',
            title: messages.label_menu_logout,
            icon: messages.label_menu_logout_icon
        }];
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
    }
};

export const system = {
    namespaced: true,
    state,
    actions,
    mutations
};
