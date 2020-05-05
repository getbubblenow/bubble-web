<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div>
        <h2>{{messages.form_title_change_password}}<span v-if="this.me === false"> - {{this.userId}}</span></h2>

        <form @submit.prevent="changePass()">
            <div v-if="me && requiredExternalAuthContacts.length > 0">
                <div class="form-group">
                    <p>{{messages.message_change_password_external_auth}}</p>
                    <div v-for="contact in requiredExternalAuthContacts">
                        {{messages['field_label_'+contact.type]}}: {{contact.info}}
                    </div>
                </div>
                <div v-if="me && hasRequiredAuthenticator" class="form-group">
                    <p>{{messages.message_change_password_authenticator_auth}}</p>
                    <label htmlFor="totpToken">{{messages.field_label_totp_code}}</label>
                    <input v-validate="'required'" v-model="totpToken" name="totpToken" class="form-control"/>
                    <div v-if="submitted && errors.has('totpToken')" class="invalid-feedback d-block">{{ errors.first('totpToken') }}</div>
                </div>
                <div class="form-group">
                    <button class="btn btn-primary" :disabled="loading()">{{messages.button_label_request_password_reset}}</button>
                    <img v-show="loading()" :src="loadingImgSrc" />
                </div>
            </div>
            <div v-else>
                <div v-if="me && hasRequiredAuthenticator">
                    <p>{{messages.message_change_password_authenticator_auth}}</p>
                    <label htmlFor="totpToken">{{messages.field_label_totp_code}}</label>
                    <input v-validate="'required'" v-model="totpToken" name="totpToken" class="form-control"/>
                    <div v-if="submitted && errors.has('totpToken')" class="invalid-feedback d-block">{{ errors.first('totpToken') }}</div>
                </div>

                <div v-if="me || user.admin" class="form-group">
                    <label htmlFor="currentPassword">{{messages.field_label_current_password}}</label>
                    <input type="password" v-validate="'required'" v-model="currentPassword" name="currentPassword" class="form-control"/>
                    <div v-if="submitted && errors.has('oldPassword')" class="invalid-feedback d-block">{{ errors.first('oldPassword') }}</div>
                    <div v-if="submitted && errors.has('currentPassword')" class="invalid-feedback d-block">{{ errors.first('currentPassword') }}</div>
                </div>

                <div class="form-group">
                    <label htmlFor="newPassword">{{messages.field_label_new_password}}</label>
                    <input type="password" v-validate="'required'" v-model="newPassword" name="newPassword" class="form-control"/>
                    <div v-if="submitted && errors.has('password')" class="invalid-feedback d-block">{{ errors.first('password') }}</div>
                </div>
                <div class="form-group">
                    <label htmlFor="newPasswordConfirm">{{messages.field_label_new_password_confirm}}</label>
                    <input type="password" v-validate="'required'" v-model="newPasswordConfirm" name="newPasswordConfirm" class="form-control"/>
                </div>

                <div class="form-group">
                    <button class="btn btn-primary" :disabled="loading()">{{messages.button_label_change_password}}</button>
                    <img v-show="loading()" :src="loadingImgSrc" />
                </div>
            </div>

        </form>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../../_helpers';
    import { loadingImgSrc } from '../../_store';

    export default {
        data() {
            return {
                submitted: false,
                me: null,
                linkPrefix: null,
                userId: null,
                currentUser: util.currentUser(),
                currentPassword: null,
                newPassword: null,
                newPasswordConfirm: null,
                totpToken: null,
                hasRequiredAuthenticator: null,
                hasRequiredExternalAuth: null,
                requiredExternalAuthContacts: [],
                loadingImgSrc: loadingImgSrc
            }
        },
        computed: {
            ...mapState('users', ['user', 'policy', 'changePasswordResponse']),
            ...mapState('system', ['messages'])
        },
        methods: {
            ...mapActions('users', ['getUserById', 'getPolicyByUserId', 'changePassword', 'adminChangePassword']),
            ...mapGetters('users', ['loading']),
            changePass (e) {
                this.submitted = true;
                this.errors.clear();
                // todo: validate that newPassword and newPasswordConfirm match
                if (this.me) {
                    this.changePassword({
                        request: {
                            oldPassword: this.currentPassword,
                            newPassword: this.newPassword,
                            totpToken: this.totpToken
                        },
                        messages: this.messages,
                        errors: this.errors
                    });
                } else if (this.currentUser.admin) {
                    this.adminChangePassword({
                        userId: this.userId,
                        request: {
                            oldPassword: this.currentPassword,
                            newPassword: this.newPassword,
                            totpToken: this.totpToken
                        },
                        messages: this.messages,
                        errors: this.errors
                    });
                } else {
                    // should never happen
                    console.warn('Not current user and not admin, API call would fail anyway, not sending');
                }
                console.log('changePass called');
            }
        },
        created () {
            if (util.validateAccount(this)) {
                this.getUserById({userId: this.userId, messages: this.messages, errors: this.errors});
                this.getPolicyByUserId({userId: this.userId, messages: this.messages, errors: this.errors});
            }
        },
        watch: {
            policy (p) {
                if (p) {
                    const contacts = [];
                    if (p.accountContacts && p.accountContacts.length > 0) {
                        for (let i=0; i<p.accountContacts.length; i++) {
                            const contact = p.accountContacts[i];
                            if (contact.type !== 'authenticator' && contact.requiredForAccountOperations === true && contact.info) {
                                contacts.push(contact);
                            } else if (contact.type === 'authenticator' && contact.requiredForAccountOperations === true) {
                                this.hasRequiredAuthenticator = true;
                            }
                        }
                    }
                    console.log('watch.policy: setting requiredExternalAuthContacts = '+JSON.stringify(contacts));
                    this.requiredExternalAuthContacts = contacts;
                }
            },
            changePasswordResponse (r) {
                if (r) {
                    console.log('watch.changePasswordResponse: received '+JSON.stringify(r));
                }
            }
        }
    };
</script>