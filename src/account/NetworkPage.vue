<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div v-if="network">
        <h4>{{ network.nickname }} - <i>{{ messages['msg_network_state_'+network.state] }}</i></h4>
        <h6 v-if="this.isNotSelfNet && (isInReadyToRestoreState || this.network.state === 'running')">
            <button v-if="this.network.state === 'running'" :title="messages.message_network_connect"
                    :onclick="'window.open(\'' + networkAppLoginUrl + '\', \'_blank\')'">
                {{messages.message_network_connect}}
            </button>
            <button v-else :title="messages.message_network_restore"
                    :onclick="'window.open(\'' + nodeRestoreUrl + '\', \'_blank\')'">
                {{ messages.message_network_restore }}
            </button>
        </h6>

        <div v-if="stats && (network.state === 'created' || network.state === 'starting' || network.state === 'restoring')">
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

        <div v-if="isSelfNetAndRunning">

            <div v-if="user.admin === true && checkingForUpgrade !== null && configs && configs.jarVersion && configs.jarUpgradeAvailable && configs.jarUpgradeAvailable.version">
                <hr/>
                <h4>{{messages.message_jar_upgrade_available}}</h4>
                <p>
                    {{messages.message_jar_current_version}} <b>{{configs.jarVersion}}</b><br/>
                    {{messages.message_jar_upgrade_version}} <b>{{configs.jarUpgradeAvailable.version}}</b>
                </p>
                <button v-if="!upgrading" :disabled="upgrading" @click="doUpgrade()">{{messages.button_label_jar_upgrade}}</button>
                <button v-else-if="upgrading" :disabled="true">{{messages.button_label_jar_upgrading}}</button>
                <p v-if="upgrading">{{messages.message_jar_upgrading}}</p>
                <hr/>
            </div>
            <div v-else-if="user.admin === true && configs && configs.jarVersion">
                <hr/>
                <h6>{{messages.message_jar_current_version}} <b>{{configs.jarVersion}}</b></h6>
                <p v-if="checkingForUpgrade">{{messages.message_jar_checking_for_upgrade}}</p>
                <hr/>
            </div>

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

            <span v-html="latestBackupInfoHtml"></span>

            <span v-if="allowQueueBackup">
                <br/>
                <button @click="queueBckup()" class="btn btn-secondary" :disabled="loading && loading.queueBackup">
                    {{ messages.link_backup_network }}
                </button>
            </span>
        </div>

        <div v-if="network.state === 'stopped'">
            <hr/>
            <div v-if="errors.has('networkRestore')" class="invalid-feedback d-block">
                {{ errors.first('networkRestore') }}
            </div>

            <div v-if="networkNodes && networkNodes.length === 0">
                <div v-if="restoreKey" class="alert alert-success">
                    {{ messages.restore_key_label }} {{ restoreKey }}
                </div>
                <div v-else>
                    <button @click="restoreNet()" class="btn btn-primary" :disabled="loading && loading.restoring">
                        {{ messages.button_label_restore }}
                    </button>
                    <img v-show="loading && loading.restoring" :src="loadingImgSrc" />
                </div>
                {{ messages.button_description_restore }}
            </div>
            <div v-else v-html="messages.restore_not_possible_nodes_exist_html" />

        </div>

        <div v-if="configs.sageLauncher">
            <div class="text-danger"><h4>{{messages.title_network_danger_zone}}</h4></div>
            <div v-if="errors.has('node')" class="invalid-feedback d-block">{{ errors.first('node') }}</div>
            <div v-if="errors.has('accountPlan')" class="invalid-feedback d-block">{{ errors.first('accountPlan') }}</div>

            <span v-if="network.state !== 'stopping' && network.state !== 'stopped' && backups && backups.length > 0">
                <div style="border: 2px solid #000;">
                    <button @click="stopNet()" class="btn btn-danger" :disabled="loading && loading.stopping">
                        {{messages.link_network_action_stop}}
                    </button>
                    <img v-show="loading && loading.stopping" :src="loadingImgSrc" />
                    {{messages.link_network_action_stop_description}}

                    <!-- the next condition is to prevent this info shown twice on this page -->
                    <span v-if="!isSelfNetAndRunning" v-html="latestBackupInfoHtml"></span>
                </div>
                <br/>
            </span>
            <div style="border: 2px solid #000;">
                <button @click="deleteNet()" class="btn btn-danger" :disabled="loading && loading.deleting">
                    {{messages.link_network_action_delete}}
                </button>
                <img v-show="loading && loading.deleting" :src="loadingImgSrc" />
                {{messages.link_network_action_delete_description}}
            </div>
        </div>

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '~/_helpers';
    import { loadingImgSrc } from '~/_store';

    export default {
        data() {
            return {
                user: util.currentUser(),
                networkId: this.$route.params.id,
                networkUuid: null,
                stats: null,
                refresher: null,
                stopRefresher: null,
                restoreKeyCode: null,
                restoreKeyPassword: null,
                loadingImgSrc: loadingImgSrc,
                checkingForUpgrade: null,
                upgradeRefresher: null
            };
        },
        computed: {
            ...mapState('networks', [
                'network', 'newNodeNotification', 'networkStatuses', 'networkNodes', 'networkKeysRequested',
                'deletedNetworkUuid', 'networkKeys', 'loading', 'restoreKey', 'backups'
            ]),
            ...mapState('system', ['messages', 'configs', 'appLinks', 'upgradeCheck', 'upgrading']),
            showSetupHelp () {
                return (this.network !== null && this.network.uuid !== this.configs.networkUuid
                        && (this.network.state === 'running' || this.network.state === 'starting'
                            || this.network.state === 'restoring'));
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
            },
            nodeRestoreUrl: function () {
                return 'https://' + this.networkNodes[0].fqdn + ':' + this.networkNodes[0].sslPort + '/restore';
            },
            allowQueueBackup: function () {
                if (this.backups === null) return false;
                if (this.backups.length === 0) return true;

                let lastBackupStatus = this.backups[0].status;
                return lastBackupStatus !== 'queued' && lastBackupStatus !==  'backup_in_progress';
            },
            latestBackupInfoHtml: function() {
                if (this.backups === null) {
                    return '<hr/>' + this.messages.label_latest_backup + '<img src="' + loadingImgSrc + '" />';
                } else if (this.backups.length === 0) {
                    return '<hr/>' + this.messages.label_no_latest_backup;
                } else {
                    let lastBackup = this.backups[0];
                    return '<hr/>' + this.messages.label_latest_backup
                           + " " + lastBackup.label + " <i>" + lastBackup.status + "</i> "
                           + this.messages.date_format_app_data_epoch_time.parseDateMessage(lastBackup.ctime,
                                                                                            this.messages);
                }
            },
            isSelfNetAndRunning: function() {
                return this.network && this.network.state === 'running'
                       && this.configs && this.configs.networkUuid && this.network.uuid === this.configs.networkUuid;
            },
            isNotSelfNet: function() {
                return this.configs && this.configs.networkUuid
                       && this.network && this.network.uuid !== this.configs.networkUuid
            },
            isInReadyToRestoreState: function() {
                return this.network && this.network.state === 'restoring' && (!this.stats || this.stats.percent === 100)
                       && this.networkNodes && this.networkNodes.length === 1
            }
        },
        methods: {
            ...mapActions('networks', [
                'getNetworkById', 'deleteNetwork', 'getStatusesByNetworkId', 'getNodesByNetworkId',
                'stopNetwork', 'queueBackup', 'restoreNetwork', 'deleteNetwork', 'requestNetworkKeys',
                'retrieveNetworkKeys', 'getBackups', 'resetRestoreKey'
            ]),
            ...mapActions('system', ['getAppLinks', 'loadSystemConfigs', 'checkForUpgrade', 'upgrade']),
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
                if (this.backups === null || this.refresher === null) {
                    // note about the second part of the condition above: if refreshes is turned on, then fetch backups
                    // from BE only once
                    this.getBackups({ userId: userId, networkId: this.networkId,
                                      messages: this.messages, errors: this.errors });
                }
            },
            startStatusRefresher (user) {
                // todo: separate refresher for network -- after "stop" we should refresh the status to show it is stopped
                this.refresher = setInterval(() => this.refreshStatus(user.uuid), 5000);
            },
            clearRefresherInterval (refresherId) {
                if (refresherId !== null) {
                    clearInterval(refresherId);
                    refresherId = null;
                }
            },
            stopRefreshStatus (userId) {
                this.getNetworkById({userId: userId, networkId: this.networkId, messages: this.messages, errors: this.errors});
            },
            stopNet () {
                if (this.networkUuid === null) {
                    alert(this.messages.network_action_stop_not_ready);
                } else {
                    if (confirm(this.messages.confirmation_network_action_stop)) {
                        this.errors.clear();
                        this.stopNetwork({
                            userId: this.user.uuid,
                            networkId: this.networkUuid,
                            messages: this.messages,
                            errors: this.errors
                        });
                        this.clearRefresherInterval(this.refresher);
                        this.stopRefresher = setInterval(() => this.stopRefreshStatus(this.user.uuid), 5000);
                    }
                }
            },
            queueBckup () {
                this.errors.clear();
                this.queueBackup({
                    userId: this.user.uuid,
                    networkId: this.networkId,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            restoreNet () {
                this.errors.clear();
                this.restoreNetwork({
                    userId: this.user.uuid,
                    networkId: this.networkId,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            deleteNet () {
                if (confirm(this.messages.confirmation_network_action_delete)) {
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
            },
            doUpgrade () {
                this.upgrade();
            }
        },
        created () {
            const user = util.currentUser();
            this.refreshStatus(user.uuid);
            this.startStatusRefresher(user);
            this.restoreKeyCode = this.$route.query.keys_code;
            this.getAppLinks(user.locale);
            this.loadSystemConfigs();
        },
        beforeDestroy () {
            this.clearRefresherInterval(this.refresher);
            this.clearRefresherInterval(this.stopRefresher);
            this.resetRestoreKey();
        },
        watch: {
            network (net) {
                if (net) {
                    if (net.uuid === 'Not Found') this.$router.replace({path: '/bubbles'});
                    this.networkUuid = net.uuid;

                    if (net.state !== 'created' && net.state !== 'starting' && net.state !== 'restoring') {
                        this.clearRefresherInterval(this.refresher);
                    }
                    if (net.state !== 'stopping') this.clearRefresherInterval(this.stopRefresher);
                }
            },
            networkNodes (nodes) {
                // console.log('watch.networkNodes: received: '+JSON.stringify(nodes));
            },
            networkStatuses (stats) {
                if (this.network && stats && stats.length && stats.length > 0) {
                    let latestStats = null;
                    for (let i=0; i<stats.length; i++) {
                        if (stats[i].network === this.network.uuid
                                && (latestStats === null || stats[i].ctime > latestStats.ctime)) {
                            latestStats = stats[i];
                        }
                    }
                    if (latestStats !== null) {
                        this.stats = latestStats;
                        if (this.stats.percent === 100) this.clearRefresherInterval(this.refresher);
                    } else {
                        // status not found for our network
                        this.clearRefresherInterval(this.refresher);
                    }
                }
            },
            deletedNetworkUuid (uuid) {
                if (uuid && this.networkUuid && (uuid === this.networkUuid)) {
                    this.$router.replace({path: '/bubbles'});
                }
            },
            configs (c) {
                if (c) {
                    // console.log('watch.configs received: '+JSON.stringify(c));
                    if (this.user.admin) {
                        if (this.upgradeRefresher !== null) {
                            this.checkingForUpgrade = false;
                            console.log('watch.configs: found c.jarVersion=' + c.jarVersion + ', c.jarUpgradeAvailable=' + JSON.stringify(c.jarUpgradeAvailable));
                            // if there is no longer an upgrade available, then the upgrade succeeded
                            if (c.jarUpgradeAvailable === null) {
                                console.log('watch.configs: upgraded, reloading...');
                                window.location.reload();
                                // window.clearInterval(this.upgradeRefresher);
                            }

                        } else if (c.jarVersion && this.checkingForUpgrade === null) {
                            this.checkingForUpgrade = true;
                            console.log('watch.configs: checking for upgrade...')
                            this.checkForUpgrade();
                        }
                    } else {
                        console.log('watch.configs: user is not admin, not checking for upgrade');
                    }
                }
            },
            upgrading (u) {
                console.log('watch.upgrading received: '+JSON.stringify(u));
                if (u) {
                    if (u && this.upgradeRefresher === null) {
                        console.log('watch.upgrading: starting refresher');
                        const vue = this;
                        this.upgradeRefresher = window.setInterval(() => {
                            vue.loadSystemConfigs();
                        }, 5000);
                    }
                }
            },
            upgradeCheck (u) {
                if (u) {
                    console.log('watch.upgradeCheck received: '+JSON.stringify(u)+', setting checkingForUpgrade = true');
                    this.checkingForUpgrade = true;
                    const vue = this;
                    window.setTimeout(() => {
                        console.log('reloading system configs in response to upgrade check')
                        vue.loadSystemConfigs();
                        this.checkingForUpgrade = false;
                    }, 10000);
                }
            }
        }
    };
</script>
