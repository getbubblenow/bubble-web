<template>
    <div>
        <h3 v-if="app">{{messages['app_'+app.name+'_config_view_'+viewId]}}</h3>

        <div v-if="loading()">
            {{messages.loading_app_config_data}}
        </div>
        <div v-else-if="appConfigData && appConfigData.length && appConfigData.length > 0 && configView">

            <!-- table of results -->
        <table border="1" v-if="appConfigData instanceof Array">
            <thead>
            <tr>
                <th v-for="field in configView.fields">
                    {{messages['app_'+app.name+'_config_field_'+field]}}
                </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="row in appConfigData">
                <td v-for="field in configView.fields" nowrap="nowrap">
                    <span v-if="field === 'expiration'">
                        <span v-if="row[field] !== null && row[field] > 0">{{messages.date_format_app_data_expiration.parseDateMessage(row[field], messages)}}</span>
                        <span v-else>{{messages.message_app_data_no_expiration}}</span>
                    </span>
                    <span v-else-if="typeof appFields[field] !== 'undefined' && typeof appFields[field].customFormat !== 'undefined' && appFields[field].customFormat === true">
                        {{messages['app_'+app.name+'_view_'+viewId+'_'+field+'_format'].parseDateMessage(row[field], messages)}}
                    </span>
                    <span v-else-if="field === 'ctime' || field === 'mtime'">
                        {{messages.date_format_app_data_epoch_time.parseDateMessage(row[field], messages)}}
                    </span>
                    <span v-else-if="(''+row[field]).length < 30">
                        <span v-if="typeof appFields[field] !== 'undefined' && typeof appFields[field].type !== 'undefined' && appFields[field].type === 'http_url'">
                            <a :href="row[field]" target="_blank">{{row[field]}}</a>
                        </span>
                        <span v-else>
                            {{row[field]}}
                        </span>
                    </span>
                    <span v-else>
                        <span v-if="typeof appFields[field] !== 'undefined' && typeof appFields[field].type !== 'undefined' && appFields[field].type === 'http_url'">
                            <a :href="row[field]" target="_blank">{{(''+row[field]).substring(0, 30)}}...</a>
                        </span>
                        <span v-else>
                            {{(''+row[field]).substring(0, 30)}}...
                        </span>
                    </span>
                </td>
            </tr>
            </tbody>

        </table>

            <!-- single item view -->
        <table border="1" v-else>

        </table>

        </div>
        <div v-else>
            {{messages.message_no_config_data}}
        </div>

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex'
    import { util } from '../_helpers';
    import { safeEval } from '../_store';

    export default {
        data () {
            return {
                user: util.currentUser(),
                appId: null,
                viewId: null,
                appFields: null,
                configView: null
            };
        },
        computed: {
            ...mapState('apps', ['app', 'appConfigData', 'actionResult']),
            ...mapState('system', ['messages'])
        },
        created () {
            this.appId = this.$route.params.app;
            this.viewId = this.$route.params.view;
            this.getAppByUserId({
                userId: this.user.uuid,
                appId: this.appId,
                messages: this.messages,
                errors: this.errors
            });
            this.getAppConfigViewByUserId({
                userId: this.user.uuid,
                appId: this.appId,
                viewId: this.viewId,
                messages: this.messages,
                errors: this.errors
            });
        },
        methods: {
            ...mapActions('apps', [
                'getAppByUserId', 'getAppConfigViewByUserId'
            ]),
            ...mapGetters('apps', ['loading']),
        },
        watch: {
            app (a) {
                if (a) {
                    const configFields = a.dataConfig.configFields;
                    const appFields = {};
                    for (let i=0; i<configFields.length; i++) {
                        appFields[configFields[i].name] = configFields[i];
                    }
                    this.appFields = appFields;

                    const allConfigViews = a.dataConfig.configViews;
                    for (let i=0; i<allConfigViews.length; i++) {
                        if (allConfigViews[i].name === this.viewId) {
                            this.configView = allConfigViews[i];
                            return;
                        }
                    }
                    console.warn('config view not found: '+this.viewId);
                }
            },
            appConfigData (configData) {
                if (configData) {

                }
            }
        }
    };
</script>