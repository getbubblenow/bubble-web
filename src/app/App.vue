<template>
    <div class="jumbotron">
        <totp-modal/>
        <sidebar-menu :hide-toggle="true" :menu="menu" v-if="status.loggedIn"/>
        <div class="container">
            <div class="row">
                <div class="col-sm-6 offset-sm-3">
                    <div v-if="alert.message" :class="`alert ${alert.type}`">{{alert.message}}</div>
                    <router-view></router-view>
                </div>
            </div>
        </div>
        <div>
            <hr/>
            <button @click="toggleLocaleView()">{{messages.button_label_set_locale}}</button>
            <div v-if="showLocaleSelector">
                <div class="form-group">
                    <label for="locale">{{messages.field_label_locale}}</label>
                    <select @change="updateLocale()"  v-if="this.locales && this.locales.length > 0" v-model="selectedLocale" name="locale" class="form-control">
                        <option value="detect">{{messages['locale_detect']}}</option>
                        <option v-for="opt in this.locales" v-bind:value="opt">{{messages['locale_'+opt]}}</option>
                    </select>
                    <div v-if="errors.has('locale')" class="invalid-feedback">{{ errors.first('locale') }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
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
        ...mapState('system', ['activated', 'configs', 'messages', 'messageGroupsLoaded', 'menu']),
        ...mapGetters('system', ['menu']),
        ...mapState({
            alert: state => state.alert
        }),
        locales () { return this.configs.locales; }
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
            if (!active) this.$router.replace('/activate');
        },
        user (u) {
            if (typeof u !== 'undefined' && u !== null) {
                this.selectedLocale = u.locale;
                this.reloadMessages();
            }
        },
        locale (loc) {
            this.selectedLocale = loc;
            this.reloadMessages()
        }
    },
    created() {
        const user = util.currentUser();
        if (user !== null && (typeof user.token !== 'undefined' && user.token !== null)) {
            this.checkSession({messages: this.messages, errors: this.errors});
        }
        this.selectedLocale = (user !== null && typeof user.locale !== 'undefined' && user.locale !== null ? user.locale : 'detect');
        this.loadIsActivated();
        this.loadSystemConfigs();  // determine if we can show the registration link
        this.loadTimezones();

        this.loadMessages('pre_auth', this.selectedLocale);
        this.loadMessages('countries', this.selectedLocale);
        this.loadMessages('timezones', this.selectedLocale);
    }
};
</script>