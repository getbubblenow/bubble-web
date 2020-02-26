<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://git.bubblev.org/bubblev/bubble/src/branch/master/LICENSE.md -->
<template>
    <div>
        <h5>{{messages.title_account_payment_methods}}</h5>

        <div v-if="payMethods">
            <table border="1">
                <thead>
                <tr>
                    <td>{{messages.label_account_payment_method_type}}</td>
                    <td>{{messages.label_account_payment_method_info}}</td>
                    <td>{{messages.label_account_payment_method_added}}</td>
                    <td>{{messages.label_account_payment_method_current}}</td>
                    <td v-if="payMethods.length > 1">{{messages.label_account_payment_method_set}}</td>
                    <td v-if="payMethods.length > 1">{{messages.label_account_payment_method_remove}}</td>
                </tr>
                </thead>
                <tbody>
                <tr v-for="pm in payMethods">
                    <td>{{messages['payment_method_'+pm.paymentMethodType]}}</td>
                    <td nowrap="nowrap"><small>{{pm.maskedPaymentInfo}}</small></td>
                    <td>{{messages.label_account_payment_method_added_format.parseDateMessage(pm.ctime, messages)}}</td>

                    <td v-if="pm.planNames && pm.planNames.length > 0">
                        <div v-for="name in pm.planNames">{{name}}</div>
                    </td>
                    <td v-else></td>

                    <td v-if="accountPlans && accountPlans.length > 0 && payMethods.length > 1">
                        <div v-for="ap in accountPlans">
                            <button style="white-space:nowrap" v-if="ap.paymentMethod !== pm.uuid" @click="setPayMethodForPlan(ap.uuid, pm.uuid)">{{ap.name}}</button>
                        </div>
                    </td>
                    <td v-else-if="payMethods.length > 1"></td>

                    <td v-if="pm.deletable">
                        <button v-if="pm.deletable" @click="deletePayMethod(pm.uuid)">{{messages.button_label_account_payment_delete}}</button>
                    </td>
                    <td v-else></td>
                </tr>
                </tbody>
            </table>
        </div>

        <hr/>
        <div class="form-group">
            <label htmlFor="paymentMethod"><b>{{messages.label_account_payment_add}}</b></label>
            <div v-if="!loading() && (typeof paymentMethods === 'undefined' || paymentMethods === null || paymentMethods.length === 0)" class="invalid-feedback d-block">
                <h5>{{messages.err_noPaymentMethods}}</h5>
            </div>
            <div>
                <span v-for="pm in paymentMethods">
                    <button class="btn btn-primary" :disabled="loading()" @click="setPaymentMethod(pm)">{{messages['payment_description_'+pm.paymentMethodType]}}</button>
                </span>
            </div>

            <div v-if="selectedPaymentMethod !== null && selectedPaymentMethod.paymentMethodType === 'credit'">
                <router-view name="pay_stripe" v-if="selectedPaymentMethod.driverClass.endsWith('StripePaymentDriver')"></router-view>
                <router-view name="pay_unknown" v-else></router-view>
            </div>
            <div v-else-if="selectedPaymentMethod !== null && selectedPaymentMethod.paymentMethodType === 'code'">
                <router-view name="pay_invite" v-if="selectedPaymentMethod.driverClass.endsWith('CodePaymentDriver')"></router-view>
                <router-view name="pay_unknown" v-else></router-view>
            </div>
            <div v-else-if="selectedPaymentMethod !== null && selectedPaymentMethod.paymentMethodType === 'free'">
                <router-view name="pay_free" v-if="selectedPaymentMethod.driverClass.endsWith('FreePaymentDriver')"></router-view>
                <router-view name="pay_unknown" v-else></router-view>
            </div>
            <div v-else-if="selectedPaymentMethod !== null">
                <router-view name="pay_unknown"></router-view>
            </div>

        </div>

        <hr/>
        <div v-if="promos && promos.length > 0">
            <h5>{{messages.title_account_promotions}}</h5>

            <table border="1">
                <thead>
                <tr>
                    <td>{{messages.label_account_payment_method_info}}</td>
                    <td>{{messages.label_account_payment_method_added}}</td>
                </tr>
                </thead>
                <tbody>
                <tr v-for="pm in promos">
                    <td>{{messages['label_promotion_'+pm.maskedPaymentInfo]}}</td>
                    <td>{{messages.label_account_payment_method_added_format.parseDateMessage(pm.ctime, messages)}}</td>
                </tr>
                </tbody>
            </table>
        </div>

        <hr/>
        <div v-if="usedPromos && usedPromos.length > 0">
            <h5>{{messages.title_account_promotions_used}}</h5>

            <table border="1">
                <thead>
                <tr>
                    <td>{{messages.label_account_payment_method_info}}</td>
                    <td>{{messages.label_account_payment_method_added}}</td>
                    <td>{{messages.label_account_promotion_used}}</td>
                </tr>
                </thead>
                <tbody>
                <tr v-for="pm in usedPromos">
                    <td>{{messages['label_promotion_'+pm.maskedPaymentInfo]}}</td>
                    <td>{{messages.label_account_payment_method_added_format.parseDateMessage(pm.ctime, messages)}}</td>
                    <td>{{messages.label_account_payment_method_used_format.parseDateMessage(pm.deleted, messages)}}</td>
                </tr>
                </tbody>
            </table>
        </div>

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../../_helpers';

    export default {
        data() {
            return {
                me: null,
                userId: null,
                linkPrefix: null,
                currentUser: util.currentUser(),
                payMethods: null,
                promos: null,
                usedPromos: null,
                selectedPaymentMethod: null,
                newPaymentMethod: {
                    paymentMethodType: null,
                    paymentInfo: null
                }
            };
        },
        computed: {
            ...mapState('system', ['messages']),
            ...mapState('paymentMethods', ['paymentMethods', 'accountPaymentMethods', 'paymentMethod', 'paymentStatus']),
            ...mapState('accountPlans', ['accountPlans']),
        },
        methods: {
            ...mapActions('paymentMethods', [
                'getAllPaymentMethods', 'getAllAccountPaymentMethods', 'setPaymentMethod', 'deleteAccountPaymentMethod',
                'setAccountPaymentMethodForPlan'
            ]),
            ...mapActions('accountPlans', ['getAllAccountPlans']),
            ...mapGetters('paymentMethods', ['loading']),
            deletePayMethod (pmId) {
                this.deleteAccountPaymentMethod({userId: this.userId, pmId: pmId, messages: this.messages, errors: this.errors});
            },
            setPayMethodForPlan(planId, pmId) {
                this.setAccountPaymentMethodForPlan({userId: this.userId, planId: planId, pmId: pmId, messages: this.messages, errors: this.errors});
            }
        },
        watch: {
            accountPaymentMethods (pms) {
                if (pms) {
                    const payMethods = [];
                    const promos = [];
                    const usedPromos = [];
                    for (let i=0; i<pms.length; i++) {
                        const pm = pms[i];
                        if (pm.promotion) {
                            if (typeof pm.deleted !== 'undefined' && pm.deleted !== null) {
                                usedPromos.push(pm);
                            } else {
                                promos.push(pm);
                            }
                        } else {
                            if (typeof pm.deleted === 'undefined' || pm.deleted === null) {
                                payMethods.push(pm);
                            }
                        }
                    }
                    this.payMethods = payMethods;
                    this.promos = promos;
                    this.usedPromos = usedPromos;
                }
            },
            paymentMethod (pm) {
                if (pm) {
                    this.selectedPaymentMethod = pm;
                    this.newPaymentMethod.paymentMethodType = pm.paymentMethodType;
                    this.newPaymentMethod.paymentInfo = null;
                }
            },
            paymentStatus (status) {
                if (status && (status.addedPaymentMethod === true || status.updatedPaymentMethod === true || status.deletedPaymentMethod === true)) {
                    this.selectedPaymentMethod = null;
                    if (status.updatedPaymentMethod === true) {
                        this.getAllAccountPlans({userId: this.userId, messages: this.messages, errors: this.errors});
                    }
                    this.getAllAccountPaymentMethods({userId: this.userId, messages: this.messages, errors: this.errors});
                }
            }
        },
        created () {
            this.me = this.$route.path.startsWith('/me/');
            if (util.validateAccount(this)) {
                this.getAllAccountPaymentMethods({userId: this.userId, messages: this.messages, errors: this.errors});
                this.getAllPaymentMethods({messages: this.messages, errors: this.errors});
                this.getAllAccountPlans({userId: this.userId, messages: this.messages, errors: this.errors});
            }
        }
    };
</script>