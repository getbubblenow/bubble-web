<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div v-if="network">
        <h4 v-if="network.state === 'running' && configs && configs.networkUuid && network.uuid !== configs.networkUuid">
            {{network.nickname}} - <i>{{messages['msg_network_state_'+network.state]}}</i><br/>
            <h6><button :title="messages.message_network_connect" :onclick="'window.open(\''+networkAppLoginUrl+'\', \'_blank\')'">{{messages.message_network_connect}}</button></h6>
        </h4>
        <h4 v-else>{{network.nickname}} - <i>{{messages['msg_network_state_'+network.state]}}</i></h4>

        <div v-if="stats && network.state !== 'stopped'">
            <!-- adapted from: https://code-boxx.com/simple-vanilla-javascript-progress-bar/ -->
            <div class="progress-wrap">
                <div class="progress-bar" :style="'width: '+stats.percent+'%'" :id="'progressBar_'+networkId"></div>
                <div class="progress-text">{{messages.label_percent.parseMessage(this, {percent: stats.percent})}}</div>
            </div>
            <div :id="'progressBar_details_'+networkId">{{messages[stats.messageKey]}}</div>
            <hr/>
        </div>

        <div v-if="showSetupHelp">
            <h5 v-html="messages.title_launch_help_html"></h5>
            <div v-if="network && network.state === 'running'" v-html="messages.message_launch_success_help_html"></div>
            <div v-else v-html="messages.message_launch_help_html"></div>
            <div v-if="appLinks && addableDeviceTypes">
                <div v-if="network && network.state === 'running'" v-html="messages.message_launch_success_apps"></div>
                <div v-else v-html="messages.message_launch_help_apps"></div>
                <br/>
                <table border="0" width="100%">
                    <tr>
                        <td v-for="deviceType in addableDeviceTypes" align="center" :width="addableDeviceWidth+'%'">
                            <a target="_blank" rel="noopener noreferrer" :href="appLinks[deviceType]">
                                <i :class="messages['device_type_icon_'+deviceType]+' bubble-app-icon'"></i><br/>
                                {{messages['device_type_'+deviceType]}}
                            </a>
                        </td>
                    </tr>
                </table>
            </div>
            <hr/>
            <span v-html="messages.message_launch_support.parseMessage(this)"></span>
        </div>

        <div v-if="network.state === 'running' && configs.networkUuid && network.uuid === configs.networkUuid">
            <button class="btn btn-secondary" @click="requestRestoreKey()"
                    :disabled="loading && loading.requestNetworkKeys">
                {{messages.link_network_action_request_keys}}
            </button>
            <img v-show="loading && loading.requestNetworkKeys" :src="loadingImgSrc" />
            <div v-if="errors.has('networkKeys')" class="invalid-feedback d-block">{{ errors.first('networkKeys') }}</div>
            <div v-if="networkKeysRequested && networkKeysRequested === networkId">{{messages.message_network_action_keys_requested}}</div>
            <hr />
            <h5>{{messages.message_network_action_retrieve_keys}}</h5>
            <form @submit.prevent="retrieveRestoreKey()">
                <div class="form-group">
                    <label for="restoreKeyCode">{{messages.field_network_key_download_code}}</label>
                    <input type="text" v-model="restoreKeyCode" v-validate="'required'" name="restoreKeyCode" class="form-control" :class="{ 'is-invalid': errors.has('retrieveNetworkKeys') }" />
                    <div v-if="errors.has('retrieveNetworkKeys')" class="invalid-feedback">{{ errors.first('retrieveNetworkKeys') }}</div>
                </div>
                <div class="form-group">
                    <label for="restoreKeyPassword">{{messages.field_network_key_download_password}}</label>
                    <input type="text" v-model="restoreKeyPassword" v-validate="'required'" name="restoreKeyPassword"
                           class="form-control" :class="{ 'is-invalid': errors.has('password') }"
                           :autofocus="this.$route.query.hasOwnProperty('keys_code')"/>
                    <div v-if="errors.has('password')" class="invalid-feedback">{{ errors.first('password') }}</div>
                </div>
                <button class="btn btn-secondary" :disabled="loading && loading.retrieveNetworkKeys">
                    {{ messages.button_label_retrieve_keys }}
                </button>
                <img v-show="loading && loading.retrieveNetworkKeys" :src="loadingImgSrc" />
            </form>
            <div v-if="networkKeys">
                <hr />
                <h4><b>{{ messages.message_network_keys }}</b></h4>
                <textarea v-model="networkKeys.data" name="networkKeys" class="form-control" cols="50"
                          readonly="true" />
                {{ messages.message_network_keys_description }}
            </div>
        </div>

        <hr/>

        <div v-if="network.state === 'stopped'">
            <!-- todo: add button to restart network in restore mode -->
        </div>

        <div v-if="network.state === 'running' || network.state === 'starting' || network.state === 'stopped' || network.state === 'error_stopping'">
            <div class="text-danger"><h4>{{messages.title_network_danger_zone}}</h4></div>
            <div v-if="errors.has('node')" class="invalid-feedback d-block">{{ errors.first('node') }}</div>
            <div v-if="errors.has('accountPlan')" class="invalid-feedback d-block">{{ errors.first('accountPlan') }}</div>
            <div v-if="network.state === 'running' || network.state === 'starting'" style="border: 2px solid #000;">
                <button @click="stopNet()" class="btn btn-danger">{{messages.link_network_action_stop}}</button>
                {{messages.link_network_action_stop_description}}
            </div>
            <hr/>
            <div style="border: 2px solid #000;">
                <button @click="deleteNet()" class="btn btn-danger">{{messages.link_network_action_delete}}</button>
                {{messages.link_network_action_delete_description}}
            </div>
        </div>

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../_helpers';
    import { loadingImgSrc } from '../_store';

    export default {
        data() {
            return {
                user: util.currentUser(),
                networkId: this.$route.params.id,
                networkUuid: null,
                stats: null,
                refresher: null,
                restoreKeyCode: null,
                restoreKeyPassword: null,
                loadingImgSrc: loadingImgSrc
            };
        },
        computed: {
            ...mapState('networks', [
                'network', 'newNodeNotification', 'networkStatuses', 'networkNodes', 'networkKeysRequested',
                'deletedNetworkUuid', 'networkKeys', 'loading'
            ]),
            ...mapState('system', ['messages', 'configs', 'appLinks']),
            showSetupHelp () {
                return (this.network !== null && (this.network.state === 'running' || this.network.state === 'starting'));
            },
            addableDeviceTypes: function () {
                if (this.messages && this.messages['!addable_device_types']) {
                    return this.messages['addable_device_types'].split('|');
                }
                return [];
            },
            addableDeviceWidth: function () {
                return 100.0/this.addableDeviceTypes.length
            },
            networkAppLoginUrl: function () {
                return 'https://'+this.network.name+'.'+this.network.domainName+'/appLogin?session='+util.currentUser().token+'&uri=/devices';
            }
        },
        methods: {
            ...mapActions('networks', [
                'getNetworkById', 'deleteNetwork', 'getStatusesByNetworkId', 'getNodesByNetworkId',
                'stopNetwork', 'deleteNetwork', 'requestNetworkKeys', 'retrieveNetworkKeys'
            ]),
            ...mapActions('system', ['getAppLinks']),
            refreshStatus (userId) {
                this.getNetworkById({userId: userId, networkId: this.networkId, messages: this.messages, errors: this.errors});
                this.getStatusesByNetworkId({
                    userId: userId,
                    networkId: this.networkId,
                    messages: this.messages,
                    errors: this.errors
                });
                this.getNodesByNetworkId({
                    userId: userId,
                    networkId: this.networkId,
                    nodes: this.nodes,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            startStatusRefresher (user) {
                // todo: separate refresher for network -- after "stop" we should refresh the status to show it is stopped
                this.refresher = setInterval(() => this.refreshStatus(user.uuid), 5000);
            },
            stopNet () {
                const vue = this;
                if (confirm(vue.messages.confirmation_network_action_stop)) {
                    this.errors.clear();
                    this.stopNetwork({
                        userId: this.user.uuid,
                        networkId: this.networkId,
                        messages: this.messages,
                        errors: this.errors
                    });
                }
            },
            deleteNet () {
                const vue = this;
                if (confirm(vue.messages.confirmation_network_action_delete)) {
                    this.errors.clear();
                    this.deleteNetwork({
                        userId: this.user.uuid,
                        networkId: this.networkId,
                        messages: this.messages,
                        errors: this.errors
                    });
                }
            },
            requestRestoreKey () {
                this.errors.clear();
                this.requestNetworkKeys({
                    userId: this.user.uuid,
                    networkId: this.networkId,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            retrieveRestoreKey () {
                this.errors.clear();
                this.retrieveNetworkKeys({
                    userId: this.user.uuid,
                    networkId: this.networkId,
                    code: this.restoreKeyCode,
                    password: this.restoreKeyPassword,
                    messages: this.messages,
                    errors: this.errors
                });
            }
        },
        created () {
            const user = util.currentUser();
            this.refreshStatus(user.uuid);
            this.startStatusRefresher(user);
            this.restoreKeyCode = this.$route.query.keys_code;
            this.getAppLinks(user.locale);
        },
        beforeDestroy () {
            clearInterval(this.refresher);
        },
        watch: {
            network (net) {
                if (net) {
                    if (net.state === 'running' || net.state === 'stopped' || net.state === 'error_stopping' || net.uuid === 'Not Found') {
                        clearInterval(this.refresher);
                    }
                    if (net.uuid === 'Not Found') {
                        this.$router.replace({path: '/bubbles'});
                    }
                    this.networkUuid = net.uuid;
                }
            },
            networkNodes (nodes) {
                // console.log('watch.networkNodes: received: '+JSON.stringify(nodes));
            },
            networkStatuses (stats) {
                if (this.network && stats && stats.length && stats.length > 0) {
                    for (let i=0; i<stats.length; i++) {
                        if (stats[i].network === this.network.uuid) {
                            this.stats = stats[i];
                            if (this.stats.percent === 100) {
                                clearInterval(this.refresher);
                            }
                            return;
                        }
                    }
                    // status not found for our network
                    clearInterval(this.refresher);
                }
            },
            deletedNetworkUuid (uuid) {
                if (uuid && this.networkUuid && (uuid === this.networkUuid)) {
                    this.$router.replace({path: '/bubbles'});
                }
            }
        }
    };
</script>
