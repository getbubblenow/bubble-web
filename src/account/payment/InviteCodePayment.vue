<template>
    <div>
        Invite Code payment view with method={{JSON.stringify(paymentMethod)}}
        <form @submit.prevent="setInviteCode">
            <div class="form-group">
                <label for="invite_code">{{messages.field_payment_invite_code}}</label>
                <input type="text" v-model="invite_code" v-validate="'required'" name="invite_code" class="form-control" :class="{ 'is-invalid': submitted && errors.has('purchase') }" />
                <div v-if="submitted && errors.has('purchase')" class="invalid-feedback">{{ errors.first('purchase') }}</div>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="status.submitted">{{messages.button_label_submit_invite_code}}</button>
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
                submitted: false,
                accepted: false
            };
        },
        computed: {
            ...mapState('paymentMethods', ['paymentMethod']),
        },
        created () {
            console.log('InviteCodePayment.vue: created, paymentMethod='+JSON.stringify(this.paymentMethod));
        },
        methods: {
            ...mapActions('paymentMethods', ['setPaymentInfo']),
            setInviteCode: function (e) {
                console.log('setInviteCode: calling setPaymentInfo with invite code: '+this.invite_code);
                this.setPaymentInfo(this.invite_code);
            }
        }
    };
</script>