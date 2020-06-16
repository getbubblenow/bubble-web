<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div>
        {{messages.message_authenticating_app_login}}
    </div>
</template>

<script>
    import { mapState, mapGetters, mapActions } from 'vuex'
    import { util } from '../_helpers'

    export default {
        computed: {
            ...mapState('account', {
                currentUser: state => state.user
            }),
            ...mapState('users', ['user']),
            ...mapState('system', ['messages']),
        },
        created () {
            let locale = null;
            if (util.userLoggedIn() && util.currentUser().locale) locale = util.currentUser().locale;
            this.loadMessages('pre_auth', locale === null ? 'detect' : locale);

            let session = this.$route.query.session;
            let uri = this.$route.query.uri;
            if (!this.$route.query.hasOwnProperty('session') || typeof session === 'undefined' || session === null) {
                console.warn('AppLoginPage.created: session parameter is empty, sending to login page');
                if (util.userLoggedIn()) {
                    this.logout({messages: this.messages, errors: this.errors});
                }
                this.$router.replace('/login');
                return;
            }

            if  (typeof uri === 'undefined' || uri === null || (uri.length > 0 && uri[0] !== '/')) {
                console.warn('AppLoginPage.created: uri parameter is not empty, sending to login page');
                this.$router.replace('/login');
                return;
            }

            let user = util.currentUser();
            if (user !== null && session !== user.token) {
                this.logout({messages: this.messages, errors: this.errors});
            }

            if (uri.startsWith('/appLogin')) {
                uri = '/';
            }
            localStorage.setItem(util.USER_KEY, JSON.stringify(user));
            this.appLogin({session: session, uri: uri, messages: this.messages, errors: this.errors});
        },
        methods: {
            ...mapActions('account', ['login', 'logout', 'appLogin']),
            ...mapActions('system', ['loadSystemConfigs', 'loadMessages']),
        }
    };
</script>