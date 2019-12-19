<template>
    <div>
        <h2>{{messages.message_action_processing}} {{messages['message_inbound_'+actionType]}} ...</h2>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'

    export default {
        data () {
            return {actionType: null}
        },
        computed: {
            ...mapState('account', {
                currentUser: state => state.user
            }),
            ...mapState('account', ['actionStatus'])
        },
        methods: {
            ...mapActions("account", ['approveAction', 'denyAction']),
            ...mapState('system', ['messages']),
        },
        created () {
            console.log('ActionPage.created: starting. query='+JSON.stringify(this.$route.query));
            if (this.$route.query.approve) {
                this.actionType = 'approve';
                console.log('ActionPage.created: calling approveAction');
                this.approveAction({
                    uuid: this.currentUser.uuid,
                    code: this.$route.query.approve,
                    messages: this.messages,
                    errors: this.errors
                });
            } else if (this.$route.query.deny) {
                this.actionType = 'deny';
                console.log('ActionPage.created: calling denyAction');
                this.denyAction({
                    uuid: this.currentUser.uuid,
                    code: this.$route.query.deny,
                    messages: this.messages,
                    errors: this.errors
                });
            } else {
                this.$router.push({path:'/me/profile', params: {'action': 'invalid'}});
            }
        },
        watch: {
            actionStatus (status) {
                console.log('ActionPage.watch.actionStatus: received: '+JSON.stringify(status));
                if (status.requesting) {
                    console.log('ActionPage.watch.actionStatus: still requesting, doing nothing');
                } else {
                    if (status.success) {
                        console.log('ActionPage.watch.actionStatus: sending to policy page with success');
                        this.$router.push({path: '/me/policy', query: {action: this.actionType, ok: 'true'}});
                    } else {
                        console.log('ActionPage.watch.actionStatus: sending to policy page with failure');
                        this.$router.push({path: '/me/policy', query: {action: this.actionType}});
                    }
                }
            }
        }
    };
</script>