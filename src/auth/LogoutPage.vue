<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://bubblev.com/bubble-license/ -->
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
                this.logout({messages: this.messages, errors: this.errors});
            }
            this.$router.replace('/login');
        }
    };
</script>