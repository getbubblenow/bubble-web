<template>
  <div class="wrapper">
    <div id="card-number" class="form-control mt-3" />

    <div class="mt-3 d-flex">
      <div id="card-expiry" class="form-control mr-1" />
      <div id="card-cvc" class="form-control" />
      <div class="flex-grow-1"></div>
      <div id="card-zip" class="form-control" />
    </div>
    <p v-if="stripeError" class="invalid-feedback d-block">
      {{ stripeError }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
#card-expiry,
#card-cvc,
#card-zip {
  max-width: 25%;
}
</style>

<script>
export default {
  data: () => ({
    card: {
      cvc: '',
      number: '',
      expiry: '',
      zip: '',
    },
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardZip: '',
    stripeError: '',
    stripe: null,
  }),

  methods: {
    setUpStripe(publicKey) {
      if (window.Stripe === undefined) {
        alert('Stripe V3 library not loaded!');
      } else {
        const stripe = window.Stripe(publicKey);
        this.stripe = stripe;

        const style = {
          base: {
            padding: '.375rem .75rem',
            fontSize: '1rem',
            fontWeight: '400',
            lineHeight: '1.5',
            color: '#495057',
          },
        };

        const elements = stripe.elements();
        this.cardCvc = elements.create('cardCvc', { style });
        this.cardExpiry = elements.create('cardExpiry', { style });
        this.cardNumber = elements.create('cardNumber', { style });
        this.cardZip = elements.create('postalCode', {
          placeholder: 'Zip',
          style,
        });
        this.cardNumber.update({
          placeholder: 'CC Card #',
          showIcon: true,
        });

        this.cardCvc.mount('#card-cvc');
        this.cardExpiry.mount('#card-expiry');
        this.cardNumber.mount('#card-number');
        this.cardZip.mount('#card-zip');

        this.listenForErrors();
      }
    },

    listenForErrors() {
      this.cardNumber.addEventListener('change', (event) => {
        this.toggleError(event);
        this.cardNumberError = '';
        this.card.number = event.complete ? true : false;
        if (this.card.number) {
          this.brand = event.brand;
        }
      });

      this.cardExpiry.addEventListener('change', (event) => {
        this.toggleError(event);
        this.cardExpiryError = '';
        this.card.expiry = event.complete ? true : false;
      });

      this.cardCvc.addEventListener('change', (event) => {
        this.toggleError(event);
        this.cardCvcError = '';
        this.card.cvc = event.complete ? true : false;
      });
    },

    toggleError(event) {
      if (event.error) {
        this.stripeError = event.error.message;
      } else {
        this.stripeError = '';
      }
    },

    verifyCard() {
      return this.stripe.createToken(this.cardNumber);
    },
  },
};
</script>
