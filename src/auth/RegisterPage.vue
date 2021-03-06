<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div>
        <h2>{{messages.form_title_register}}</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="email">{{messages.field_label_email}}</label>
                <input type="text" v-model="user.email" v-validate="'required'" name="email" class="form-control" :class="{ 'is-invalid': submitted && errors.has('email') }" />
                <div v-if="submitted && errors.has('email')" class="invalid-feedback d-block">{{ errors.first('email') }}</div>
            </div>
            <div class="form-group">
                <label htmlFor="password">{{messages.field_label_password}}</label>
                <input type="password" v-model="user.password" v-validate="{ required: true, min: 6 }" name="password" class="form-control" :class="{ 'is-invalid': submitted && errors.has('password') }" />
                <div v-if="submitted && errors.has('password')" class="invalid-feedback d-block">{{ errors.first('password') }}</div>
                <span class="bubble-field-help" v-html="messages.field_label_password_guidance"></span>
            </div>
            <div class="form-group">
                <label htmlFor="password">{{messages.field_label_confirm_password}}</label>
                <input type="password" v-model="confirmPassword" v-validate="{ required: true, min: 6 }" name="confirmPassword" class="form-control" :class="{ 'is-invalid': submitted && errors.has('confirmPassword') }" />
                <div v-if="submitted && errors.has('confirmPassword')" class="invalid-feedback d-block">{{ errors.first('confirmPassword') }}</div>
            </div>
            <div class="form-group" v-if="promoCodesEnabled">
                <label for="promoCode">{{messages.field_label_promoCode}}</label>
                <input type="text" v-model="user.promoCode" v-validate="{required: promoCodeRequired}" name="promoCode" class="form-control" :class="{ 'is-invalid': submitted && errors.has('promoCode') }" />
                <div v-if="submitted && errors.has('promoCode')" class="invalid-feedback d-block">{{ errors.first('promoCode') }}</div>
                <small><a :href="messages.message_request_promoCode_link">{{messages.message_request_promoCode}}</a></small>
            </div>
            <div class="form-group">
                <label for="user.agreeToTerms" v-html="messages.field_label_agreeToTerms"></label>
                <input type="checkbox" id="user.agreeToTerms" v-model="user.agreeToTerms">
                <div v-if="submitted && errors.has('terms')" class="invalid-feedback d-block">{{ errors.first('terms') }}</div>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="status.registering">{{messages.button_label_register}}</button>
                <img v-show="status.registering" :src="loadingImgSrc" />
                <router-link to="/login" class="btn btn-link">{{messages.button_label_cancel}}</router-link>
            </div>

            <hr/>
            <div class="form-group">
                <label for="user.receiveInformationalMessages">{{messages.field_label_receiveInformationalMessages}}</label>
                <input type="checkbox" id="user.receiveInformationalMessages" v-model="user.receiveInformationalMessages">
            </div>
            <div class="form-group">
                <label for="user.receivePromotionalMessages">{{messages.field_label_receivePromotionalMessages}}</label>
                <input type="checkbox" id="user.receivePromotionalMessages" v-model="user.receivePromotionalMessages">
            </div>
        </form>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { util } from '~/_helpers';
import { loadingImgSrc } from '~/_store';

export default {
    data () {
        return {
            user: {
                email: '',
                password: '',
                receiveInformationalMessages: false,
                receivePromotionalMessages: false,
                agreeToTerms: null,
                promoCode: null
            },
            payMethods: null,
            selectedPaymentMethod: null,
            paymentMethodObject: null,
            confirmPassword: '',
            submitted: false,
            loadingImgSrc: loadingImgSrc
        }
    },
    computed: {
        ...mapState('account', ['status']),
        ...mapState('system', ['messages', 'countries']),
        ...mapState('plans', ['plans', 'plan']),
        ...mapState('paymentMethods', ['paymentMethods', 'paymentMethod', 'accountPaymentMethod', 'paymentInfo'])
    },
    created () {
        if (this.$route.query.plan) {
            this.getAllPaymentMethods(this.messages, this.errors);
            this.getPlanById({
                planId: this.$route.query.plan,
                messages: this.messages,
                errors: this.errors
            });
        }
    },
    methods: {
        ...mapActions('account', ['register']),
        ...mapActions('plans', ['getPlanById']),
        ...mapActions('paymentMethods', ['getAllPaymentMethods', 'setPaymentMethod']),
        ...mapGetters('system', ['promoCodesEnabled', 'promoCodeRequired']),
        handleSubmit(e) {
            this.errors.clear();
            if (util.checkSkipRegistration()) {
                return;
            }
            this.submitted = true;
            this.$validator.validate().then(valid => {
                if (valid) {
                    if (this.user.password !== this.confirmPassword) {
                        this.errors.add({field: 'confirmPassword', msg: this.messages['err_confirmPassword_mismatch']})
                    } else {
                        this.register({
                            user: this.user,
                            messages: this.messages,
                            errors: this.errors
                        });
                    }
                }
            });
        }
    },
    watch: {
        paymentMethods (pms) {
            if (pms && pms.length) {
                const okMethods = [];
                for (let i=0; i<pms.length; i++) {
                    const pm = pms[i];
                    if (!pm.driverClass.endsWith('NoopCloud')) {
                        okMethods.push(pm);
                    }
                }
                if (okMethods.length === 1) {
                    this.selectedPaymentMethod = okMethods[0];
                    this.setPaymentMethod(okMethods[0]);
                }
                this.payMethods = okMethods;
            }
        },
        accountPaymentMethod (apm) {
            if (apm) {
                this.paymentMethodObject = apm;
            }
        },
        plan (p) {
            if (p.uuid) {
                this.user.preferredPlan = p.uuid;
            }
        }
    }
};
</script>
