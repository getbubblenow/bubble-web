<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://bubblev.com/bubble-license/ -->
<template>
    <div>
        <h2>{{messages.form_title_register}}</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="name">{{messages.field_label_username}}</label>
                <input type="text" v-model="user.name" v-validate="'required'" name="name" class="form-control" :class="{ 'is-invalid': submitted && errors.has('name') }" />
                <div v-if="submitted && errors.has('name')" class="invalid-feedback">{{ errors.first('name') }}</div>
            </div>
            <div class="form-group">
                <label htmlFor="password">{{messages.field_label_password}}</label>
                <input type="password" v-model="user.password" v-validate="{ required: true, min: 6 }" name="password" class="form-control" :class="{ 'is-invalid': submitted && errors.has('password') }" />
                <div v-if="submitted && errors.has('password')" class="invalid-feedback">{{ errors.first('password') }}</div>
            </div>
            <div class="form-group">
                <label for="email">{{messages.field_label_email}}</label>
                <input type="text" v-model="user.contact.info" v-validate="'required'" name="email" class="form-control" :class="{ 'is-invalid': submitted && errors.has('email') }" />
                <div v-if="submitted && errors.has('email')" class="invalid-feedback">{{ errors.first('email') }}</div>
            </div>
            <div class="form-group" v-if="promoCodesEnabled">
                <label for="promoCode">{{messages.field_label_promoCode}}</label>
                <input type="text" v-model="user.promoCode" v-validate="{required: promoCodeRequired}" name="promoCode" class="form-control" :class="{ 'is-invalid': submitted && errors.has('promoCode') }" />
                <div v-if="submitted && errors.has('promoCode')" class="invalid-feedback">{{ errors.first('promoCode') }}</div>
            </div>
            <div class="form-group">
                <label for="user.contact.receiveInformationalMessages">{{messages.field_label_receiveInformationalMessages}}</label>
                <input type="checkbox" id="user.contact.receiveInformationalMessages" v-model="user.contact.receiveInformationalMessages">
            </div>
            <div class="form-group">
                <label for="user.contact.receivePromotionalMessages">{{messages.field_label_receivePromotionalMessages}}</label>
                <input type="checkbox" id="user.contact.receivePromotionalMessages" v-model="user.contact.receivePromotionalMessages">
            </div>
            <div class="form-group">
                <label for="user.agreeToTerms" v-html="messages.field_label_agreeToTerms"></label>
                <input type="checkbox" id="user.agreeToTerms" v-model="user.agreeToTerms">
                <div v-if="submitted && errors.has('terms')" class="invalid-feedback d-block">{{ errors.first('terms') }}</div>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="status.registering">{{messages.button_label_register}}</button>
                <img v-show="status.registering" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                <router-link to="/login" class="btn btn-link">{{messages.button_label_cancel}}</router-link>
            </div>
        </form>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
    data () {
        return {
            user: {
                name: '',
                password: '',
                contact: {
                    type: 'email',
                    info: '',
                    receiveInformationalMessages: false,
                    receivePromotionalMessages: false
                },
                agreeToTerms: null,
                promoCode: null
            },
            submitted: false
        }
    },
    computed: {
        ...mapState('account', ['status']),
        ...mapState('system', ['messages', 'countries'])
    },
    methods: {
        ...mapActions('account', ['register']),
        ...mapGetters('system', ['promoCodesEnabled', 'promoCodeRequired']),
        handleSubmit(e) {
            this.submitted = true;
            this.$validator.validate().then(valid => {
                if (valid) {
                    this.register({user: this.user, messages: this.messages, errors: this.errors});
                }
            });
        }
    }
};
</script>
