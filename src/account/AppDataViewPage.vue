<template>
    <div>

        <table v-if="app && viewDetails && viewDetails.fields && viewDetails.fields.length && viewDetails.fields.length > 0" border="1">
            <thead>
            <tr>
                <th v-for="field in viewDetails.fields">{{messages['app_'+app.name+'_field_'+field]}}</th>
            </tr>
            </thead>
            <tbody v-if="appData && appData.results && appData.results.length && appData.results.length > 0">
            <tr v-for="row in appData.results">
                <td v-for="field in viewDetails.fields">
                    <span v-if="field === 'expiration'">
                        <span v-if="row[field.name] !== null && row[field.name] > 0">{{messages.date_format_app_data_expiration.parseDateMessage(row[field.name], messages)}}</span>
                        <span v-else>{{messages.message_app_data_no_expiration}}</span>
                    </span>
                    <span v-else-if="field === 'ctime' || field === 'mtime'">
                        {{messages.date_format_app_data_epoch_time.parseDateMessage(row[field.name], messages)}}
                    </span>
                    <span v-else>{{row[field.name]}}</span>
                </td>
            </tr>
            <tr>
                <td align="left">
                    <span v-if="this.pageNumber > 1">{{messages.message_app_data_previous_page}}</span>
                </td>
                <td align="right">
                    <span v-if="hasNextPage()">{{messages.message_app_data_next_page}}</span>
                </td>
            </tr>
            </tbody>
            <tbody v-else>
            <tr>
                <td :colspan="getTotalColumns()">{{messages.message_no_data}}</td>
            </tr>
            </tbody>
        </table>

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex'

    export default {
        data () {
            return {
                user: util.currentUser(),
                appId: null,
                siteId: null,
                viewId: null,
                viewDetails: null,
                query: {
                    pageNumber: 1,
                    pageSize: 5
                }
            };
        },
        computed: {
            ...mapState('apps', ['app', 'site', 'appData']),
            ...mapState('system', ['messages'])
        },
        created () {
            this.appId = this.$route.params.app;
            this.siteId = this.$route.params.site;
            this.viewId = this.$route.params.view;
            this.getAppByUserId({
                userId: this.user.uuid,
                appId: this.appId,
                messages: this.messages,
                errors: this.errors
            });
            if (this.siteId) {
                this.getAppSiteByUserId({
                    userId: this.user.uuid,
                    appId: this.appId,
                    siteId: this.siteId,
                    messages: this.messages,
                    errors: this.errors
                });
            }
        },
        methods: {
            ...mapActions('apps', [
                'getAppByUserId', 'getAppSiteByUserId', 'getAppDataByUserId', 'getAppSiteDataByUserId'
            ]),
            ...mapGetters('apps', ['loading']),
            hasNextPage () {
                return this.appData.totalCount && (this.appData.totalCount > (this.pageNumber * this.pageSize));
            },
            getTotalColumns () {
                let cols = this.viewDetails.fields.length;
                if (this.viewDetails.actions && this.viewDetails.actions.length) cols += this.viewDetails.actions.length;
                return cols;
            }
        },
        watch: {
            app (a) {
                if (a && a.dataConfig && a.dataConfig.views && a.dataConfig.views.length && a.dataConfig.views.length > 0) {
                    const allViews = a.dataConfig.views;
                    for (let i=0; i<allViews.length; i++) {
                        if (allViews[i].name === this.viewId) {
                            this.viewDetails = allViews[i];
                            if (this.siteId) {
                                this.getAppSiteDataByUserId({
                                    userId: this.user.name,
                                    appId: this.appId,
                                    siteId: this.siteId,
                                    viewId: this.viewId,
                                    query: this.query,
                                    messages: this.messages,
                                    errors: this.errors
                                });
                            } else {
                                this.getAppDataByUserId({
                                    userId: this.user.name,
                                    appId: this.appId,
                                    siteId: this.siteId,
                                    viewId: this.viewId,
                                    query: this.query,
                                    messages: this.messages,
                                    errors: this.errors
                                });
                            }
                            return;
                        }
                    }
                    console.warn('watch.app: view not found: '+this.viewId);
                }
            }
        }
    };
</script>