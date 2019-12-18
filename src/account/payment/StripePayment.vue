<template>
    <div>
        <div ref="card"></div>
        <button v-on:click="authorizeCard">{{messages.button_label_submit_card_authorization}}</button>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'
    import {paymentMethods} from "../../_store/paymentMethods.module";

    export default {
        data() {
            return {
                elements: null,
                card: null
            }
        },
        computed: {
            ...mapState('paymentMethods', ['paymentMethod']),
            ...mapState('system', ['messages']),
        },
        created () {
            console.log('StripePayment.vue: created, stripe key='+this.paymentMethod.driverConfig.publicApiKey);
            window.stripe = Stripe(this.paymentMethod.driverConfig.publicApiKey);
            this.elements = window.stripe.elements();
            this.card = undefined;
        },
        mounted: function () {
            this.card = this.elements.create('card');
            this.card.mount(this.$refs.card);
        },
        methods: {
            ...mapActions('paymentMethods', ['setPaymentInfo']),
            authorizeCard(e) {
                console.log('authorizeCard: starting with key='+this.paymentMethod.driverConfig.publicApiKey);
                // window.stripe.setPublishableKey(this.paymentMethod.driverConfig.publicApiKey);
                window.stripe.createToken(this.card).then(function(result) {
                    console.log('authorizedCard: created token='+JSON.stringify(result.token));
                    if (result.error) {
                        console.log('authorizedCard: had errors: '+JSON.stringify(result.error));
                        self.hasCardErrors = true;
                        self.$forceUpdate(); // Forcing the DOM to update so the Stripe Element can update.
                        return;
                    }
                });
            }
        }
    };
</script>