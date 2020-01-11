<template>
    <div v-if="network">
        <h4>{{network.name}}.{{network.domainName}} - <i>{{messages['msg_network_state_'+network.state]}}</i></h4>
        <div v-if="stats">
            <div class="progress-wrap">
                <div class="progress-bar" :style="'width: '+stats.percent+'%'" :id="'progressBar_'+networkId"></div>
                <div class="progress-text">{{messages.label_percent.parseMessage(this, {percent: stats.percent})}}</div>
            </div>
            <div :id="'progressBar_details_'+networkId">{{messages[stats.messageKey]}}</div>
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
                    <th nowrap="nowrap">{{messages.label_field_nodes_fqdn}}</th>
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

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex'
    import { util } from '../_helpers'

    export default {
        data() {
            return {
                networkId: this.$route.params.id,
                stats: null,
                refresher: null
            };
        },
        computed: {
            ...mapState('networks', ['network', 'newNodeNotification', 'networkStatuses', 'networkNodes']),
            ...mapState('system', ['messages'])
        },
        methods: {
            ...mapActions('networks', ['getNetworkById', 'deleteNetwork', 'getStatusesByNetworkId', 'getNodesByNetworkId']),
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
                this.refresher = setInterval(() => this.refreshStatus(user.uuid), 5000);
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
            networkNodes (nodes) {
                // console.log('watch.networkNodes: received: '+JSON.stringify(nodes));
            },
            networkStatuses (stats) {
                console.log('received stats: '+JSON.stringify(stats));
                if (stats) {
                    // adapted from: https://code-boxx.com/simple-vanilla-javascript-progress-bar/
                    if (!stats.hasOwnProperty(this.networkId)) return;
                    this.stats = stats[this.networkId][0];  // todo: when we have multiple nodes, this will need to be changed
                    if (this.stats.percent === 100) {
                        clearInterval(this.refresher);
                    }
                }
            }
        }
    };
</script>