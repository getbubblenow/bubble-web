<template>
    <div>
        <h4 v-if="network">{{network.name}}.{{network.domainName}}</h4>
        <hr/>

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex'
    import { util } from '../_helpers'

    export default {
        data() {
            return {
            };
        },
        computed: {
            ...mapState('networks', ['network', 'newNodeNotification', 'networkStatuses']),
            ...mapState({
                error: state => state.error
            })
        },
        created () {
            const user = util.currentUser();
            this.getById({userId: user.uuid, uuid: this.$route.params.uuid});
            this.getNetworkStatuses({
                userId: user.uuid,
                network: this.$route.params.uuid,
                messages: this.messages,
                errors: this.errors
            });
        },
        methods: {
            ...mapActions('networks', {
                getById: 'getByUuid',
                deleteNetwork: 'delete',
                getNetworkStatuses: 'getNetworkStatuses'
            }),
            ...mapGetters('networks', ['loading'])
        },
        watch: {
            network (net) {
                console.log('received network: '+JSON.stringify(net));
            },
            networkStatuses (stats) {
                console.log('received stats: '+JSON.stringify(stats));
            }
        }
    };
</script>