<template>
    <div class="jumbotron">
        <sidebar-menu :hide-toggle="true" :menu="menu" v-if="status.loggedIn"/>
        <div class="container">
            <div class="row">
                <div class="col-sm-6 offset-sm-3">
                    <div v-if="alert.message" :class="`alert ${alert.type}`">{{alert.message}}</div>
                    <router-view></router-view>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
    name: 'app',
    computed: {
        ...mapState('account', ['status']),
        ...mapState('system', ['configs', 'messages', 'menu']),
        ...mapState({
            alert: state => state.alert
        })
    },
    methods: {
        ...mapActions({ clearAlert: 'alert/clear' }),
        ...mapActions('system', ['loadSystemConfigs', 'loadMessages', 'loadTimezones', 'detectTimezone', 'detectLocale'])
    },
    watch: {
        $route (to, from){
            // clear alert on location change
            this.clearAlert();
        }
    },
    created() {
        this.loadSystemConfigs();  // determine if we can show the registration link

        // todo: allow user to choose locale
        const locale = 'detect';
        this.loadMessages('pre_auth', locale);
        this.loadMessages('countries', locale);
        this.loadMessages('timezones', locale);
        this.detectLocale();
        this.loadTimezones();
        this.detectTimezone();
    }
};
</script>