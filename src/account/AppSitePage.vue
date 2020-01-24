<template>
    <div>
        <em v-if="loading()">{{messages.loading_app_site}}</em>

        <div v-if="app && site">
            <div v-if="app && site && app.dataPresentation === 'site' || app.dataPresentation === 'app_and_site'">
                <h2 v-if="app && site">{{app.name}} - {{site.name}} {{messages.table_title_app_site_data}}</h2>
                <div v-if="appData && appData.length > 0">
                    <table border="1">
                        <thead>
                        <tr>
                            <th nowrap="nowrap">{{messages.label_field_app_site_data_key}}</th>
                            <th nowrap="nowrap">{{messages.label_field_app_site_data_value}}</th>
                            <th nowrap="nowrap">{{messages.label_field_app_site_data_enabled}}</th>
                            <th><!-- enable/disable button --></th>
                            <th nowrap="nowrap">{{messages.label_field_app_site_data_expiration}}</th>
                            <th><!-- delete button --></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="datum in appData">
                            <td nowrap="nowrap">{{datum.key}}</td>
                            <td>{{datum.value}}</td>
                            <td>{{messages['message_'+datum.enabled]}}</td>
                            <td v-if="datum.enabled">
                                <button @click="disableAppData(datum.key)">{{messages.button_label_app_site_data_enable}}</button>
                            </td>
                            <td v-else>
                                <button @click="enableAppData(datum.key)">{{messages.button_label_app_site_data_disable}}</button>
                            </td>
                            <td nowrap="nowrap">
                                <span v-if="datum.expiration">{{messages.date_format_app_site_data_expiration.parseDateMessage(datum.expiration, messages)}}</span>
                                <span v-else>{{messages.message_app_site_data_no_expiration}}</span>
                            </td>
                            <td>
                                <i @click="deleteAppData(datum.key)" aria-hidden="true" :class="messages.button_label_app_site_data_delete_icon" :title="messages.button_label_app_site_data_delete"></i>
                                <span class="sr-only">{{messages.button_label_app_site_data_delete}}</span>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="(!appData || appData.length === 0) && !loading()">
                    {{messages.message_no_site_data}}
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
                dataLoaded: false
            };
        },
        computed: {
            ...mapState('apps', ['app', 'site', 'appData']),
            ...mapState('system', ['messages'])
        },
        created () {
            this.appId = this.$route.params.app;
            this.siteId = this.$route.params.site;
            this.resetAppData();
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
                'getAppByUserId', 'getAppSiteByUserId', 'getAppSiteDataByUserId',
                'resetAppData', 'enableAppSiteDataByUserId', 'disableAppSiteDataByUserId', 'deleteAppSiteDataByUserId'
            ]),
            ...mapGetters('apps', ['loading']),
            enableAppData (datumId) {
                this.errors.clear();
                this.dataLoaded = false;
                this.enableAppSiteDataByUserId({
                    userId: this.user.uuid,
                    appId: this.appId,
                    siteId: this.siteId,
                    datumId: datumId,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            disableAppData (datumId) {
                this.errors.clear();
                this.dataLoaded = false;
                this.disableAppSiteDataByUserId({
                    userId: this.user.uuid,
                    appId: this.appId,
                    siteId: this.siteId,
                    datumId: datumId,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            deleteAppData (datumId) {
                this.errors.clear();
                this.dataLoaded = false;
                this.deleteAppSiteDataByUserId({
                    userId: this.user.uuid,
                    appId: this.appId,
                    siteId: this.siteId,
                    datumId: datumId,
                    messages: this.messages,
                    errors: this.errors
                });
            }
        },
        watch: {
            appData (d) {
                console.log('watch.appData: setting dataLoaded = true');
                if (d !== null) this.dataLoaded = true;
            },
            app (a) {
                if (!this.dataLoaded && (a.dataPresentation === 'site' || a.dataPresentation === 'app_and_site')) {
                    console.log('watch.app: loading AppSiteData...');
                    this.getAppSiteDataByUserId({
                        userId: this.user.uuid,
                        appId: this.appId,
                        siteId: this.siteId,
                        messages: this.messages,
                        errors: this.errors
                    });
                }
            },
            site (s) {
                if (!this.dataLoaded && this.app && (this.app.dataPresentation === 'site' || this.app.dataPresentation === 'app_and_site')) {
                    console.log('watch.site: loading AppSiteData...');
                    this.getAppSiteDataByUserId({
                        userId: this.user.uuid,
                        appId: this.appId,
                        siteId: this.siteId,
                        messages: this.messages,
                        errors: this.errors
                    });
                }
            }
        }
    };
</script>