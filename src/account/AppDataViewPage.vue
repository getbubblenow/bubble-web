<template>
    <div v-if="app">
        <h2>{{messages['app_'+app.name+'_name']}} - {{messages['app_'+app.name+'_view_'+viewId]}}</h2>

        <table v-if="app && viewParams && viewParams.length > 0">
            <tr v-for="param in viewParams" v-bind:key="param.name">
                <td>{{messages['app_'+app.name+'_param_'+param.name]}}: </td>
                <td v-if="param.name === 'device'">
                    <select v-model="paramValues[param.name]" v-if="devices">
                        <option value="">{{messages.option_all_devices}}</option>
                        <option v-for="device in devices" :value="device.uuid" v-bind:key="device.name">{{device.name}}</option>
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

        <div v-if="viewDetails && appData && appData.results && appData.results.length && appData.results.length > 0">
            <div v-if="viewDetails.layout === 'tiles'">
                <div v-for="row in appData.results" v-bind:key="row.uuid">
                    <field-display v-for="field in viewFields" v-bind:key="field.name"
                                   :messagePrefix="'app_'+app.name+'_field_'"
                                   :showLabel="true"
                                   :customDateMessagePrefix="'app_'+app.name+'_view_'+viewId+'_'"
                                   :thing="row"
                                   :field="field"
                                   :longTextExpandable="false"></field-display>

                    <div v-if="typeof app.dataConfig.actions !== 'undefined' && app.dataConfig.actions !== null && app.dataConfig.actions.length > 0">
                        <span v-for="action in app.dataConfig.actions" v-bind:key="action.name">
                            <button v-if="actionIsAvailable(action, row)" @click="dataAction(action, row)">{{messages['app_'+app.name+'_action_'+action.name]}}</button>
                        </span>
                    </div>

                    <hr/>
                </div>
            </div>
            <div v-else>

                <table v-if="app && viewFields && viewFields.length > 0" border="1">
                    <thead>
                    <tr>
                        <th v-for="field in viewFields" v-bind:key="field.name">{{messages['app_'+app.name+'_field_'+field.name]}}</th>
                        <th v-if="app.dataConfig.actions && app.dataConfig.actions.length && app.dataConfig.actions.length > 0">{{messages.message_data_actions}}</th>
                    </tr>
                    </thead>
                    <tbody v-if="appData && appData.results && appData.results.length && appData.results.length > 0">
                    <tr v-for="row in appData.results" v-bind:key="row.uuid">
                        <td v-for="field in viewFields" nowrap="nowrap" v-bind:key="field.name">
                            <field-display :messagePrefix="'app_'+app.name+'_field_'"
                                           :customDateMessagePrefix="'app_'+app.name+'_view_'+viewId+'_'"
                                           :thing="row"
                                           :field="field"
                                           :longTextExpandable="false"></field-display>
                        </td>
                        <td v-if="app.dataConfig.actions && app.dataConfig.actions.length && app.dataConfig.actions.length > 0">
                            <div v-for="action in app.dataConfig.actions" v-bind:key="action.name">
                                <button v-if="actionIsAvailable(action, row)" @click="dataAction(action, row)">{{messages['app_'+app.name+'_action_'+action.name]}}</button>
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
                </table>
            </div>
        </div>
        <div v-else>
            <span v-if="!loading()">{{messages.message_no_data}}</span>
            <span v-if="loading()">{{messages.loading_app_data}}</span>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
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
                viewParams: null,
                paramValues: {},
                paramOperators: {},
                expanded: {}
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
                let cols = this.viewFields.length;
                if (this.app.dataConfig.actions && this.app.dataConfig.actions.length) cols += this.app.dataConfig.actions.length;
                return cols;
            },
            viewFields () {
                const fields = [];
                for (let i=0; i<this.app.dataConfig.fields.length; i++) {
                    const field = this.app.dataConfig.fields[i];
                    if (typeof field.when === 'undefined' || field.when === null || safeEval(field.when, {'view': this.viewId}) === true) {
                        fields.push(field);
                    }
                }
                return fields;
            }
        },
        created () {
            this.appId = this.$route.params.app;
            this.siteId = this.$route.params.site;
            this.viewId = this.$route.params.hasOwnProperty('view') ? this.$route.params.view : null;
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
            toggleExpanded (row) {
                console.log('toggleExpanded('+row.uuid+') called...');
                if (this.expanded.hasOwnProperty(row.uuid)) {
                    if (this.expanded[row.uuid] === true) {
                        console.log('toggleExpanded('+row.uuid+') UNsetting expanded');
                        this.expanded = {};
                    } else {
                        console.log('toggleExpanded('+row.uuid+') setting expanded');
                        const exp = {};
                        exp[row.uuid] = true;
                        this.expanded = exp;
                    }
                } else {
                    console.log('toggleExpanded('+row.uuid+') setting expanded');
                    const exp = {};
                    exp[row.uuid] = true;
                    this.expanded = exp;
                }
            },
            isExpanded (row) {
                return this.expanded.hasOwnProperty(row.uuid) && this.expanded[row.uuid] === true;
            },
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
                return safeEval(action.when, {'data': row, 'view': this.viewId}) === true;
            },
            dataAction(action, row) {
                this.errors.clear();
                if (typeof action.route !== 'undefined' && action.route !== null) {
                    // console.log('dataAction: found action.route: '+action.route+', row='+JSON.stringify(row));
                    const route = action.route.parseExpression(row);
                    // console.log('dataAction: parsed action.route into route: '+route);
                    this.$router.push(route);
                } else {
                    this.takeDataAction({
                        userId: this.user.name,
                        appId: this.appId,
                        dataId: row.uuid,
                        action: action.name,
                        messages: this.messages,
                        errors: this.errors
                    });
                }
            }
        },
        watch: {
            app (a) {
                if (a && a.dataConfig && a.dataConfig.views && a.dataConfig.views.length && a.dataConfig.views.length > 0) {
                    const allViews = a.dataConfig.views;
                    for (let i=0; i<allViews.length; i++) {
                        if (allViews[i].name === this.viewId) {
                            this.viewDetails = allViews[i];
                            const viewParams = [];
                            if (typeof a.dataConfig.params !== 'undefined' && a.dataConfig.params !== null && a.dataConfig.params.length && a.dataConfig.params.length > 0) {
                                for (let j=0; j<a.dataConfig.params.length; j++) {
                                    const param = a.dataConfig.params[j];
                                    if (typeof param.when === 'undefined' || param.when === null || safeEval(param.when, {'view': this.viewId}) === true) {
                                        viewParams.push(param);
                                        this.paramValues[param.name] = '';
                                        this.paramOperators[param.name] = param.operator;
                                    }
                                }
                                viewParams.sort(function (p1, p2) {return p1.index - p2.index;});
                                this.viewParams = viewParams;
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