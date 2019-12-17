<template>
    <div>
        Stripe payment view with method={{JSON.stringify(paymentMethod)}}
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'
    import {paymentMethods} from "../../_store/paymentMethods.module";

    export default {
        computed: {
            ...mapState('paymentMethods', ['paymentMethod']),
        },
        created () {
            console.log('StripePayment.vue: created, paymentMethod='+JSON.stringify(this.paymentMethod));
        },
        methods: {
            ...mapActions('paymentMethods', ['setPaymentInfo'])
        }
    };
</script>