<template>
    <div>
        <em v-if="loading()">{{messages.loading_app_site}}</em>

        <div v-if="app && site">

            <div v-if="appSiteViews && appSiteViews.length > 0">
                <h2>{{messages['app_'+app.name+'_name']}} - {{site.name}} - {{messages.table_title_app_views}}</h2>
                <div>
                    <table border="1">
                        <tbody>
                        <tr v-for="view in appSiteViews">
                            <td nowrap="nowrap">
                                <router-link :to="{ path: '/app/'+ app.name + '/site/' + site.name + '/view/' + view.name }">{{messages['app_'+app.name+'_view_'+view.name]}}</router-link>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../_helpers';

    export default {
        data () {
            return {
                user: util.currentUser(),
                appId: null,
                siteId: null,
                appSiteViews: null
            };
        },
        computed: {
            ...mapState('apps', ['app', 'site']),
            ...mapState('system', ['messages'])
        },
        created () {
            this.appId = this.$route.params.app;
            this.siteId = this.$route.params.site;
            this.getAppByUserId({
                userId: this.user.uuid,
                appId: this.appId,
                messages: this.messages,
                errors: this.errors
            });
            this.getAppSiteByUserId({
                userId: this.user.uuid,
                appId: this.appId,
                siteId: this.siteId,
                messages: this.messages,
                errors: this.errors
            });
        },
        methods: {
            ...mapActions('apps', [
                'getAppByUserId', 'getAppSiteByUserId'
            ]),
            ...mapGetters('apps', ['loading'])
        },
        watch: {
            app (a) {
                if (a && a.dataConfig && a.dataConfig.presentation
                    && (a.dataConfig.presentation === 'site' || a.dataConfig.presentation === 'app_and_site')
                    && a.dataConfig.views && a.dataConfig.views.length && a.dataConfig.views.length > 0) {
                    const allViews = a.dataConfig.views;
                    const appSiteViews = [];
                    for (let i=0; i<allViews.length; i++) {
                        if (allViews[i].presentation && allViews[i].presentation === 'site') {
                            appSiteViews.push(allViews[i]);
                        }
                    }
                    this.appSiteViews = appSiteViews;
                }
            }
        }
    };
</script>