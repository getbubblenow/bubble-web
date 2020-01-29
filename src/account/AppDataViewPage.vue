<template>
    <div>

        <table v-if="app && app.dataConfig && app.dataConfig.params && app.dataConfig.params.length && app.dataConfig.params.length > 0">
            <tr v-for="param in app.dataConfig.params">
                <td>{{messages['app_'+app.name+'_param_'+param.name]}}: </td>
                <td v-if="param.name === 'device'">
                    <select v-model="paramValues[param.name]" v-if="devices">
                        <option value="">{{messages.option_all_devices}}</option>
                        <option v-for="device in devices" :value="device.uuid">{{device.name}}</option>
                    </select>
                </td>
                <td v-else>
                    <input type="text" v-model="paramValues[param.name]" width="40"/>
                </td>
            </tr>
            <tr>
                <button @click="refreshData()">{{messages.button_label_app_data_refresh}}</button>
            </tr>
        </table>

        <table v-if="app && app.dataConfig && app.dataConfig.fields && app.dataConfig.fields.length && app.dataConfig.fields.length > 0" border="1">
            <thead>
            <tr>
                <th v-for="field in app.dataConfig.fields">{{messages['app_'+app.name+'_field_'+field.name]}}</th>
                <th v-if="app.dataConfig.actions && app.dataConfig.actions.length && app.dataConfig.actions.length > 0">{{messages.message_data_actions}}</th>
            </tr>
            </thead>
            <tbody v-if="appData && appData.results && appData.results.length && appData.results.length > 0">
            <tr v-for="row in appData.results">
                <td v-for="field in app.dataConfig.fields" nowrap="nowrap">
                    <span v-if="field.name === 'expiration'">
                        <span v-if="row[field.name] !== null && row[field.name] > 0">{{messages.date_format_app_data_expiration.parseDateMessage(row[field.name], messages)}}</span>
                        <span v-else>{{messages.message_app_data_no_expiration}}</span>
                    </span>
                    <span v-else-if="typeof field.customFormat !== 'undefined' && field.customFormat === true">
                        {{messages['app_'+app.name+'_view_'+viewId+'_'+field.name+'_format'].parseDateMessage(row[field.name], messages)}}
                    </span>
                    <span v-else-if="field.name === 'ctime' || field.name === 'mtime'">
                        {{messages.date_format_app_data_epoch_time.parseDateMessage(row[field.name], messages)}}
                    </span>
                    <span v-else>{{row[field.name]}}</span>
                </td>
                <td v-if="app.dataConfig.actions && app.dataConfig.actions.length && app.dataConfig.actions.length > 0">
                    <div v-for="action in app.dataConfig.actions">
                        <button v-if="actionIsAvailable(action, row)" @click="dataAction(action, row.uuid)">{{messages['app_'+app.name+'_action_'+action.name]}}</button>
                    </div>
                </td>
            </tr>
            <tr>
                <td :colspan="totalColumns">{{messages.message_data_results.parseMessage(this)}}</td>
            </tr>
            <tr v-if="hasPrevPage() || hasNextPage()">
                <td align="left" v-if="hasPrevPage()" nowrap="nowrap">
                    <button @click="prevPage()">{{messages.message_app_data_previous_page}}</button>
                </td>
                <td align="right" v-if="hasNextPage()" nowrap="nowrap">
                    <button @click="nextPage()">{{messages.message_app_data_next_page}}</button>
                </td>
            </tr>
            </tbody>
            <tbody v-else>
            <tr>
                <td :colspan="totalColumns" v-if="!loading()">{{messages.message_no_data}}</td>
                <td :colspan="totalColumns" v-if="loading()">{{messages.loading_app_data}}</td>
            </tr>
            </tbody>
        </table>

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
                siteId: null,
                viewId: null,
                viewDetails: null,
                query: {
                    pageNumber: 1,
                    pageSize: 20
                },
                paramValues: {},
                paramOperators: {}
            };
        },
        computed: {
            ...mapState('apps', ['app', 'site', 'appData', 'actionResult']),
            ...mapState('devices', ['devices']),
            ...mapState('system', ['messages']),
            numPages () {
                return Math.ceil(parseFloat(this.appData.totalCount) / parseFloat(this.query.pageSize));
            },
            totalColumns () {
                let cols = this.app.dataConfig.fields.length;
                if (this.app.dataConfig.actions && this.app.dataConfig.actions.length) cols += this.app.dataConfig.actions.length;
                return cols;
            }
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
            this.getAllDevicesByUserId({
                userId: this.user.uuid,
                messages: this.messages,
                errors: this.errors
            });
        },
        methods: {
            ...mapActions('apps', [
                'getAppByUserId', 'getAppSiteByUserId', 'getAppDataByUserId', 'getAppSiteDataByUserId', 'takeDataAction'
            ]),
            ...mapActions('devices', ['getAllDevicesByUserId']),
            ...mapGetters('apps', ['loading']),
            hasPrevPage () { return this.query.pageNumber > 1; },
            hasNextPage () {
                return this.appData.totalCount && (this.appData.totalCount > (this.query.pageNumber * this.query.pageSize));
            },
            nextPage () {
                this.query.pageNumber++;
                this.refreshData();
            },
            prevPage () {
                this.query.pageNumber--;
                this.refreshData();
            },
            addBounds(q) {
                const query = Object.assign({}, q);
                for (let name in this.paramValues) {
                    if (this.paramValues.hasOwnProperty(name)) {
                        if (typeof query.bounds === 'undefined') {
                            query.bounds = [];
                        }
                        const val = this.paramValues[name];
                        if (val !== null && val !== '') {
                            query.bounds.push({name: name, value: this.paramOperators[name]+':'+val});
                        }
                    }
                }
                return query;
            },
            refreshData () {
                if (this.siteId) {
                    this.getAppSiteDataByUserId({
                        userId: this.user.name,
                        appId: this.appId,
                        siteId: this.siteId,
                        viewId: this.viewId,
                        query: this.addBounds(this.query),
                        messages: this.messages,
                        errors: this.errors
                    });
                } else {
                    this.getAppDataByUserId({
                        userId: this.user.name,
                        appId: this.appId,
                        siteId: this.siteId,
                        viewId: this.viewId,
                        query: this.addBounds(this.query),
                        messages: this.messages,
                        errors: this.errors
                    });
                }
            },
            actionIsAvailable(action, row) {
                if (typeof action.when === 'undefined' || action.when === null) return true;
                return safeEval(action.when, {'data': row}) === true;
            },
            dataAction(action, dataId) {
                this.takeDataAction({
                    userId: this.user.name,
                    appId: this.appId,
                    dataId: dataId,
                    action: action.name,
                    messages: this.messages,
                    errors: this.errors
                });
            }
        },
        watch: {
            app (a) {
                if (a && a.dataConfig && a.dataConfig.views && a.dataConfig.views.length && a.dataConfig.views.length > 0) {
                    const allViews = a.dataConfig.views;
                    for (let i=0; i<allViews.length; i++) {
                        if (allViews[i].name === this.viewId) {
                            this.viewDetails = allViews[i];
                            if (typeof a.dataConfig.params !== 'undefined' && a.dataConfig.params !== null && a.dataConfig.params.length && a.dataConfig.params.length > 0) {
                                for (let j=0; j<a.dataConfig.params.length; j++) {
                                    const param = a.dataConfig.params[j];
                                    this.paramValues[param.name] = '';
                                    this.paramOperators[param.name] = param.operator;
                                }
                                a.dataConfig.params.sort(function (p1, p2) {return p1.index - p2.index;});
                            }
                            this.refreshData();
                            return;
                        }
                    }
                    console.warn('watch.app: view not found: '+this.viewId);
                }
            },
            actionResult (r) {
                if (r) this.refreshData();
            }
        }
    };
</script>