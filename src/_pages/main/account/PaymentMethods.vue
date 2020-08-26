<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="wrapper">
    <h1 class="text-center white-text form-title">
      {{ messages.title_account_payment_methods }}
    </h1>

    <form class="bubble-form">
      <h5>{{ messages.title_account_payment_methods }}</h5>

      <div v-if="payMethods">
        <table border="1">
          <thead>
            <tr>
              <td>{{ messages.label_account_payment_method_type }}</td>
              <td>{{ messages.label_account_payment_method_info }}</td>
              <td>{{ messages.label_account_payment_method_added }}</td>
              <td>{{ messages.label_account_payment_method_current }}</td>
              <td></td>
              <td v-if="payMethods.length > 1">
                {{ messages.label_account_payment_method_set }}
              </td>
              <td v-if="payMethods.length > 1">
                {{ messages.label_account_payment_method_remove }}
              </td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(pm, key) in payMethods" :key="key">
              <td>{{ messages['payment_method_' + pm.paymentMethodType] }}</td>
              <td nowrap="nowrap">
                <small>{{ pm.maskedPaymentInfo }}</small>
              </td>
              <td>
                {{
                  messages.label_account_payment_method_added_format.parseDateMessage(
                    pm.ctime,
                    messages
                  )
                }}
              </td>

              <td v-if="pm.planNames && pm.planNames.length > 0">
                <div v-for="(name, key) in pm.planNames" :key="key">
                  {{ name }}
                </div>
              </td>
              <td v-else></td>

              <td
                v-if="
                  accountPlans &&
                    accountPlans.length > 0 &&
                    payMethods.length > 1
                "
              >
                <div v-for="(ap, key) in accountPlans" :key="key">
                  <Button
                    style="white-space:nowrap"
                    v-if="ap.paymentMethod !== pm.uuid"
                    @click="setPayMethodForPlan(ap.uuid, pm.uuid)"
                  >
                    {{ ap.name }}
                  </Button>
                </div>
              </td>
              <td v-else-if="payMethods.length > 1"></td>

              <td v-if="pm.deletable">
                <Button v-if="pm.deletable" @click="deletePayMethod(pm.uuid)">
                  {{ messages.button_label_account_payment_delete }}
                </Button>
              </td>
              <td v-else></td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr />

      <label htmlFor="paymentMethod">
        <b>{{ messages.label_account_payment_add }}</b>
      </label>

      <stripe-element ref="stripeElement" />

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

      <hr />
      <div v-if="promos && promos.length > 0">
        <h5>{{ messages.title_account_promotions }}</h5>

        <table border="1">
          <thead>
            <tr>
              <td>{{ messages.label_account_payment_method_info }}</td>
              <td>{{ messages.label_account_payment_method_added }}</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(pm, key) in promos" :key="key">
              <td>{{ messages['label_promotion_' + pm.maskedPaymentInfo] }}</td>
              <td>
                {{
                  messages.label_account_payment_method_added_format.parseDateMessage(
                    pm.ctime,
                    messages
                  )
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr />
      <div v-if="usedPromos && usedPromos.length > 0">
        <h5>{{ messages.title_account_promotions_used }}</h5>

        <table border="1">
          <thead>
            <tr>
              <td>{{ messages.label_account_payment_method_info }}</td>
              <td>{{ messages.label_account_payment_method_added }}</td>
              <td>{{ messages.label_account_promotion_used }}</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(pm, key) in usedPromos" :key="key">
              <td>{{ messages['label_promotion_' + pm.maskedPaymentInfo] }}</td>
              <td>
                {{
                  messages.label_account_payment_method_added_format.parseDateMessage(
                    pm.ctime,
                    messages
                  )
                }}
              </td>
              <td>
                {{
                  messages.label_account_payment_method_used_format.parseDateMessage(
                    pm.deleted,
                    messages
                  )
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
@import '../../../_scss/components/form';

.bubble-form {
  width: 600px;
}
</style>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { util } from '~/_helpers';

import { Button, StripeElement } from '~/_components/shared';

export default {
  components: {
    Button,
    StripeElement,
  },
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
        paymentInfo: null,
      },
      submitted: false,
    };
  },
  computed: {
    ...mapState('system', ['messages']),
    ...mapState('paymentMethods', [
      'paymentMethods',
      'accountPaymentMethods',
      'paymentMethod',
      'paymentStatus',
    ]),
    ...mapState('accountPlans', ['accountPlans']),
  },
  methods: {
    ...mapActions('paymentMethods', [
      'getAllPaymentMethods',
      'getAllAccountPaymentMethods',
      'setPaymentMethod',
      'deleteAccountPaymentMethod',
      'setAccountPaymentMethodForPlan',
      'addAccountPaymentMethod',
    ]),
    ...mapActions('accountPlans', ['getAllAccountPlans']),
    ...mapGetters('paymentMethods', ['loading']),
    ...mapActions('account', ['checkSession']),

    deletePayMethod(pmId) {
      this.deleteAccountPaymentMethod({
        userId: this.userId,
        pmId: pmId,
        messages: this.messages,
        errors: this.errors,
      });
    },
    setPayMethodForPlan(planId, pmId) {
      this.setAccountPaymentMethodForPlan({
        userId: this.userId,
        planId: planId,
        pmId: pmId,
        messages: this.messages,
        errors: this.errors,
      });
    },

    authorizeCard(e) {
      util.setSkipRegistration();

      this.errors.clear();

      this.$refs.stripeElement.verifyCard().then((result) => {
        if (result.error) {
          this.$snotify.error(result.error.message);
        } else {
          this.submitted = true;
          this.addAccountPaymentMethod({
            userId: this.user && this.user.uuid ? this.user.uuid : null,
            paymentMethod: {
              paymentMethodType: 'credit',
              paymentInfo: result.token.id,
              preferredPlan: this.bubblePlan,
            },
            messages: this.messages,
            errors: this.errors,
          }).then(() => {
            this.checkSession({
              messages: this.messages,
              errors: this.errors,
            });
          });
        }
      });
      return false;
    },
  },

  watch: {
    paymentMethods() {
      this.$refs.stripeElement.setUpStripe(
        this.paymentMethods[0].driverConfig.publicApiKey
      );
    },
    accountPaymentMethods(pms) {
      if (pms) {
        const payMethods = [];
        const promos = [];
        const usedPromos = [];
        for (let i = 0; i < pms.length; i++) {
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
    paymentMethod(pm) {
      if (pm) {
        this.selectedPaymentMethod = pm;
        this.newPaymentMethod.paymentMethodType = pm.paymentMethodType;
        this.newPaymentMethod.paymentInfo = null;
      }
    },
    paymentStatus(status) {
      if (
        status &&
        (status.addedPaymentMethod === true ||
          status.updatedPaymentMethod === true ||
          status.deletedPaymentMethod === true)
      ) {
        this.selectedPaymentMethod = null;
        if (status.updatedPaymentMethod === true) {
          this.getAllAccountPlans({
            userId: this.userId,
            messages: this.messages,
            errors: this.errors,
          });
        }
        this.getAllAccountPaymentMethods({
          userId: this.userId,
          messages: this.messages,
          errors: this.errors,
        });
      }
    },
  },

  created() {
    this.me = this.$route.path.startsWith('/me/');
    if (util.validateAccount(this)) {
      this.getAllAccountPaymentMethods({
        userId: this.userId,
        messages: this.messages,
        errors: this.errors,
      });
      this.getAllPaymentMethods({
        messages: this.messages,
        errors: this.errors,
      });
      this.getAllAccountPlans({
        userId: this.userId,
        messages: this.messages,
        errors: this.errors,
      });
    }
  },
};
</script>
