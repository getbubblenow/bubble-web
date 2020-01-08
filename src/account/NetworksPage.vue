<template>
    <div>
        <em v-if="loading && loading.networks">{{messages.loading_networks}}</em>
        <div v-if="networks && networks.length > 0">
            <h2>{{messages.table_title_networks}}</h2>
            <table border="1">
                <thead>
                <tr>
                    <th nowrap="nowrap">{{messages.table_head_networks_name}}</th>
                    <th nowrap="nowrap">{{messages.table_head_networks_locale}}</th>
                    <th nowrap="nowrap">{{messages.table_head_networks_timezone}}</th>
                    <th nowrap="nowrap">{{messages.table_head_networks_object_state}}</th>
                    <th nowrap="nowrap">{{messages.table_head_networks_action_view}}</th>
                    <th nowrap="nowrap">{{messages.table_head_networks_action_start_stop}}</th>
                    <th nowrap="nowrap">{{messages.table_head_networks_action_delete}}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="network in networks" :key="network.uuid">
                    <td>{{network.name}}.{{network.domainName}}</td>
                    <td nowrap="nowrap">{{messages['locale_'+network.locale] || network.locale}}</td>
                    <td nowrap="nowrap">{{messages['tz_name_'+network.timezone] || network.timezone}}</td>
                    <td>{{network.state}}</td>
                    <td><router-link :to="{ path: '/networks/'+ network.uuid }">{{messages.table_row_networks_action_view}}</router-link></td>
                    <td v-if="network.state === 'running'">{{messages.table_row_networks_action_stop}}</td>
                    <td v-if="network.state === 'created'">{{messages.table_row_networks_action_start}}</td>
                    <td><a @click="deleteNetwork(network.uuid)" class="text-danger">{{messages.table_row_networks_action_delete}}</a></td>
                </tr>
                </tbody>
            </table>
            <hr/>
            <router-link to="/networks/new">{{messages.button_label_new_network}}</router-link>
        </div>

        <div v-if="!networks || networks.length === 0">
            {{messages.message_empty_networks}}
            <router-view></router-view>
        </div>

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex'

    export default {
        computed: {
            ...mapState({
                networks: state => state.networks.networks
            }),
            ...mapState('system', ['messages'])
        },
        created () {
            this.getAllNetworks({messages: this.messages, errors: this.errors});
        },
        methods: {
            ...mapActions('networks', {
                getAllNetworks: 'getAll',
                deleteNetwork: 'delete'
            }),
            ...mapGetters('networks', ['loading'])
        }
    };
</script>