<template>
    <div>
        <h3 v-if="app">{{messages['app_'+app.name+'_config_view_'+viewId]}}</h3>

        <div v-if="errors.has(lastAction)" class="invalid-feedback d-block"><h5>{{ errors.first(lastAction) }}</h5></div>

        <div v-if="loading()">
            {{messages.loading_app_config_data}}
        </div>
        <div v-else-if="appConfigData && configView">

            <!-- table of results -->
        <table border="1" v-if="appConfigData instanceof Array">
            <thead>
            <tr>
                <th v-for="field in configView.fields">
                    {{messages['app_'+app.name+'_config_field_'+field]}}
                </th>
                <th v-if="itemActions && itemActions.length > 0">
                    {{messages.message_config_data_actions}}
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
                <td v-if="itemActions && itemActions.length > 0">
                    <div v-for="action in itemActions">
                        <button v-if="actionIsAvailable(action, row)" @click="itemAction(action, row.id)">{{messages['app_'+app.name+'_config_action_'+action.name]}}</button>
                    </div>
                </td>
            </tr>
            </tbody>

        </table>
        <!-- single item view -->
        <table border="1" v-else>

        </table>

            <!-- app-scoped actions -->
            <div v-for="action in appActions">

                <!-- actions with parameters: show a form -->
                <div v-if="typeof action.params !== 'undefined' || action.params !== null || action.params.length > 0">
                    <h4>{{messages['app_'+app.name+'_config_action_'+action.name]}}</h4>
                    <form @submit.prevent="appAction(action)">

                        <div v-for="param in action.params" class="form-group">
                            <label :htmlFor="param.name">{{messages['app_'+app.name+'_config_field_'+param.name]}}</label>
                            <input v-model="appActionParams[action.name][param.name]" :name="param.name" class="form-control"/>
                            <small v-if="messages['app_'+app.name+'_config_field_'+param.name+'_description'].length > 0">{{messages['app_'+app.name+'_config_field_'+param.name+'_description']}}</small>
                            <div v-if="errors.has(param.name)" class="invalid-feedback d-block">{{ errors.first(param.name) }}</div>
                        </div>

                        <button class="btn btn-primary" :disabled="loading()">{{messages['app_'+app.name+'_config_button_'+action.name]}}</button>
                    </form>
                </div>

                <!-- actions with no parameters: just a button -->
                <div v-else>
                    <button class="btn btn-primary" :disabled="loading()">{{messages['app_'+app.name+'_config_action_'+action.name]}}</button>
                </div>
            </div>

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
                configView: null,
                itemActions: null,
                appActions: null,
                itemActionParams: {},
                appActionParams: {},
                lastAction: 'no_action'
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
                'getAppByUserId', 'getAppConfigViewByUserId', 'takeConfigItemAction', 'takeConfigAppAction'
            ]),
            ...mapGetters('apps', ['loading']),
            actionIsAvailable(action, row) {
                if (typeof action.when === 'undefined' || action.when === null) return true;
                return safeEval(action.when, {'item': row}) === true;
            },
            itemAction(action, itemId) {
                this.lastAction = action.name;
                this.errors.clear();
                this.takeConfigItemAction({
                    userId: this.user.name,
                    appId: this.appId,
                    viewId: this.viewId,
                    itemId: itemId,
                    params: this.itemActionParams[action.name],
                    action: action.name,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            appAction(action) {
                this.lastAction = action.name;
                this.errors.clear();
                this.takeConfigAppAction({
                    userId: this.user.name,
                    appId: this.appId,
                    viewId: this.viewId,
                    params: this.appActionParams[action.name],
                    action: action.name,
                    messages: this.messages,
                    errors: this.errors
                });
            }
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
                            const itemActions = [];
                            const appActions = [];
                            if (typeof this.configView.actions !== 'undefined' && this.configView.actions !== null && this.configView.actions.length > 0) {
                                for (let j=0; j<this.configView.actions.length; j++) {
                                    const action = this.configView.actions[j];
                                    if (action.scope === 'item') {
                                        itemActions.push(action);
                                        this.itemActionParams[action.name] = {};
                                    } else if (action.scope === 'app') {
                                        appActions.push(action);
                                        this.appActionParams[action.name] = {};
                                    } else {
                                        console.warn('invalid scope for action: '+action.scope);
                                    }
                                }
                            }
                            this.itemActions = itemActions;
                            this.appActions = appActions;
                        }
                    }
                    // console.warn('config view not found: '+this.viewId+' -- received: a='+JSON.stringify(a));
                }
            },
            actionResult (ar) {
                if (ar) {
                    if (this.itemActionParams) {
                        for (let action in this.itemActionParams) {
                            if (this.itemActionParams.hasOwnProperty(action)) {
                                this.itemActionParams[action] = {};
                            }
                        }
                    }
                    if (this.appActionParams) {
                        for (let action in this.appActionParams) {
                            if (this.appActionParams.hasOwnProperty(action)) {
                                this.appActionParams[action] = {};
                            }
                        }
                    }

                    this.getAppConfigViewByUserId({
                        userId: this.user.uuid,
                        appId: this.appId,
                        viewId: this.viewId,
                        messages: this.messages,
                        errors: this.errors
                    });
                }
            }
        }
    };
</script>