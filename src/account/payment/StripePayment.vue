<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div class="form-group">
        <div class="form-control" ref="card"></div>
        <div v-if="submitted && errors.has('purchase')" class="invalid-feedback d-block">{{ errors.first('purchase') }}</div>
        <div v-if="submitted && errors.has('paymentMethod')" class="invalid-feedback d-block">{{ errors.first('paymentMethod') }}</div>
        <div v-if="submitted && errors.has('paymentMethodInfo')" class="invalid-feedback d-block">{{ errors.first('paymentMethodInfo') }}</div>
        <div v-if="submitted && errors.has('paymentMethodType')" class="invalid-feedback d-block">{{ errors.first('paymentMethodType') }}</div>
        <div v-if="submitted && errors.has('paymentMethodService')" class="invalid-feedback d-block">{{ errors.first('paymentMethodService') }}</div>
        <div v-if="submitted && errors.has('paymentInfo')" class="invalid-feedback d-block">{{ errors.first('paymentInfo') }}</div>
        <button v-if="paymentStatus.addingPaymentMethod || !paymentStatus.addedPaymentMethod" value="paymentButton" @click="authorizeCard" class="btn btn-primary" :disabled="paymentStatus.addingPaymentMethod">{{messages.button_label_submit_card}}</button>
        <span v-if="paymentStatus.addedPaymentMethod">{{messages.message_verified_card}}</span>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import { paymentMethods } from "~/_store/paymentMethods.module";
    import { util } from '~/_helpers';

    export default {
        data() {
            return {
                user: util.currentUser(),
                elements: null,
                card: null,
                submitted: false
            }
        },
        computed: {
            ...mapState('paymentMethods', ['paymentMethod', 'paymentStatus', 'paymentInfo', 'accountPaymentMethods']),
            ...mapState('system', ['messages']),
        },
        created () {
            window.stripe = Stripe(this.paymentMethod.driverConfig.publicApiKey);
            this.elements = window.stripe.elements();
            this.card = undefined;
        },
        mounted: function () {
            this.card = this.elements.create('card');
            this.card.mount(this.$refs.card);
        },
        methods: {
            ...mapActions('paymentMethods', ['addAccountPaymentMethod', 'getAllAccountPaymentMethods']),
            authorizeCard(e) {
                util.setSkipRegistration();
                const comp = this;
                this.errors.clear();
                window.stripe.createToken(this.card).then(function(result) {
                    if (result.error) {
                        console.log('authorizedCard: had errors: '+JSON.stringify(result.error));
                        self.hasCardErrors = true;
                        self.$forceUpdate(); // Forcing the DOM to update so the Stripe Element can update.
                    } else {
                        comp.submitted = true;
                        comp.addAccountPaymentMethod({
                            userId: comp.user && comp.user.uuid ? comp.user.uuid : null,
                            paymentMethod: {
                                paymentMethodType: 'credit',
                                paymentInfo: result.token.id
                            },
                            messages: comp.messages,
                            errors: comp.errors
                        });
                    }
                });
                return false;
            }
        },
        watch: {
            paymentStatus (ps) {
                if (ps && ps.addedPaymentMethod) {
                    // refresh account payment methods
                    this.getAllAccountPaymentMethods({userId: this.user.uuid, messages: this.messages, errors: this.errors})
                }
            }
        }
    };
</script>