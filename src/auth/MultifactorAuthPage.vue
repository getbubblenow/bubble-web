<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://git.bubblev.org/bubblev/bubble/src/branch/master/LICENSE.md -->
<template>
    <div>
        <h2>{{messages.form_title_multifactor_auth}}</h2>
        <table border="1">
            <thead>
            <tr>
                <td>{{messages.field_label_policy_contact_nick}}</td>
                <td>{{messages.field_label_policy_contact_type}}</td>
                <td>{{messages.field_label_policy_contact_verify_code}}</td>
            </tr>
            </thead>
            <tbody>
            <tr v-for="auth in currentUser.multifactorAuth">
                <td>{{auth.nick}}</td>
                <td>{{messages['field_label_policy_contact_type_'+auth.type]}}</td>
                <td>
                    <form @submit.prevent="submitVerification(auth)">
                        <label htmlFor="verifyCode">{{messages.field_label_policy_contact_verify_code}}</label>
                        <input :disabled="actionStatus.requesting" :id="'verifyContactCode_'+auth.uuid" v-validate="'required'" name="verifyCode" type="text" size="8"/>
                        <button class="btn btn-primary" :disabled="actionStatus.requesting">{{messages.button_label_submit_verify_code}}</button>
                    </form>
                </td>
            </tr>
            <tr v-if="errors.has('token')">
                <td colspan="3">
                    <div v-if="errors.has('token')" class="invalid-feedback d-block">{{ errors.first('token') }}</div>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'
    import { util } from '../_helpers';

    // convenience methods
    import { isAuthenticator, isNotAuthenticator } from '../_store/users.module';
    window.isAuthenticator = isAuthenticator;
    window.isNotAuthenticator = isNotAuthenticator;

    export default {
        data() {
            return { username: null }
        },
        computed: {
            ...mapState('account', {
                currentUser: state => state.user
            }),
            ...mapState('account', ['actionStatus']),
            ...mapState('system', ['messages'])
        },
        methods: {
            ...mapActions('account', [
                'refreshUser', 'approveAction', 'denyAction', 'sendAuthenticatorCode'
            ]),
            isAuthenticator(val) { return window.isAuthenticator(val); },
            isNotAuthenticator(val) { return window.isNotAuthenticator(val); },
            getLandingPage() { return util.getLandingPage(); },
            resetLandingPage() { return util.resetLandingPage(); },
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
                            userId: this.username,
                            code: code,
                            authOnly: null,
                            verifyOnly: false,
                            messages: this.messages,
                            errors: this.errors
                        });
                    } else {
                        this.approveAction({
                            userId: this.username,
                            code: code,
                            data: null,
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
            currentUser (u) {
                // console.log('watch.user: received: '+JSON.stringify(u));
                if (u.name) this.username = u.name;
                if (u.token) {
                    const landing = this.getLandingPage();
                    if (landing === null) {
                        this.$router.replace('/');
                    } else {
                        this.resetLandingPage();
                        this.$router.replace(landing.fullPath);
                    }
                }
            },
            actionStatus (status) {
                // console.log('watch.actionStatus: received: '+JSON.stringify(status));
                if (status.requesting) return;
                if (status.success) {
                    console.log('watch.actionStatus: success, refreshing user');
                    this.refreshUser();
                }
            }
        },
        created () {
            this.refreshUser();
        }
    };
</script>