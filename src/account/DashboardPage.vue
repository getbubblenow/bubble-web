<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <table width="100%">
        <tr>
            <td width="100%" v-if="dashApps && dashApps.length > 0">
                <router-link :to="app.href" v-for="app in dashApps" class="icon-dash-cell">
                    <div class="icon-dash-title"><i aria-hidden="true" :class="'icon-dash-app '+app.icon" :title="app.title"></i><br/>{{app.title}}</div>
                </router-link>
            </td>
        </tr>
    </table>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '~/_helpers';

    export default {
        computed: {
            ...mapState({
                account: state => state.account,
                users: state => state.users.all
            }),
            ...mapState('account', ['locale']),
            ...mapState('system', ['messages', 'detectedTimezone', 'detectedLocale', 'configs']),
            ...mapGetters('system', ['dashboardApps']),
            queryApp () {
                if (typeof this.$route.query.app !== 'undefined' && this.$route.query.app !== null && this.$route.query.app !== '') {
                    return this.$route.query.app;
                }
                return null;
            },
            dashApps () {
                let appView = this.dashboardApps;
                const qApp = this.queryApp;
                if (qApp !== null) {
                    const appPath = this.$route.query.app;
                    for (let i=0; i<appView.length; i++) {
                        const app = appView[i];
                        if (app.href === '/?app='+appPath) {
                            appView = app.apps;
                            break;
                        }
                    }
                }
                return appView;
            }
        },
        methods: {
            ...mapActions('system', ['loadMessages', 'loadTimezones', 'detectTimezone', 'detectLocale'])
        },
        created () {
            this.loadMessages('post_auth', this.locale);
            this.loadMessages('apps', this.locale);
            this.detectLocale();
            this.detectTimezone();
        }
    };
</script>