<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div class="jumbotron">
        <totp-modal/>

        <router-link v-if="status.loggedIn && activated && path && path !== '' && path !== '/'" to="/" class="icon-dash-cell">
            <div class="icon-dash-title"><i aria-hidden="true" :class="'icon-dash-app '+messages.label_menu_dashboard_icon" :title="messages.label_menu_dashboard"></i><br/>{{messages.label_menu_dashboard}}</div>
        </router-link>

        <div class="container">
            <div class="row">
                <div class="col-sm-6 offset-sm-2">
                    <div v-if="alert.message" :class="`alert ${alert.type}`">{{alert.message}}</div>
                    <router-view></router-view>
                </div>
            </div>
        </div>
        <div v-if="this.locales && this.locales.length > 1">
            <hr/>
            <button @click="toggleLocaleView()">{{messages.button_label_set_locale}}</button>
            <div v-if="showLocaleSelector">
                <div class="form-group">
                    <label for="locale">{{messages.field_label_locale}}</label>
                    <select @change="updateLocale()" v-model="selectedLocale" name="locale" class="form-control">
                        <option value="detect">{{messages['locale_detect']}}</option>
                        <option v-for="opt in this.locales" v-bind:value="opt">{{messages['locale_'+opt]}}</option>
                    </select>
                    <div v-if="errors.has('locale')" class="invalid-feedback">{{ errors.first('locale') }}</div>
                </div>
            </div>
        </div>
        <div class="bubble-footer">
            <a target="_blank" rel="noopener noreferrer" href="https://getbubblenow.com/">getbubblenow.com</a> |
            <router-link to="/legal">{{messages.title_legal_topics}}</router-link>
            <b v-if="configs.support.site"> | <router-link to="/support">{{messages.title_support}}</router-link></b>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { util } from '../_helpers'

export default {
    name: 'app',
    data() {
        return {
            showLocaleSelector: false,
            selectedLocale: 'detect'
        }
    },
    computed: {
        ...mapState('account', ['status', 'user', 'locale', 'registrationError']),
        ...mapState('system', ['activated', 'configs', 'messages', 'messageGroupsLoaded']),
        ...mapState({
            alert: state => state.alert
        }),
        locales () { return this.configs.locales; },
        path () { return this.$route.path; }
    },
    methods: {
        ...mapActions({ clearAlert: 'alert/clear' }),
        ...mapActions('account', ['setLocale', 'checkSession', 'logout']),
        ...mapActions('system', ['loadIsActivated', 'loadSystemConfigs', 'loadMessages', 'loadTimezones']),
        toggleLocaleView() { this.showLocaleSelector = !this.showLocaleSelector; },
        updateLocale() {
            if (this.selectedLocale) {
                this.setLocale({locale: this.selectedLocale, messages: this.messages, errors: this.errors});
            }
        },
        reloadMessages() {
            if (this.selectedLocale) {
                for (let i = 0; i < this.messageGroupsLoaded.length; i++) {
                    this.loadMessages(this.messageGroupsLoaded[i], this.selectedLocale);
                }
            }
        }
    },
    watch: {
        $route (to, from){
            // clear alert on location change
            this.clearAlert();
        },
        activated (active) {
            if (!active) {
                this.$router.replace('/activate');
            } else {
                const user = util.currentUser();
                if (user !== null && (typeof user.token !== 'undefined' && user.token !== null)) {
                    if (this.status.loggingIn || this.status.loggedIn) {
                        // console.log('activated: this.status.loggingIn='+this.status.loggingIn+', this.status.loggedIn='+this.status.loggedIn+', not checking session');
                    } else {
                        this.checkSession({messages: this.messages, errors: this.errors});
                    }
                }
            }
        },
        user (u) {
            if (typeof u !== 'undefined' && u !== null) {
                this.selectedLocale = u.locale;
                this.reloadMessages();
                this.loadMessages('post_auth', this.selectedLocale);
            }
        },
        locale (loc) {
            this.selectedLocale = loc;
            this.reloadMessages()
        }
    },
    created() {
        const user = util.currentUser();
        this.selectedLocale = (user !== null && typeof user.locale !== 'undefined' && user.locale !== null ? user.locale : 'detect');
        this.loadIsActivated();
        this.loadSystemConfigs();
        this.loadTimezones();

        this.loadMessages('pre_auth', this.selectedLocale);
        this.loadMessages('countries', this.selectedLocale);
        this.loadMessages('timezones', this.selectedLocale);
        if (util.userLoggedIn()) {
            this.loadMessages('post_auth', this.selectedLocale);
            this.loadMessages('apps', this.selectedLocale);
        }
    }
};
</script>