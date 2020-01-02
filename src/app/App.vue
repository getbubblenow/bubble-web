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
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
    name: 'app',
    computed: {
        ...mapState('account', ['status']),
        ...mapState('system', ['activated', 'configs', 'messages', 'menu']),
        ...mapGetters('system', ['menu']),
        ...mapState({
            alert: state => state.alert
        })
    },
    methods: {
        ...mapActions({ clearAlert: 'alert/clear' }),
        ...mapActions('system', ['loadIsActivated', 'loadSystemConfigs', 'loadMessages', 'loadTimezones'])
    },
    watch: {
        $route (to, from){
            // clear alert on location change
            this.clearAlert();
        },
        activated (active) {
            console.log('App.watch.activated: received: '+active);
            if (!active) this.$router.replace('/activate');
        }
    },
    created() {
        this.loadIsActivated();
        this.loadSystemConfigs();  // determine if we can show the registration link

        // todo: allow user to choose locale
        const locale = 'detect';
        this.loadMessages('pre_auth', locale);
        this.loadMessages('countries', locale);
        this.loadMessages('timezones', locale);
        this.loadTimezones();
    }
};
</script>