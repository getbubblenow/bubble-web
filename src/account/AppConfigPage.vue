<template>
    <div>
        App Config Page
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'
    import { util } from '../_helpers';
    import { safeEval } from '../_store';

    export default {
        data () {
            return {
                user: util.currentUser(),
                appId: null,
                viewId: null
            };
        },
        computed: {
            ...mapState('apps', ['app', 'appConfigData', 'actionResult']),
            ...mapState('system', ['messages'])
        },
        created () {
            this.appId = this.$route.params.app;
            this.viewId = this.$route.params.view;
            this.getAppByUserId({
                userId: this.user.uuid,
                appId: this.appId,
                messages: this.messages,
                errors: this.errors
            });
            this.getAppConfigViewByUserId({
                userId: this.user.uuid,
                appId: this.appId,
                viewId: this.viewId,
                messages: this.messages,
                errors: this.errors
            });
        },
        methods: {
            ...mapActions('apps', [
                'getAppByUserId', 'getAppConfigViewByUserId'
            ]),
        },
        watch: {
            appConfigData (configData) {
                if (configData) {

                }
            }
        }
    };
</script>