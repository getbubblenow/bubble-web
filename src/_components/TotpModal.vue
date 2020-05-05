<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div v-if="showTotpModal === true" class="totp-modal">
        <h3>{{messages.form_title_totp_modal}}</h3>
        <form @submit.prevent="sendTotpToken()">
            <h5>{{messages.field_description_totp_code}}</h5>
            <div class="form-group">
                <label htmlFor="token">{{messages.field_label_totp_code}}</label>
                <input v-model="token" name="token" class="form-control" width="10"/>
                <div v-if="submitted && errors.has('totpToken')" class="invalid-feedback d-block">{{ errors.first('totpToken') }}</div>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="status.authenticating || token === null || token.length < 6">
                    {{messages.button_label_submit_totp_code}}
                </button>
                <img v-show="status.authenticating" :src="loadingImgSrc" />
            </div>
        </form>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import { util } from '../_helpers';
    import { loadingImgSrc } from '../_store';

    export default {
        data() {
            return {
                submitted: false,
                token: '',
                refresher: null,
                showTotpModal: false,
                loadingImgSrc: loadingImgSrc
            };
        },
        created() {
            this.refreshTotpModal(this);
            this.refresher = setInterval(() => this.refreshTotpModal(this), 1000);
        },
        beforeDestroy () {
            clearInterval(this.refresher);
        },
        computed: {
            ...mapState('system', ['messages']),
            ...mapState('account', ['status']),
        },
        methods: {
            ...mapActions('account', ['sendAuthenticatorCode']),
            refreshTotpModal(vue) {
                if (typeof window.showTotpModal !== 'undefined') {
                    if (window.showTotpModal === true && vue.showTotpModal !== true) {
                        vue.showTotpModal = true;
                    } else if (window.showTotpModal === false && vue.showTotpModal !== false) {
                        vue.showTotpModal = false;
                        delete window['showTotpModal'];
                    }
                }
            },
            sendTotpToken () {
                this.submitted = true;
                this.sendAuthenticatorCode({
                    userId: util.currentUser().uuid,
                    code: this.token,
                    authOnly: true,
                    messages: this.messages,
                    errors: this.errors
                });
            }
        }
    }
</script>