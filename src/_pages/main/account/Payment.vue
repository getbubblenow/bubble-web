<template>
  <div class="wrapper">
    <h1 class="text-center white-text form-title">
      {{ messages.payment_page_title }}
    </h1>
    <h4
      class="d-flex align-items-center justify-content-center white-text form-sub-title"
    >
      {{ messages.payment_page_sub_title }}
    </h4>

    <form class="bubble-form" @submit.prevent="authorizeCard">
      <select
        v-validate="'required'"
        v-if="planObjects"
        v-model="bubblePlan"
        name="plan"
        class="form-control"
        :class="{ 'is-invalid': submitted && errors.has('plan') }"
      >
        <option
          v-for="(plan, index) in planObjects"
          :value="plan.name"
          :key="index"
        >
          {{ messages['plan_name_' + plan.name] }} -
          {{
            messages.price_format.parseExpression({
              messages: messages,
              ...plan,
            })
          }}
        </option>
      </select>

      <div id="card-number" class="form-control mt-3" />

      <div class="mt-3 d-flex">
        <div id="card-expiry" class="form-control mr-1" />
        <div id="card-cvc" class="form-control" />
        <div class="flex-grow-1"></div>
        <div id="card-zip" class="form-control" />
      </div>

      <p class="text-center mt-3">
        <small>
          {{ messages['label_promotion_FirstMonthFree_description'] }}
        </small>
      </p>

      <p v-if="stripeError" class="invalid-feedback d-block">
        {{ stripeError }}
      </p>
      <div
        v-if="submitted && errors.has('purchase')"
        class="invalid-feedback d-block"
      >
        {{ errors.first('purchase') }}
      </div>
      <div
        v-if="submitted && errors.has('paymentMethod')"
        class="invalid-feedback d-block"
      >
        {{ errors.first('paymentMethod') }}
      </div>
      <div
        v-if="submitted && errors.has('paymentMethodInfo')"
        class="invalid-feedback d-block"
      >
        {{ errors.first('paymentMethodInfo') }}
      </div>
      <div
        v-if="submitted && errors.has('paymentMethodType')"
        class="invalid-feedback d-block"
      >
        {{ errors.first('paymentMethodType') }}
      </div>
      <div
        v-if="submitted && errors.has('paymentMethodService')"
        class="invalid-feedback d-block"
      >
        {{ errors.first('paymentMethodService') }}
      </div>
      <div
        v-if="submitted && errors.has('paymentInfo')"
        class="invalid-feedback d-block"
      >
        {{ errors.first('paymentInfo') }}
      </div>
      <div
        v-if="submitted && errors.has('plan')"
        class="invalid-feedback d-block"
      >
        {{ errors.first('plan') }}
      </div>

      <Button
        block
        color="default"
        class="bubble-form-submit"
        @click="authorizeCard"
        v-if="
          paymentStatus.addingPaymentMethod || !paymentStatus.addedPaymentMethod
        "
        :disabled="paymentStatus.addingPaymentMethod"
      >
        {{ messages.button_label_add_card }}
      </Button>
    </form>

    <!--- Pricing Section --->
    <div class="mt-5">
      <h2 class="text-center">
        {{ messages.label_bubble_free_title }}
      </h2>
      <h5
        class="text-center"
        v-html="messages.label_bubble_free_description"
      ></h5>
    </div>

    <div
      class="row px-5 mx-5 mt-5"
      v-if="messages && messages.marketing_pricing_common_options"
    >
      <div class="col-12 d-flex plan-section">
        <Card
          class="plan flex-grow-1"
          v-for="(plan, index) in messages.marketing_pricing_options.split(',')"
          :round-corner="false"
          :key="index"
        >
          <p class="plan-name">
            {{ messages[`marketing_pricing_${plan}_title`] }}
          </p>
          <p class="plan-users">
            {{ messages[`marketing_pricing_${plan}_users`] }}
          </p>
          <p class="plan-pricing">
            <span class="symbol">
              {{ messages.currency_symbol_USD }}
            </span>
            <span class="price">
              {{ messages[`marketing_pricing_${plan}_price`].parsePrice() }}
            </span>
            <span class="period">
              {{ messages.marketing_pricing_period }}
            </span>
          </p>
          <p
            class="plan-common-features text-center"
            v-for="option in messages.marketing_pricing_common_options.split(
              ','
            )"
            :key="option"
          >
            {{ option }}
          </p>
          <p
            class="plan-features text-center"
            v-for="option in messages[
              `marketing_pricing_${plan}_options`
            ].split(',')"
            :key="option"
          >
            {{ option }}
          </p>
        </Card>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../../../_scss/components/form';

.features-section-link {
  color: $vivid-navy;
  font-size: 16px;
  margin-top: 25px;
}

.plan-section {
  @include respond-below(md) {
    flex-direction: column;
  }
}

#card-expiry,
#card-cvc,
#card-zip {
  max-width: 25%;
}

.plan {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 20px;
  background-color: white;

  &:nth-child(2n + 1) {
    margin-top: 30px;
    color: $vivid-navy;
  }
  &:nth-child(2n) {
    z-index: 1;
    color: $strong-purple-1;
  }

  .plan-users {
    color: inherit;
    font-weight: 700;
    font-size: 0.9em;
  }

  .plan-pricing {
    color: inherit;
    display: flex;

    margin: 2em 0;

    .symbol {
      font-size: 1.5em;
    }
    .price {
      font-size: 5em;
      line-height: 1em;
      font-weight: bold;
    }
    .period {
      font-size: 1.5em;
      align-self: flex-end;
    }
  }

  .plan-name {
    color: #2e2545;
    font-size: 1.5em;
    font-weight: 500;
  }

  .plan-common-features {
    color: #8585bd;
  }
  .plan-features {
    color: #8585bd;
    font-weight: bold;
  }
}
</style>

<script>
import { mapState, mapActions } from 'vuex';
import { util } from '~/_helpers';

import { Button, Card } from '~/_components/shared';

export default {
  components: {
    Button,
    Card,
  },

  data() {
    return {
      user: util.currentUser(),
      bubblePlan: '',
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
      brand: '',
      stripe: null,
      stripeError: '',
      submitted: false,
    };
  },

  computed: {
    ...mapState('system', ['messages']),
    ...mapState('paymentMethods', ['paymentMethods', 'paymentStatus']),
    ...mapState('plans', ['plans']),

    planObjects: function() {
      const plans_array = [];
      if (this.plans) {
        for (let i = 0; i < this.plans.length; i++) {
          plans_array.push({
            ...this.plans[i],
            localName: this.messages['plan_name_' + this.plans[i].name],
            description: this.messages[
              'plan_description_' + this.plans[i].name
            ],
            priceMajorUnits: this.plans[i].price / 100,
            priceMinorUnits: this.plans[i].price % 100,
          });
        }
        this.bubblePlan = this.plans[0].name;
      }
      return plans_array;
    },
  },

  created() {
    this.initDefaults();
  },

  mounted() {},

  methods: {
    ...mapActions('paymentMethods', [
      'getAllPaymentMethods',
      'setPaymentMethod',
      'addAccountPaymentMethod',
      'getAllAccountPaymentMethods',
    ]),
    ...mapActions('plans', ['getAllPlans']),

    setUpStripe() {
      if (window.Stripe === undefined) {
        alert('Stripe V3 library not loaded!');
      } else {
        const stripe = window.Stripe(
          this.paymentMethods[0].driverConfig.publicApiKey
        );
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

    initDefaults() {
      this.getAllPlans(this.messages, this.errors);
      this.getAllPaymentMethods(this.messages, this.errors);
    },

    authorizeCard(e) {
      util.setSkipRegistration();

      this.errors.clear();

      this.stripe.createToken(this.cardNumber).then((result) => {
        if (result.error) {
          this.$snotify.error(result.error.message);
        } else {
          this.submitted = true;
          this.addAccountPaymentMethod({
            userId: this.user && this.user.uuid ? this.user.uuid : null,
            paymentMethod: {
              paymentMethodType: 'credit',
              paymentInfo: result.token.id,
            },
            messages: this.messages,
            errors: this.errors,
          });
        }
      });
      return false;
    },
  },

  watch: {
    paymentMethods() {
      this.setUpStripe();
    },

    paymentStatus(ps) {
      if (ps && ps.addedPaymentMethod) {
        // refresh account payment methods
        this.getAllAccountPaymentMethods({
          userId: this.user.uuid,
          messages: this.messages,
          errors: this.errors,
        });
      }
    },
  },
};
</script>
