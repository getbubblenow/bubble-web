<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://bubblev.com/bubble-license/ -->
<template>
    <form @submit.prevent="setFreePlay">
        <div class="form-group">
            <div v-if="submitted && errors.has('purchase')" class="invalid-feedback d-block">{{ errors.first('purchase') }}</div>
            <div v-if="submitted && errors.has('paymentMethod')" class="invalid-feedback d-block">{{ errors.first('paymentMethod') }}</div>
            <div v-if="submitted && errors.has('paymentMethodInfo')" class="invalid-feedback d-block">{{ errors.first('paymentMethodInfo') }}</div>
            <div v-if="submitted && errors.has('paymentMethodType')" class="invalid-feedback d-block">{{ errors.first('paymentMethodType') }}</div>
            <div v-if="submitted && errors.has('paymentMethodService')" class="invalid-feedback d-block">{{ errors.first('paymentMethodService') }}</div>
            <div v-if="submitted && errors.has('paymentInfo')" class="invalid-feedback d-block">{{ errors.first('paymentInfo') }}</div>
            <button v-if="paymentStatus.addingPaymentMethod || !paymentStatus.addedPaymentMethod" class="btn btn-primary" :disabled="paymentStatus.addingPaymentMethod">{{messages.button_label_submit_free_pay}}</button>
            <span v-if="paymentStatus.addedPaymentMethod">{{messages.message_verified_free_pay}}</span>
        </div>
    </form>
</template>

<script>
    import {mapActions, mapState} from 'vuex'
    import { util } from '../../_helpers'

    export default {
        data() {
            return {
                user: util.currentUser(),
                submitted: false
            };
        },
        computed: {
            ...mapState('paymentMethods', ['paymentMethod', 'paymentStatus', 'paymentInfo']),
            ...mapState('system', ['messages']),
        },
        methods: {
            ...mapActions('paymentMethods', ['addAccountPaymentMethod']),
            setFreePlay: function (e) {
                this.submitted = true;
                this.errors.clear();
                this.addAccountPaymentMethod({
                    userId: this.user && this.user.uuid ? this.user.uuid : null,
                    paymentMethod: {
                        paymentMethodType: 'free',
                        paymentInfo: 'free'
                    },
                    messages: this.messages,
                    errors: this.errors
                });
            }
        }
    };
</script>