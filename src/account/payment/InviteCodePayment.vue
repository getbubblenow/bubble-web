<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <form @submit.prevent="setInviteCode">
        <div class="form-group">
            <label for="invite_code">{{messages.field_payment_invite_code}}</label>
            <input type="text" v-model="invite_code" v-validate="'required'" name="invite_code" class="form-control" :class="{ 'is-invalid': submitted && errors.has('purchase') }" :disabled="paymentStatus.addingPaymentMethod || paymentStatus.addedPaymentMethod" />
            <div v-if="submitted && errors.has('purchase')" class="invalid-feedback d-block">{{ errors.first('purchase') }}</div>
            <div v-if="submitted && errors.has('paymentMethod')" class="invalid-feedback d-block">{{ errors.first('paymentMethod') }}</div>
            <div v-if="submitted && errors.has('paymentMethodInfo')" class="invalid-feedback d-block">{{ errors.first('paymentMethodInfo') }}</div>
            <div v-if="submitted && errors.has('paymentMethodType')" class="invalid-feedback d-block">{{ errors.first('paymentMethodType') }}</div>
            <div v-if="submitted && errors.has('paymentMethodService')" class="invalid-feedback d-block">{{ errors.first('paymentMethodService') }}</div>
            <div v-if="submitted && errors.has('paymentInfo')" class="invalid-feedback d-block">{{ errors.first('paymentInfo') }}</div>
        </div>
        <div class="form-group">
            <button v-if="paymentStatus.addingPaymentMethod || !paymentStatus.addedPaymentMethod" class="btn btn-primary" :disabled="paymentStatus.addingPaymentMethod">{{messages.button_label_submit_invite_code}}</button>
            <span v-if="paymentStatus.addedPaymentMethod">{{messages.message_verified_invite_code}}</span>
        </div>
    </form>
</template>

<script>
    import {mapActions, mapState} from 'vuex'
    import { util } from '~/_helpers'

    export default {
        data() {
            return {
                user: util.currentUser(),
                invite_code: null,
                submitted: false
            };
        },
        computed: {
            ...mapState('paymentMethods', ['paymentMethod', 'paymentStatus', 'paymentInfo']),
            ...mapState('system', ['messages']),
        },
        created () {
            if (this.paymentMethod && this.paymentMethod.paymentMethodType === 'code') {
                this.invite_code = this.paymentInfo;
            }
        },
        methods: {
            ...mapActions('paymentMethods', ['addAccountPaymentMethod']),
            setInviteCode: function (e) {
                this.submitted = true;
                this.errors.clear();
                this.addAccountPaymentMethod({
                    userId: this.user && this.user.uuid ? this.user.uuid : null,
                    paymentMethod: {
                        paymentMethodType: 'code',
                        paymentInfo: this.invite_code
                    },
                    messages: this.messages,
                    errors: this.errors
                });
            }
        }
    };
</script>