<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://bubblev.com/bubble-license/ -->
<template>
    <div>
        <em v-if="loading()">{{messages.loading_apps}}</em>
        <div v-if="apps && apps.length > 0">

<!--            <h2>{{messages.table_title_apps}}</h2>-->

            <div v-for="app in apps">
                <router-link :to="{ path: '/app/'+ app.name }"><h3><img width="64" v-if="icons && icons[app.name]" :src="icons[app.name]"/>{{messages['app_'+app.name+'_name']}}</h3></router-link>
                <div v-if="messages['!app_'+app.name+'_summary']"><h5>{{messages['app_'+app.name+'_summary']}}</h5></div>
                <p>{{messages['app_'+app.name+'_description']}}</p>
                <div>
                    {{messages.label_field_app_enabled}}: {{messages['message_'+app.enabled]}}
                    <button v-if="app.enabled" @click="disableApp(app.name)">{{messages.button_label_app_disable}}</button>
                    <button v-else @click="enableApp(app.name)">{{messages.button_label_app_enable}}</button>
                </div>
                <hr/>
            </div>

        </div>
        <div v-if="!apps || apps.length === 0">
            {{messages.message_no_apps}}
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../_helpers';

    export default {
        data () {
            return {
                user: util.currentUser()
            };
        },
        computed: {
            ...mapState('apps', ['mitmEnabled', 'apps', 'app', 'icons']),
            ...mapState('system', ['messages'])
        },
        created () {
            this.getAppsByUserId({
                userId: this.user.uuid,
                messages: this.messages,
                errors: this.errors
            });
        },
        methods: {
            ...mapActions('apps', ['getAppsByUserId', 'enableAppByUserId', 'disableAppByUserId']),
            ...mapGetters('apps', ['loading']),
            enableApp (appId) {
                this.errors.clear();
                this.enableAppByUserId({
                    userId: this.user.uuid,
                    appId: appId,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            disableApp (appId) {
                this.errors.clear();
                this.disableAppByUserId({
                    userId: this.user.uuid,
                    appId: appId,
                    messages: this.messages,
                    errors: this.errors
                });
            }
        },
        watch: {
            app (a) {
                // app was enabled/disabled, refresh apps
                this.getAppsByUserId({
                    userId: this.user.uuid,
                    messages: this.messages,
                    errors: this.errors
                });
            }
        }
    };
</script>