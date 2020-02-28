<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://bubblev.com/bubble-license/ -->
<template>
    <div>
        <h2>{{messages.form_title_forgotPassword}}</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="name">{{messages.field_label_username}}</label>
                <input type="text" v-model="name" :v-validate="'required'" name="name" class="form-control" :class="{ 'is-invalid': submitted && !name }" />
                <div v-show="submitted && !name" class="invalid-feedback">Name is required</div>
                <div v-if="submitted && errors.has('name')" class="invalid-feedback d-block">{{ errors.first('name') }}</div>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="status.sendingResetPasswordMessage === true">{{messages.button_label_resetPassword}}</button>
                <img v-show="status.sendingResetPasswordMessage === true" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>
        </form>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'
    import { util } from '../_helpers'

    export default {
        data () {
            return {
                name: '',
                submitted: false
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