<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://bubblev.com/bubble-license/ -->
<template>
    <div>
        <h2>{{messages.message_action_processing}} {{messages['message_inbound_'+actionType]}} ...</h2>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import { util } from '../../_helpers';

    export default {
        data () {
            return {
                userId: null,
                actionType: null
            };
        },
        computed: {
            ...mapState('account', {
                currentUser: state => state.user
            }),
            ...mapState('account', ['actionStatus']),
            ...mapState('system', ['messages'])
        },
        methods: {
            ...mapActions("account", ['approveAction', 'denyAction']),
            ...mapActions('system', ['loadMessages'])
        },
        created () {
            console.log('ActionPage.created: starting. query='+JSON.stringify(this.$route.query));
            let locale = null;
            if (util.userLoggedIn() && util.currentUser().locale) locale = util.currentUser().locale;
            this.loadMessages('pre_auth', locale === null ? 'detect' : locale);

            if (typeof this.$route.query.user !== 'undefined' && this.$route.query.user !== null && this.$route.query.user !== '') {
                this.userId = this.$route.query.user;
            } else {
                this.userId = this.currentUser !== null ? this.currentUser.uuid : util.userLoggedIn() ? util.currentUser().uuid : null;
            }

            if (this.userId === null) {
                console.warn('ActionPage.created: no user found in session or query');
            }
            if (this.$route.query.approve) {
                this.actionType = 'approve';
                console.log('ActionPage.created: calling approveAction');
                this.approveAction({
                    userId: this.userId,
                    code: this.$route.query.approve,
                    data: null,
                    messages: this.messages,
                    errors: this.errors
                });
            } else if (this.$route.query.deny) {
                this.actionType = 'deny';
                console.log('ActionPage.created: calling denyAction');
                this.denyAction({
                    userId: this.userId,
                    code: this.$route.query.deny,
                    messages: this.messages,
                    errors: this.errors
                });
            } else {
                this.$router.push({path:'/me/profile', params: {action: 'invalid'}});
            }
        },
        watch: {
            actionStatus (status) {
                console.log('ActionPage.watch.actionStatus: received: '+JSON.stringify(status));
                if (status.requesting) {
                    console.log('ActionPage.watch.actionStatus: still requesting, doing nothing');
                } else {
                    if (status.success) {
                        console.log('ActionPage.watch.actionStatus: sending to /bubbles with success');
                        this.$router.push({path: '/bubbles', query: {action: this.actionType, ok: 'true'}});

                    } else if (status.error !== null && status.type === 'approve'
                        && this.errors && this.errors.items && this.errors.items.length === 1
                        && this.errors.items[0].field === 'password') {
                        console.log('detected password reset, sending to setPassword page');
                        if (util.userLoggedIn()) {
                            console.log('detected password reset, sending to /me/setPassword page');
                            this.$router.push('/me/setPassword/' + this.$route.query.approve);
                        } else {
                            console.log('detected password reset, sending to /resetPassword page');
                            this.$router.push('/resetPassword/' + this.$route.query.approve + '?user=' + encodeURIComponent(this.userId));
                        }

                    } else {
                        this.$router.push({path: '/me/policy', query: {action: this.actionType}});
                    }
                }
            }
        }
    };
</script>