<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div>
        <h2>{{messages.form_title_forgotPassword}}</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="name">{{messages.field_label_email}}</label>
                <input type="text" v-model="name" :v-validate="'required'" name="name" class="form-control" :class="{ 'is-invalid': submitted && !name }" />
                <div v-show="submitted && !name" class="invalid-feedback">Name is required</div>
                <div v-if="submitted && errors.has('name')" class="invalid-feedback d-block">{{ errors.first('name') }}</div>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="status.sendingResetPasswordMessage === true">{{messages.button_label_resetPassword}}</button>
                <img v-show="status.sendingResetPasswordMessage === true" :src="loadingImgSrc" />
            </div>
        </form>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'
    import { util } from '../_helpers'
    import { loadingImgSrc } from '../_store';

    export default {
        data () {
            return {
                name: '',
                submitted: false,
                loadingImgSrc: loadingImgSrc
            }
        },
        computed: {
            ...mapState('system', ['configs', 'messages']),
            ...mapState('account', ['status', 'resetPasswordMessageSent']),
        },
        methods: {
            ...mapActions('account', ['forgotPassword']),
            handleSubmit (e) {
                this.errors.clear();
                this.submitted = true;
                if (this.name) {
                    this.forgotPassword({username: this.name, messages: this.messages, errors: this.errors});
                }
            }
        },
        watch: {
            resetPasswordMessageSent (m) {
                if (m === true) this.$router.push('/login');
            }
        }
    };
</script>