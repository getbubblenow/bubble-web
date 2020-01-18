<template>
    <h4>{{messages.message_logging_out}}</h4>
</template>

<script>
    import { mapActions, mapState } from 'vuex'
    import { util } from '../_helpers'

    export default {
        computed: {
            ...mapState('system', ['messages']),
        },
        methods: {
            ...mapActions('account', ['logout']),
        },
        created () {
            if (util.currentUser() !== null) {
                console.log('LogoutPage.created: calling logout');
                this.logout({messages: this.messages, errors: this.errors});
            }
            this.$router.replace('/login');
        }
    };
</script>