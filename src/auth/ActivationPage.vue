<template>
    <div>
        Activation Page
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex'

    const DNS_TEMPLATES = [
        {
            name: 'GoDaddyDns',
            driverClass: 'bubble.cloud.dns.godaddy.GoDaddyDnsDriver',
            credentials: {
                params: [
                    {name: 'GODADDY_API_KEY', value: null},
                    {name: 'GODADDY_API_SECRET', value: null},
                ]
            }
        }
    ];

    export default {
        data() {
            return {
                name: 'root',
                password: null,
                description: 'root user',
                networkName: null,
                dns: DNS_TEMPLATES[0],
                domain: {
                    'name': null
                },
                storage: {}
            };
        },
        computed: {
            ...mapState('system', ['activated'])
        },
        created () {
        },
        methods: {
            ...mapActions('system', ['loadIsActivated'])
        },
        watch: {
            activated (active) {
                console.log('ActivationPage.watch.activated: received: '+active);
                if (active) this.$router.replace('/');
            }
        }
    };
</script>