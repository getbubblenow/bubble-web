<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://bubblev.com/bubble-license/ -->
<template>
    <div>
        <em v-if="loading()">{{messages.loading_app}}</em>

        <div v-if="app">
        <h2>{{messages['app_'+app.name+'_name']}} {{messages.table_title_app_sites}}</h2>
        <div v-if="sites && sites.length > 0">
            <table border="1">
                <thead>
                <tr>
                    <th nowrap="nowrap">{{messages.label_field_app_site_name}}</th>
                    <th nowrap="nowrap">{{messages.label_field_app_site_url}}</th>
                    <th nowrap="nowrap">{{messages.label_field_app_site_description}}</th>
                    <th nowrap="nowrap">{{messages.label_field_app_site_enabled}}</th>
                    <th><!-- control button --></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="site in sites">
                    <td nowrap="nowrap" v-if="app.dataConfig.presentation === 'site' || app.dataConfig.presentation === 'app_and_site'">
                        <router-link :to="{ path: '/app/'+ appId + '/site/' + site.name }">{{site.name}}</router-link>
                    </td>
                    <td v-else>{{site.name}}</td>

                    <td v-if="isValidUrl(site.url)"><a :href="site.url">{{formatUrl(site.url)}}</a></td>
                    <td v-else-if="isWildcardUrl(site.url)">{{messages.message_app_site_url_wildcard}}</td>
                    <td v-else>{{site.url}}</td>

                    <td>{{site.description}}</td>
                    <td>{{messages['message_'+site.enabled]}}</td>
                    <td v-if="site.enabled">
                        <button @click="disableAppSite(site.name)">{{messages.button_label_app_site_disable}}</button>
                    </td>
                    <td v-else>
                        <button @click="enableAppSite(site.name)">{{messages.button_label_app_site_enable}}</button>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>

        <div v-if="!sites || sites.length === 0">
            {{messages.message_no_sites}}
        </div>

        <div v-if="appViews && appViews.length > 0">
            <h2>{{messages['app_'+app.name+'_name']}} {{messages.table_title_app_views}}</h2>
            <div>
                <table border="1">
                    <tbody>
                    <tr v-for="view in appViews">
                        <td nowrap="nowrap">
                            <router-link :to="{ path: '/app/'+ app.name + '/view/' + view.name }">{{messages['app_'+app.name+'_view_'+view.name]}}</router-link>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="typeof appConfigViews !== 'undefined' && appConfigViews !== null && appConfigViews.length > 0">
            <h2>{{messages['app_'+app.name+'_name']}} {{messages.table_title_app_config_views}}</h2>
            <div>
                <table border="1">
                    <tbody>
                    <tr v-for="view in appConfigViews">
                        <td nowrap="nowrap">
                            <router-link :to="{ path: '/app/'+ app.name + '/config/' + view.name }">{{messages['app_'+app.name+'_config_view_'+view.name]}}</router-link>
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
                appViews: null,
                appConfigViews: null
            };
        },
        computed: {
            ...mapState('apps', ['app', 'sites', 'site']),
            ...mapState('system', ['messages'])
        },
        created () {
            this.appId = this.$route.params.app;
            this.getAppByUserId({
                userId: this.user.uuid,
                appId: this.appId,
                messages: this.messages,
                errors: this.errors
            });
            this.getAppSitesByUserId({
                userId: this.user.uuid,
                appId: this.appId,
                messages: this.messages,
                errors: this.errors
            });
        },
        methods: {
            ...mapActions('apps', [
                'getAppByUserId', 'getAppSitesByUserId', 'enableAppSiteByUserId', 'disableAppSiteByUserId'
            ]),
            ...mapGetters('apps', ['loading']),
            formatUrl (url) {
                return util.stripProtocolFromUrl(url);
            },
            isValidUrl (url) { return url.startsWith('http://') || url.startsWith('https://'); },
            isWildcardUrl (url) { return url === '*'; },
            enableAppSite (siteId) {
                this.errors.clear();
                this.enableAppSiteByUserId({
                    userId: this.user.uuid,
                    appId: this.appId,
                    siteId: siteId,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            disableAppSite (siteId) {
                this.errors.clear();
                this.disableAppSiteByUserId({
                    userId: this.user.uuid,
                    appId: this.appId,
                    siteId: siteId,
                    messages: this.messages,
                    errors: this.errors
                });
            }
        },
        watch: {
            app (a) {
                if (a && a.dataConfig && a.dataConfig.presentation
                        && (a.dataConfig.presentation === 'app' || a.dataConfig.presentation === 'app_and_site')
                        && a.dataConfig.views && a.dataConfig.views.length && a.dataConfig.views.length > 0) {
                    const allViews = a.dataConfig.views;
                    const appViews = [];
                    for (let i=0; i<allViews.length; i++) {
                        if (allViews[i].presentation && allViews[i].presentation === 'app') {
                            appViews.push(allViews[i]);
                        }
                    }
                    this.appViews = appViews;

                    if (a.dataConfig.configViews) {
                        const allConfigViews = a.dataConfig.configViews;
                        const appConfigViews = [];
                        for (let i=0; i<allConfigViews.length; i++) {
                            if (typeof allConfigViews[i].root !== 'undefined' && allConfigViews[i].root !== null && allConfigViews[i].root === true) {
                                appConfigViews.push(allConfigViews[i]);
                            }
                        }
                        this.appConfigViews = appConfigViews;
                    }
                }
            },
            site (s) {
                this.getAppSitesByUserId({
                    userId: this.user.uuid,
                    appId: this.appId,
                    messages: this.messages,
                    errors: this.errors
                });
            }
        }
    };
</script>