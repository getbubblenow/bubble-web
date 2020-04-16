<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div>
        <h2>{{messages.form_title_register}}</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="name">{{messages.field_label_username}}</label>
                <input type="text" v-model="user.name" v-validate="'required'" name="name" class="form-control" :class="{ 'is-invalid': submitted && errors.has('name') }" />
                <div v-if="submitted && errors.has('name')" class="invalid-feedback d-block">{{ errors.first('name') }}</div>
            </div>
            <div class="form-group">
                <label htmlFor="password">{{messages.field_label_password}}</label>
                <input type="password" v-model="user.password" v-validate="{ required: true, min: 6 }" name="password" class="form-control" :class="{ 'is-invalid': submitted && errors.has('password') }" />
                <div v-if="submitted && errors.has('password')" class="invalid-feedback d-block">{{ errors.first('password') }}</div>
            </div>
            <div class="form-group">
                <label htmlFor="password">{{messages.field_label_confirm_password}}</label>
                <input type="password" v-model="confirmPassword" v-validate="{ required: true, min: 6 }" name="confirmPassword" class="form-control" :class="{ 'is-invalid': submitted && errors.has('confirmPassword') }" />
                <div v-if="submitted && errors.has('confirmPassword')" class="invalid-feedback d-block">{{ errors.first('confirmPassword') }}</div>
            </div>
            <div class="form-group">
                <label for="email">{{messages.field_label_email}}</label>
                <input type="text" v-model="user.contact.info" v-validate="'required'" name="email" class="form-control" :class="{ 'is-invalid': submitted && errors.has('email') }" />
                <div v-if="submitted && errors.has('email')" class="invalid-feedback d-block">{{ errors.first('email') }}</div>
            </div>
            <div class="form-group" v-if="promoCodesEnabled">
                <label for="promoCode">{{messages.field_label_promoCode}}</label>
                <input type="text" v-model="user.promoCode" v-validate="{required: promoCodeRequired}" name="promoCode" class="form-control" :class="{ 'is-invalid': submitted && errors.has('promoCode') }" />
                <div v-if="submitted && errors.has('promoCode')" class="invalid-feedback d-block">{{ errors.first('promoCode') }}</div>
                <small><a :href="messages.message_request_promoCode_link">{{messages.message_request_promoCode}}</a></small>
            </div>

            <div v-if="plan" class="form-group">
                <label htmlFor="paymentMethod">{{messages.field_label_paymentMethod}}</label>
                <div v-if="typeof payMethods === 'undefined' || payMethods === null || payMethods.length === 0" class="invalid-feedback d-block">
                    <h5>{{messages.err_noPaymentMethods}}</h5>
                </div>
                <div v-else-if="payMethods.length > 1">
                        <span v-for="pm in payMethods">
                            <button v-if="!pm.driverClass.endsWith('NoopCloud')" class="btn btn-primary" :disabled="loading()" @click="setPaymentMethod(pm)">{{messages['payment_description_'+pm.paymentMethodType]}}</button>
                        </span>
                </div>

                <div v-for="pm in payMethods">
                    <div v-if="selectedPaymentMethod !== null && selectedPaymentMethod.driverClass !== null && selectedPaymentMethod.driverClass === pm.driverClass">
                        <router-view name="pay_stripe" v-if="pm.driverClass.endsWith('StripePaymentDriver')"></router-view>
                        <router-view name="pay_invite" v-else-if="pm.driverClass.endsWith('CodePaymentDriver')"></router-view>
                        <router-view name="pay_free" v-else-if="pm.driverClass.endsWith('FreePaymentDriver')"></router-view>
                        <!-- <router-view name="pay_unknown" v-else></router-view> -->
                    </div>
                </div>
                <div v-if="submitted && errors.has('paymentInfo')" class="invalid-feedback d-block">{{ errors.first('paymentInfo') }}</div>
                <div v-if="submitted && errors.has('paymentMethod')" class="invalid-feedback d-block">{{ errors.first('paymentMethod') }}</div>
                <div v-if="submitted && errors.has('paymentMethodInfo')" class="invalid-feedback d-block">{{ errors.first('paymentMethodInfo') }}</div>
                <div v-if="submitted && errors.has('paymentMethodType')" class="invalid-feedback d-block">{{ errors.first('paymentMethodType') }}</div>
                <div v-if="submitted && errors.has('paymentMethodService')" class="invalid-feedback d-block">{{ errors.first('paymentMethodService') }}</div>
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
import { mapState, mapActions, mapGetters } from 'vuex';
import { util } from '../_helpers';

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
            payMethods: null,
            selectedPaymentMethod: null,
            paymentMethodObject: null,
            confirmPassword: '',
            submitted: false
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
                        if (this.plan !== null) {
                            if (this.paymentMethodObject === null) {
                                this.errors.add({field: 'paymentMethod', msg: this.messages['err_paymentMethod_required']});
                                return;
                            } else {
                                console.log('handleSubmit: setting this.user.preferredPlan = '+this.plan.uuid);
                                this.user.preferredPlan = this.plan.uuid;
                                this.user.paymentMethodObject = this.paymentMethodObject;
                                this.user.paymentMethodObject.cloud = this.selectedPaymentMethod.name;
                            }
                        }
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
        }
    }
};
</script>
