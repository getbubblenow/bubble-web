<template>
    <div>
        <div v-if="user && user.admin">
            <h3>{{messages.form_title_mitm}}: {{mitmEnabled ? messages.message_mitm_enabled : messages.message_mitm_disabled}}</h3>
            <button v-if="mitmEnabled" :disabled="loading()" @click="mitmOff()">{{messages.button_label_mitm_disable}}</button>
            <button v-else :disabled="loading()" @click="mitmOn()">{{messages.button_label_mitm_enable}}</button>
            <div v-if="errors.has('mitm')" class="invalid-feedback d-block">{{ errors.first('mitm') }}</div>
            <hr/>
        </div>

        <div>
            <h4>{{messages.message_download_ca_cert}}</h4>
            <a href="/api/auth/cacert?type=pem">{{messages.message_os_apple}}</a> |
            <a href="/api/auth/cacert?type=p12">{{messages.message_os_windows}}</a> |
            <a href="/api/auth/cacert?type=cer">{{messages.message_os_android}}</a> |
            <a href="/api/auth/cacert?type=crt">{{messages.message_os_linux}}</a>
            <hr/>
        </div>

        <em v-if="loading()">{{messages.loading_apps}}</em>
        <div v-if="apps && apps.length > 0">
            <h2>{{messages.table_title_apps}}</h2>
            <table border="1">
                <thead>
                <tr>
                    <th nowrap="nowrap">{{messages.label_field_app_name}}</th>
                    <th nowrap="nowrap">{{messages.label_field_app_description}}</th>
                    <th nowrap="nowrap">{{messages.label_field_app_enabled}}</th>
                    <th><!-- control button --></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="app in apps">
                    <td nowrap="nowrap">{{app.name}}</td>
                    <td>{{app.description}}</td>
                    <td>{{messages['message_'+app.enabled]}}</td>
                    <td v-if="app.enabled">
                        <button @click="disableApp(app.name)">{{messages.button_label_app_disable}}</button>
                    </td>
                    <td v-else>
                        <button @click="enableApp(app.name)">{{messages.button_label_app_enable}}</button>
                    </td>
                </tr>
                </tbody>
            </table>
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
            ...mapState('apps', ['mitmEnabled', 'apps', 'app']),
            ...mapState('system', ['messages'])
        },
        created () {
            this.getMitmStatus({
                userId: this.user.uuid,
                messages: this.messages,
                errors: this.errors
            });
            this.getAppsByUserId({
                userId: this.user.uuid,
                messages: this.messages,
                errors: this.errors
            });
        },
        methods: {
            ...mapActions('apps', [
                'getMitmStatus', 'enableMitm', 'disableMitm',
                'getAppsByUserId', 'enableAppByUserId', 'disableAppByUserId'
            ]),
            ...mapGetters('apps', ['loading']),
            mitmOn () {
                this.errors.clear();
                this.enableMitm({
                    userId: this.user.uuid,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            mitmOff () {
                this.errors.clear();
                this.disableMitm({
                    userId: this.user.uuid,
                    messages: this.messages,
                    errors: this.errors
                });
            },
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
                this.getAppsByUserId({
                    userId: this.user.uuid,
                    messages: this.messages,
                    errors: this.errors
                });
            }
        }
    };
</script>