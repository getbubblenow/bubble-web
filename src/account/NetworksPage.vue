<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://git.bubblev.org/bubblev/bubble/src/branch/master/LICENSE.md -->
<template>
    <div>
        <em v-if="loading && loading.networks">{{messages.loading_networks}}</em>
        <div v-if="networks && networks.length > 0">
            <h2>{{messages.table_title_networks}}</h2>
            <table border="1">
                <thead>
                <tr>
                    <th nowrap="nowrap">{{messages.label_field_networks_name}}</th>
                    <th nowrap="nowrap">{{messages.label_field_networks_locale}}</th>
                    <th nowrap="nowrap">{{messages.label_field_networks_timezone}}</th>
                    <th nowrap="nowrap">{{messages.label_field_networks_object_state}}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="network in networks" :key="network.uuid">
                    <td><router-link :to="{ path: '/bubble/'+ network.name }">{{network.name}}.{{network.domainName}}</router-link></td>
                    <td nowrap="nowrap">{{messages['locale_'+network.locale] || network.locale}}</td>
                    <td nowrap="nowrap">{{messages['tz_name_'+network.timezone] || network.timezone}}</td>
                    <td>{{messages['msg_network_state_'+network.state]}}</td>
                </tr>
                </tbody>
            </table>
            <hr/>
            <router-link to="/new_bubble">{{messages.button_label_new_network}}</router-link>
        </div>

        <div v-if="!networks || networks.length === 0">
            {{messages.message_empty_networks}}
            <router-view></router-view>
        </div>

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../_helpers';

    export default {
        computed: {
            ...mapState('networks', ['networks']),
            ...mapState('system', ['messages'])
        },
        created () {
            this.getAllNetworks({userId: util.currentUser().uuid, messages: this.messages, errors: this.errors});
        },
        methods: {
            ...mapActions('networks', ['getAllNetworks', 'stopNetwork', 'deleteNetwork']),
            ...mapGetters('networks', ['loading'])
        },
        watch: {
            networks (nets) {
                if (nets && nets.length) {
                    if (nets.length === 0) {
                        this.$router.replace({path: '/new_bubble'});
                    } else if (nets.length === 1 && util.currentUser().admin !== true) {
                        this.$router.replace({path: '/bubble/' + nets[0].name});
                    }
                }
            }
        }
    };
</script>