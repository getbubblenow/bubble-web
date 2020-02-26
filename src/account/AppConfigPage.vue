<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://git.bubblev.org/bubblev/bubble/src/branch/master/LICENSE.md -->
<template>
    <div>
        <h3 v-if="app">{{messages['app_'+app.name+'_config_view_'+viewId]}}</h3>

        <div v-if="successResponseMessage" class="invalid-feedback d-block"><hr/><h5>{{messages[successResponseMessage]}}</h5><hr/></div>
        <div v-if="successResponseMessageDescription !== null && successResponseMessageDescription !== ''">
            {{messages[successResponseMessageDescription]}}
            <hr/>
        </div>

        <div v-if="lastAction && errors.has(lastAction.name)" class="invalid-feedback d-block"><h5>{{ errors.first(lastAction.name) }}</h5></div>

        <div v-if="loading() && !hasActionFocus">
            {{messages.loading_app_config_data}}
        </div>
        <div v-else-if="configView">

            <!-- table of results -->
            <div v-if="appConfigData instanceof Array && !hasActionFocus">
        <table border="1">
            <thead>
            <tr v-if="configView.fields">
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
            </div>

        <!-- single item view -->
        <div v-else-if="!hasActionFocus">
            <hr/>
            <form v-if="appConfigData" @submit.prevent="singleItemAction()">
                showing config fields
                <div v-for="field in configView.fields">
                    <form-field v-bind:field="appFields[field]"
                                v-bind:thing="appConfigData"
                                v-bind:messagePrefix="'app_'+app.name+'_config_field_'"></form-field>
                </div>

                <div v-for="action in itemActions">
                    <button v-if="actionIsAvailable(action, appConfigData)" @click="singleItemAction(action)" class="btn btn-primary" :disabled="loading()">{{messages['app_'+app.name+'_config_button_'+action.name]}}</button>
                </div>
            </form>

        </div>

            <!-- app-scoped actions -->
            <div v-for="action in appActions">
                <div v-if="!hasActionFocus || actionFocus === action.name">

                    <hr/>

                    <!-- last action status -->
                    <div v-if="lastAction && lastAction.name === action.name">
                        <div v-if="successResponseMessage" class="invalid-feedback d-block"><hr/><h5>{{messages[successResponseMessage]}}</h5><hr/></div>
                        <div v-if="successResponseMessageDescription !== null && successResponseMessageDescription !== ''">
                            {{messages[successResponseMessageDescription]}}
                            <hr/>
                        </div>
                    </div>

                    <!-- actions with parameters: show a form -->
                    <div v-if="typeof action.params !== 'undefined' || action.params !== null || action.params.length > 0">
                        <h4>{{messages['app_'+app.name+'_config_action_'+action.name]}}</h4>
                        <form @submit.prevent="appAction(action)">
                            <div v-for="param in action.params">
                                <form-field :field="appFields[param]"
                                            :thing="appActionParams[action.name]"
                                            :messagePrefix="'app_'+app.name+'_config_field_'"></form-field>
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

        </div>
        <div v-else-if="!hasActionFocus">
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
                itemId: null,
                actionFocus: null,
                appFields: null,
                configView: null,
                itemActions: null,
                appActions: null,
                itemActionParams: {},
                appActionParams: {},
                lastAction: null,
                successResponseMessage: null,
                successResponseMessageDescription: null
            };
        },
        computed: {
            ...mapState('apps', ['app', 'appConfigData', 'actionResult']),
            ...mapState('system', ['messages']),
            hasActionFocus () {
                return typeof this.actionFocus !== 'undefined' && this.actionFocus !== null && this.actionFocus !== '' && this.lastAction === null;
            }
        },
        created () {
            this.actionFocus = this.$route.query.action;
            this.initView();
        },
        methods: {
            ...mapActions('apps', [
                'getAppByUserId', 'getAppConfigViewByUserId', 'takeConfigItemAction', 'takeConfigAppAction'
            ]),
            ...mapGetters('apps', ['loading']),
            resetMessages() {
                this.errors.clear();
                this.successResponseMessage = null;
                this.successResponseMessageDescription = null;
            },
            initView() {
                this.appId = this.$route.params.app;
                this.viewId = this.$route.params.view;
                this.itemId = this.$route.params.item;
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
                    itemId: this.itemId,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            actionIsAvailable(action, row) {
                if (typeof action.when === 'undefined' || action.when === null) return true;
                try {
                    return safeEval(action.when, {'item': row}) === true;
                } catch (e) {
                    console.log('actionIsAvailable: error evaluating when='+action.when+' for item='+JSON.stringify(row)+': '+e);
                    return false;
                }
            },
            itemAction(action, itemId) {
                this.resetMessages();
                if (typeof action.view !== 'undefined' && action.view !== null) {
                    this.$router.push({path: '/app/'+this.appId+'/config/'+action.view+'/'+itemId});
                    this.initView();
                } else {
                    this.lastAction = action;
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
                }
            },
            appAction(action) {
                this.resetMessages();
                if (typeof action.view !== 'undefined' && action.view !== null) {
                    this.$router.push({path: '/app/'+this.appId+'/config/'+action.view+(this.itemId ? +'/'+this.itemId : '')});
                    this.initView();
                } else {
                    this.lastAction = action;
                    this.takeConfigAppAction({
                        userId: this.user.name,
                        appId: this.appId,
                        viewId: this.viewId,
                        itemId: this.itemId,
                        params: this.appActionParams[action.name],
                        action: action.name,
                        messages: this.messages,
                        errors: this.errors
                    });
                }
            },
            singleItemAction(action) {
                if (typeof action === 'undefined' || action === null) return;
                this.resetMessages();
                if (typeof action.view !== 'undefined' && action.view !== null) {
                    this.$router.push({path: '/app/'+this.appId+'/config/'+action.view+'/'+this.itemId});
                    this.initView();
                } else {
                    this.lastAction = action;
                    this.takeConfigItemAction({
                        userId: this.user.name,
                        appId: this.appId,
                        viewId: this.viewId,
                        itemId: this.itemId,
                        params: this.appConfigData,
                        action: action.name,
                        messages: this.messages,
                        errors: this.errors
                    });
                }
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
                                    const hasParams = typeof action.params !== 'undefined' && action.params !== null && action.params.length > 0;
                                    if (action.scope === 'item') {
                                        itemActions.push(action);
                                        if (hasParams) this.itemActionParams[action.name] = {};
                                    } else if (action.scope === 'app') {
                                        appActions.push(action);
                                        if (hasParams) this.appActionParams[action.name] = {};
                                    } else {
                                        console.warn('invalid scope for action: '+action.scope);
                                    }

                                    if (hasParams && this.$route.query) {  // set defaults from query params
                                        for (let k=0; k<action.params.length; k++) {
                                            const param = action.params[k];
                                            if (this.$route.query.hasOwnProperty(param)) {
                                                if (action.scope === 'item') {
                                                    console.log('setting item action '+action.name+' param for inbound field: '+param+'='+this.$route.query[param]);
                                                    this.itemActionParams[action.name][param] = this.$route.query[param];
                                                } else if (action.scope === 'app') {
                                                    console.log('setting app action '+action.name+' param for inbound field: '+param+'='+this.$route.query[param]);
                                                    this.appActionParams[action.name][param] = this.$route.query[param];
                                                }
                                            }
                                        }
                                    }

                                }
                            }
                            this.itemActions = itemActions.sort((a, b) => (a.index - b.index));
                            this.appActions = appActions.sort((a, b) => (a.index - b.index));
                        }
                    }
                    // console.warn('config view not found: '+this.viewId+' -- received: a='+JSON.stringify(a));
                }
            },
            actionResult (ar) {
                if (ar) {
                    console.log('received ar with response: '+JSON.stringify(ar.response));
                    if (typeof ar.response !== 'undefined' && ar.response !== null) {
                        if (typeof this.lastAction.successMessage !== 'undefined' && this.lastAction.successMessage !== null && this.lastAction.successMessage !== '') {
                            const resolution = ar.response[this.lastAction.successMessage];
                            if (typeof resolution === 'undefined' || resolution === null || resolution === '' || !resolution) {
                                console.warn("watch.actionResult: bad resolution: "+JSON.stringify(resolution));
                            } else {
                                this.successResponseMessage = 'app_' + this.app.name + '_config_response_' + resolution;
                                this.successResponseMessageDescription = 'app_' + this.app.name + '_config_response_' + resolution + "_description";
                            }
                        }

                    } else {
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

                        if (this.lastAction && typeof this.lastAction.successView !== 'undefined' && this.lastAction.successView !== null) {
                            const successView = this.lastAction.successView.parseMessage(this);
                            this.$router.push({path: '/app/' + this.appId + '/config/' + successView});
                            this.initView();
                        } else {
                            this.getAppConfigViewByUserId({
                                userId: this.user.uuid,
                                appId: this.appId,
                                viewId: this.viewId,
                                itemId: this.itemId,
                                messages: this.messages,
                                errors: this.errors
                            });
                        }
                    }
                }
            }
        }
    };
</script>