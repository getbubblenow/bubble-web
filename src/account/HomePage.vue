<template>
    <div>
        <h1>{{messages.label_homepage_hello && messages.label_homepage_hello.parseMessage(this)}}!</h1>
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
        ...mapState('system', ['messages'])
    },
    created () {
        // todo: allow user to choose locale
        const locale = 'detect';
        this.loadMessages('post_auth', locale);
    },
    methods: {
        ...mapActions('users', {
            getAllUsers: 'getAll',
            deleteUser: 'delete'
        }),
        ...mapActions('system', ['loadMessages', 'loadTimezones'])
    }
};
</script>