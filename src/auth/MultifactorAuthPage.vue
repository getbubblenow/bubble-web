<template>
    <div>
        <h2>{{messages.form_title_multifactor_auth}}</h2>
        <div v-for="auth in currentUser.multifactorAuth">
            <table border="1">
                <thead>
                <tr>
                    <td>{{messages.field_label_policy_contact_nick}}</td>
                    <td>{{messages.field_label_policy_contact_type}}</td>
                    <td>{{messages.field_label_policy_contact_verify_code}}</td>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{{auth.nick}}</td>
                    <td>{{messages['field_label_policy_contact_type_'+auth.type]}}</td>
                    <td>
                        <form @submit.prevent="submitVerification(auth)">
                            <label htmlFor="verifyCode">{{messages.field_label_policy_contact_verify_code}}</label>
                            <input :disabled="actionStatus.requesting" :id="'verifyContactCode_'+auth.uuid" v-validate="'required'" name="verifyCode" type="text" size="8"/>
                            <div v-if="errors.has('token')" class="invalid-feedback d-block">{{ errors.first('token') }}</div>
                            <button class="btn btn-primary" :disabled="actionStatus.requesting">{{messages.button_label_submit_verify_code}}</button>
                        </form>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'

    // convenience methods
    import { isAuthenticator, isNotAuthenticator } from '../_store/users.module';
    window.isAuthenticator = isAuthenticator;
    window.isNotAuthenticator = isNotAuthenticator;

    export default {
        data() { return { currentUser: {} } },
        computed: {
            ...mapState('account', ['user']),
            ...mapState('system', ['messages'])
        },
        methods: {
            ...mapActions('account', [
                'refreshUser', 'actionStatus', 'approveAction', 'denyAction', 'sendAuthenticatorCode'
            ]),
            isAuthenticator(val) { return window.isAuthenticator(val); },
            isNotAuthenticator(val) { return window.isNotAuthenticator(val); },
            submitVerification(auth) {
                const uuid = auth.uuid;
                const type = auth.type;
                const codeElementId = 'verifyContactCode_'+uuid;
                const codeElement = document.getElementById(codeElementId);
                if (codeElement != null) {
                    const code = codeElement.value;
                    this.errors.clear();
                    if (isAuthenticator(type)) {
                        console.log('submitVerification: sending authenticator code: '+code);
                        this.sendAuthenticatorCode({
                            uuid: this.currentUser.name,
                            code: code,
                            verifyOnly: false,
                            messages: this.messages,
                            errors: this.errors
                        });
                    } else {
                        this.approveAction({
                            uuid: this.currentUser.name,
                            code: code,
                            messages: this.messages,
                            errors: this.errors
                        });
                    }
                } else {
                    console.log('submitVerification: DOM element not found: '+codeElementId);
                }
            }
        },
        watch: {
            user: function (u) {
                this.currentUser = u;
                // todo: if current user has no multifactor auth, show fatal error
            },
            actionStatus (status) {
                console.log('watch.actionStatus: received: '+JSON.stringify(status));
                if (status.success) {
                    // are we logged in? go to home page if we now have a session token
                }
            }
        },
        created () {
            this.refreshUser();
        }
    };
</script>