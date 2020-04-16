<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div v-if="network">
        <h4 v-if="network.state === 'running' && configs && configs.networkUuid && network.uuid !== configs.networkUuid">
            <a :href="'https://'+network.name+'.'+network.domainName">{{network.name}}.{{network.domainName}}</a> - <i>{{messages['msg_network_state_'+network.state]}}</i>
        </h4>
        <h4 v-else>{{network.name}}.{{network.domainName}} - <i>{{messages['msg_network_state_'+network.state]}}</i></h4>

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
            <hr/>
        </div>

        <div>
            <div>
                <div>{{messages.label_field_networks_locale}}: {{messages['locale_'+network.locale] || network.locale}}</div>
                <div>{{messages.label_field_networks_timezone}}: {{messages['tz_name_'+network.timezone] || network.timezone}}</div>
            </div>
        </div>

        <div v-if="networkNodes">
            <table border="1">
                <thead>
                <tr>
                    <th nowrap="nowrap">{{messages.label_field_nodes_name}}</th>
                    <th nowrap="nowrap">{{messages.label_field_nodes_region}}</th>
                    <th nowrap="nowrap">{{messages.label_field_nodes_ip4}}</th>
                    <th nowrap="nowrap">{{messages.label_field_nodes_ip6}}</th>
                    <th nowrap="nowrap">{{messages.label_field_nodes_state}}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="node in networkNodes">
                    <td>{{node.fqdn}}</td>
                    <td nowrap="nowrap">{{node.region}}</td>
                    <td>{{node.ip4}}</td>
                    <td>{{node.ip6}}</td>
                    <td>{{messages['msg_node_state_'+node.state]}}</td>
                </tr>
                </tbody>
            </table>
        </div>

        <div v-if="network.state === 'running' && configs.networkUuid && network.uuid === configs.networkUuid">
            <button @click="requestRestoreKey()">{{messages.link_network_action_request_keys}}</button>
            <div v-if="errors.has('networkKeys')" class="invalid-feedback d-block">{{ errors.first('networkKeys') }}</div>
            <div v-if="networkKeysRequested && networkKeysRequested === networkId">{{messages.message_network_action_keys_requested}}</div>

            <h5>{{messages.message_network_action_retrieve_keys}}</h5>
            <form @submit.prevent="retrieveRestoreKey()">
                <div class="form-group">
                    <label for="restoreKeyCode">{{messages.field_network_key_download_code}}</label>
                    <input type="text" v-model="restoreKeyCode" v-validate="'required'" name="restoreKeyCode" class="form-control" :class="{ 'is-invalid': errors.has('retrieveNetworkKeys') }" />
                    <div v-if="errors.has('retrieveNetworkKeys')" class="invalid-feedback">{{ errors.first('retrieveNetworkKeys') }}</div>
                </div>
                <div class="form-group">
                    <label for="restoreKeyPassword">{{messages.field_network_key_download_password}}</label>
                    <input type="text" v-model="restoreKeyPassword" v-validate="'required'" name="restoreKeyPassword" class="form-control" :class="{ 'is-invalid': errors.has('password') }" />
                    <div v-if="errors.has('password')" class="invalid-feedback">{{ errors.first('password') }}</div>
                </div>
                <button>{{messages.button_label_retrieve_keys}}</button>
                <div v-if="networkKeys">
                    <hr/>
                    <h4><b>{{messages.message_network_keys}}</b></h4>: {{networkKeys}}
                    <hr/>
                    {{messages.message_network_keys_description}}
                </div>
            </form>
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
                <hr/>
                <button @click="stopNet()" class="text-danger">{{messages.link_network_action_stop}}</button>
                {{messages.link_network_action_stop_description}}
            </div>
            <div v-else></div>
            <hr/>
            <div v-if="network.state === 'stopped' || network.state === 'error_stopping'" style="border: 2px solid #000;">
                <button @click="deleteNet()" class="text-danger">{{messages.link_network_action_delete}}</button>
                {{messages.link_network_action_delete_description}}
            </div>
        </div>

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex'
    import { util } from '../_helpers'

    export default {
        data() {
            return {
                user: util.currentUser(),
                networkId: this.$route.params.id,
                stats: null,
                refresher: null,
                restoreKeyCode: null,
                restoreKeyPassword: null
            };
        },
        computed: {
            ...mapState('networks', [
                'network', 'newNodeNotification', 'networkStatuses', 'networkNodes', 'networkKeysRequested',
                'deletedNetwork', 'networkKeys'
            ]),
            ...mapState('system', ['messages', 'configs']),
            showSetupHelp () {
                return (this.network !== null && (this.network.state === 'running' || this.network.state === 'starting'));
            }
        },
        methods: {
            ...mapActions('networks', [
                'getNetworkById', 'deleteNetwork', 'getStatusesByNetworkId', 'getNodesByNetworkId',
                'stopNetwork', 'deleteNetwork', 'requestNetworkKeys'
            ]),
            ...mapGetters('networks', ['loading']),
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
                this.errors.clear();
                this.stopNetwork({
                    userId: this.user.uuid,
                    networkId: this.networkId,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            deleteNet () {
                this.errors.clear();
                this.deleteNetwork({
                    userId: this.user.uuid,
                    networkId: this.networkId,
                    messages: this.messages,
                    errors: this.errors
                });
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
            deletedNetwork (network) {
                if (network && (network.name === this.networkId || network.uuid === this.networkId)) {
                    this.$router.replace({path: '/bubbles'});
                }
            }
        }
    };
</script>