<template>
    <div>
        <em v-if="loading()">{{messages.loading_app}}</em>

        <div v-if="app">
        <h2>{{app.name}} {{messages.table_title_app_sites}}</h2>
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

        <div v-if="app.dataConfig.presentation === 'app' || app.dataConfig.presentation === 'app_and_site'">
            <h2>{{app.name}} {{messages.table_title_app_data}}</h2>
            <div v-if="appData && appData.length > 0">
                <table border="1">
                    <thead>
                    <tr>
                        <th nowrap="nowrap">{{messages.label_field_app_data_key}}</th>
                        <th nowrap="nowrap">{{messages.label_field_app_data_value}}</th>
                        <th nowrap="nowrap">{{messages.label_field_app_data_enabled}}</th>
                        <th><!-- enable/disable button --></th>
                        <th nowrap="nowrap">{{messages.label_field_app_data_expiration}}</th>
                        <th><!-- delete button --></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="datum in appData">
                        <td nowrap="nowrap">{{datum.key}}</td>
                        <td>{{datum.data}}</td>
                        <td>{{messages['message_'+datum.enabled]}}</td>
                        <td v-if="datum.enabled">
                            <button @click="disableAppData(datum.key)">{{messages.button_label_app_data_disable}}</button>
                        </td>
                        <td v-else>
                            <button @click="enableAppData(datum.key)">{{messages.button_label_app_data_enable}}</button>
                        </td>
                        <td nowrap="nowrap">
                            <span v-if="datum.expiration">{{messages.date_format_app_data_expiration.parseDateMessage(datum.expiration, messages)}}</span>
                            <span v-else>{{messages.message_app_data_no_expiration}}</span>
                        </td>
                        <td>
                            <i @click="deleteAppData(datum.key)" aria-hidden="true" :class="messages.button_label_app_data_delete_icon" :title="messages.button_label_app_data_delete"></i>
                            <span class="sr-only">{{messages.button_label_app_data_delete}}</span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="(!appData || appData.length === 0) && !loading()">
                {{messages.message_no_data}}
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
                appId: null
            };
        },
        computed: {
            ...mapState('apps', ['app', 'sites', 'site', 'appData']),
            ...mapState('system', ['messages'])
        },
        created () {
            this.appId = this.$route.params.app;
            this.resetAppData();
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
                'resetAppData', 'getAppByUserId', 'getAppSitesByUserId', 'enableAppSiteByUserId', 'disableAppSiteByUserId',
                'getAppDataByUserId', 'enableAppDataByUserId', 'disableAppDataByUserId', 'deleteAppDataByUserId'
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
            },
            enableAppData (datumId) {
                this.errors.clear();
                this.enableAppDataByUserId({
                    userId: this.user.uuid,
                    appId: this.appId,
                    datumId: datumId,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            disableAppData (datumId) {
                this.errors.clear();
                this.disableAppDataByUserId({
                    userId: this.user.uuid,
                    appId: this.appId,
                    datumId: datumId,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            deleteAppData (datumId) {
                this.errors.clear();
                this.deleteAppDataByUserId({
                    userId: this.user.uuid,
                    appId: this.appId,
                    datumId: datumId,
                    messages: this.messages,
                    errors: this.errors
                });
            }
        },
        watch: {
            app (a) {
                if (a.dataPresentation === 'app' || a.dataPresentation === 'app_and_site') {
                    this.getAppDataByUserId({
                        userId: this.user.uuid,
                        appId: this.appId,
                        messages: this.messages,
                        errors: this.errors
                    });
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