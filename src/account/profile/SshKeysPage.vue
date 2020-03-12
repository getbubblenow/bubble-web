<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://bubblev.com/bubble-license/ -->
<template>
    <div>
        <h4>{{messages.form_title_ssh_keys}}<span v-if="this.me === false"> - {{this.userId}}</span></h4>
        <table border="1">
            <thead>
            <tr>
                <td>{{messages.field_label_ssh_key_name}}</td>
<!--                <td>{{messages.field_label_ssh_key_public_key_hash}}</td>-->
                <td>{{messages.field_label_ssh_key_expiration}}</td>
                <td><!-- delete --></td>
            </tr>
            </thead>
            <tbody v-if="sshKeys">
            <tr v-for="key in sshKeys">
                <td>{{key.name}}</td>
<!--                <td><small>{{key.sshPublicKeyHash}}</small></td>-->
                <td nowrap="nowrap">
                    <span v-if="key.expiration">{{messages.date_format_ssh_key_expiration.parseDateMessage(key.expiration, messages)}}</span>
                    <span v-else>{{messages.message_ssh_key_no_expiration}}</span>
                </td>
                <td>
                    <i @click="removeSshKey(key.uuid)" aria-hidden="true" :class="messages.button_label_remove_ssh_key_icon" :title="messages.button_label_remove_ssh_key"></i>
                    <span class="sr-only">{{messages.button_label_remove_ssh_key}}</span>
                </td>
            </tr>
            </tbody>
        </table>

        <hr/>

        <form @submit.prevent="addSshKey">
            <h4>{{messages.form_title_add_ssh_key}}</h4>
            <div class="form-group">
                <label htmlFor="name">{{messages.field_label_ssh_key_name}}</label>
                <input v-validate="'required'" v-model="name" name="name" class="form-control"/>
                <div v-if="submitted && errors.has('name')" class="invalid-feedback d-block">{{ errors.first('name') }}</div>
            </div>

            <div class="form-group">
                <label htmlFor="sshPublicKey">{{messages.field_label_ssh_key_public_key}}</label>
                <textarea v-validate="'required'" v-model="sshPublicKey" name="name" class="form-control" cols="50"></textarea>
                <div v-html="messages.field_description_ssh_key_public_key"></div>
                <div v-if="submitted && errors.has('sshPublicKey')" class="invalid-feedback d-block">{{ errors.first('sshPublicKey') }}</div>
            </div>

            <div class="form-group">
                <label htmlFor="expiration">{{messages.field_label_ssh_key_expiration}}</label>
                <datetime v-model="expiration" input-id="expiration" input-class="form-control" :min-datetime="minExpiration" :phrases="dateControlPhrases" :zone="timezone" :week-start="parseInt(messages.datecontrol_weekstart)"></datetime>
                <div v-html="messages.field_description_ssh_key_expiration"></div>
                <div v-if="submitted && errors.has('expiration')" class="invalid-feedback d-block">{{ errors.first('expiration') }}</div>
            </div>

            <div class="form-group">
                <button class="btn btn-primary" :disabled="loading() || !newKeyValid">{{messages.button_label_add_ssh_key}}</button>
                <img v-show="loading()" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>

        </form>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../../_helpers';
    import { Settings } from 'luxon';

    export default {
        data() {
            return {
                me: null,
                userId: null,
                linkPrefix: null,
                submitted: false,
                currentUser: util.currentUser(),
                name: null,
                expiration: null,
                sshPublicKey: null,
                minExpiration: (new Date()).toISOString(),
                timezone: null
            };
        },
        computed: {
            ...mapState('system', ['messages', 'detectedTimezone', 'detectedLocale']),
            ...mapState('users', ['user', 'sshKeys']),
            newKeyValid () {
                return (this.name !== null && this.name !== '')
                && (this.sshPublicKey !== null && this.sshPublicKey !== '' && this.sshPublicKey.startsWith('ssh-rsa '));
            },
            dateControlPhrases () {
                return {ok: this.messages.message_datecontrol_ok, cancel: this.messages.message_datecontrol_cancel};
            }
        },
        methods: {
            ...mapActions('system', ['detectTimezone', 'detectLocale']),
            ...mapActions('users', ['addSshKeyByUserId', 'removeSshKeyByUserId', 'listSshKeysByUserId']),
            ...mapGetters('users', ['loading']),
            addSshKey (e) {
                this.errors.clear();
                this.submitted = true;
                this.addSshKeyByUserId({
                    userId: this.userId,
                    sshKey: {
                        name: this.name,
                        sshPublicKey: this.sshPublicKey,
                        expirationISO8601: this.expiration
                    },
                    messages: this.messages,
                    errors: this.errors
                });
            },
            removeSshKey (keyId) {
                this.removeSshKeyByUserId({
                    userId: this.userId,
                    sshKeyId: keyId,
                    messages: this.messages,
                    errors: this.errors
                });
            },
        },
        watch: {
            detectedLocale (locale) {
                if (locale) {
                    Settings.defaultLocale = util.jsLocale(this.user, locale);
                }
            },
            detectedTimezone (tz) {
                if (tz) this.timezone = tz.timeZoneId;
            }
        },
        created () {
            if (this.detectedTimezone === null || !this.detectedTimezone.hasOwnProperty('timeZoneId')) {
                this.detectTimezone();
            } else {
                this.timezone = this.detectedTimezone.timeZoneId;
            }

            if (util.validateAccount(this)) {
                this.listSshKeysByUserId({userId: this.userId, messages: this.messages, errors: this.errors});
            }
        }
    };
</script>