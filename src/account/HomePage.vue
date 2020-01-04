<template>
    <div>
        <h1>{{messages.label_homepage_hello && messages.label_homepage_hello.parseMessage(this)}}</h1>
        <hr/>
        <router-view></router-view>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
    computed: {
        ...mapState({
            account: state => state.account,
            users: state => state.users.all
        }),
        ...mapState('account', ['locale']),
        ...mapState('system', ['messages', 'detectedTimezone', 'detectedLocale'])
    },
    methods: {
        ...mapActions('users', {
            getAllUsers: 'getAll',
            deleteUser: 'delete'
        }),
        ...mapActions('system', ['loadMessages', 'loadTimezones', 'detectTimezone', 'detectLocale'])
    },
    created () {
        this.loadMessages('post_auth', this.locale);
        this.detectLocale();
        this.detectTimezone();
    }
};
</script>