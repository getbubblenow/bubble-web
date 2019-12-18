<template>
    <div>
        <form @submit.prevent="setInviteCode">
            <div class="form-group">
                <label for="invite_code">{{messages.field_payment_invite_code}}</label>
                <input type="text" v-model="invite_code" v-validate="'required'" name="invite_code" class="form-control" :class="{ 'is-invalid': submitted && errors.has('purchase') }" :disabled="paymentStatus.addingPaymentMethod || paymentStatus.addedPaymentMethod" />
                <div v-if="submitted && errors.has('purchase')" class="invalid-feedback">{{ errors.first('purchase') }}</div>
            </div>
            <div class="form-group">
                <button v-if="paymentStatus.addingPaymentMethod || !paymentStatus.addedPaymentMethod" class="btn btn-primary" :disabled="paymentStatus.addingPaymentMethod">{{messages.button_label_submit_invite_code}}</button>
                <span v-if="paymentStatus.addedPaymentMethod">{{messages.message_verified_invite_code}}</span>
            </div>
        </form>
    </div>
</template>

<script>
    import {mapActions, mapState} from 'vuex'

    export default {
        data() {
            return {
                invite_code: null,
                submitted: false
            };
        },
        computed: {
            ...mapState('paymentMethods', ['paymentMethod', 'paymentStatus', 'paymentInfo']),
            ...mapState('system', ['messages']),
        },
        created () {
            console.log('InviteCodePayment.vue: created, paymentMethod='+JSON.stringify(this.paymentMethod));
            if (this.paymentMethod && this.paymentMethod.paymentMethodType === 'code') {
                this.invite_code = this.paymentInfo;
            }
        },
        methods: {
            ...mapActions('paymentMethods', ['addAccountPaymentMethod']),
            setInviteCode: function (e) {
                console.log('setInviteCode: calling setPaymentInfo with invite code: '+this.invite_code);
                this.submitted = true;
                this.errors.clear();
                this.addAccountPaymentMethod({
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