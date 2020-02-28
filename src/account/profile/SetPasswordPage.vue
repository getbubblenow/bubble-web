<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://bubblev.com/bubble-license/ -->
<template>
    <div>
        <h2>{{messages.form_title_set_password}}</h2>

        <h4 v-if="submitted && errors.has('approvalToken')" class="invalid-feedback d-block">{{ errors.first('approvalToken') }}</h4>

        <form @submit.prevent="setPass()">
            <div class="form-group">
                <label htmlFor="newPassword">{{messages.field_label_new_password}}</label>
                <input type="password" v-validate="'required'" v-model="newPassword" name="newPassword" class="form-control"/>
                <div v-if="submitted && errors.has('password')" class="invalid-feedback d-block">{{ errors.first('password') }}</div>
            </div>
            <div class="form-group">
                <label htmlFor="newPasswordConfirm">{{messages.field_label_new_password_confirm}}</label>
                <input type="password" v-validate="'required'" v-model="newPasswordConfirm" name="newPasswordConfirm" class="form-control"/>
            </div>

            <div v-if="showTotp" class="form-group">
                <p>{{messages.message_set_password_authenticator_auth}}</p>
                <label htmlFor="totpToken">{{messages.field_label_totp_code}}</label>
                <input v-validate="'required'" v-model="totpToken" name="totpToken" class="form-control"/>
                <div v-if="submitted && errors.has('totpToken')" class="invalid-feedback d-block">{{ errors.first('totpToken') }}</div>
            </div>

            <div class="form-group">
                <button class="btn btn-primary" :disabled="loading()">{{messages.button_label_set_password}}</button>
                <img v-show="loading()" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>

        </form>

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../../_helpers';

    export default {
        data() {
            return {
                submitted: false,
                userId: null,
                newPassword: null,
                newPasswordConfirm: null,
                code: null,
                showTotp: false,
                totpToken: null
            }
        },
        computed: {
            ...mapState("account", ['actionStatus']),
            ...mapState('users', ['user', 'policy', 'changePasswordResponse']),
            ...mapState('system', ['messages'])
        },
        methods: {
            ...mapActions("account", ['approveAction', 'denyAction']),
            ...mapActions('users', ['getUserById', 'getPolicyByUserId', 'changePassword']),
            ...mapGetters('users', ['loading']),
            setPass (e) {
                // todo: verify that newPassword === newPasswordConfirm
                this.errors.clear();
                this.submitted = true;
                const dataParams = [{name: 'password', value: this.newPassword}];
                if (this.totpToken) {
                    dataParams.push({name: 'totpToken', value: this.totpToken});
                }
                this.approveAction({
                    userId: this.userId,
                    code: this.code,
                    data: dataParams,
                    messages: this.messages,
                    errors: this.errors,
                    enableTotpModal: false
                })
            }
        },
        created() {
            if (typeof this.$route.params.code === 'undefined' || this.$route.params.code === null || this.$route.params.code === '') {
                console.log('SetPasswordPage: no code found, sending to home');
                this.$router.push('/');
            }
            this.code = this.$route.params.code;

            if (typeof this.$route.query.user !== 'undefined' && this.$route.query.user !== null && this.$route.query.user !== '') {
                this.userId = this.$route.query.user;
            } else {
                this.userId = this.currentUser !== null ? this.currentUser.uuid : util.userLoggedIn() ? util.currentUser().uuid : null;
            }
            if (this.userId === null) {
                console.warn('SetPasswordPage.created: no user found in session or query');
            }
        },
        watch: {
            actionStatus (status) {
                if (status) {
                    console.log('SetPasswordPage.watch.actionStatus: received: ' + JSON.stringify(status));
                    if (status.error
                        && status.error.length > 0
                        && status.error.filter(e => e === 'err_totpToken_required' || e === 'err_totpToken_invalid')) {
                        console.log('SetPasswordPage.watch.actionStatus: set this.showTotp='+this.showTotp);
                        this.showTotp = true;
                    } else if (status.success && status.success === true) {
                        console.log('SetPasswordPage.watch.actionStatus: success, sending to home');
                        this.$router.push('/');
                    }
                }
            }
        }
    }
</script>