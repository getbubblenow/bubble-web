<template>
  <div class="wrapper">
    <h1 class="text-center white-text form-title">
      {{ messages.register_title }}
    </h1>
    <h4 class="text-center white-text form-sub-title">
      {{ messages.register_blurb }}
    </h4>

    <form class="auth-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <Input
          class="form-control"
          v-model="email"
          :placeholder="messages.register_field_label_email"
        />
        <span
          class="form-error"
          v-if="submitted && emailErrors && emailErrors.length"
        >
          {{ emailErrors.join(', ') }}
        </span>
        <div
          v-if="submitted && errors.has('email')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('email') }}
        </div>
      </div>
      <div class="form-group">
        <Input
          class="form-control"
          v-model="password"
          type="password"
          :placeholder="messages.field_label_password"
        />
        <p class="description">
          {{ messages.field_password_hint }}
        </p>
        <span
          class="form-error"
          v-if="submitted && passwordErrors && passwordErrors.length"
        >
          {{ passwordErrors.join(', ') }}
        </span>
        <div
          v-if="submitted && errors.has('password')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('password') }}
        </div>
      </div>

      <div class="form-group">
        <Input
          class="form-control"
          v-model="confirmPassword"
          type="password"
          :placeholder="messages.field_label_password_confirm"
        />
        <span
          class="form-error"
          v-if="
            submitted && confirmPasswordErrors && confirmPasswordErrors.length
          "
        >
          {{ confirmPasswordErrors.join(', ') }}
        </span>
      </div>
      <div class="form-group">
        <Input
          class="form-control"
          v-model="promoCode"
          :placeholder="messages.field_label_promoCode"
        />
        <span
          class="form-error"
          v-if="submitted && promoCodeErrors && promoCodeErrors.length"
        >
          {{ promoCodeErrors.join(', ') }}
        </span>
        <div
          v-if="submitted && errors.has('promoCode')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('promoCode') }}
        </div>
      </div>
      <a :href="messages.message_request_promoCode_link" target="_blank">
        {{ messages.message_request_promoCode }}
      </a>

      <div class="form-group my-5">
        <Checkbox
          v-model="agreeToTerms"
          :label="messages.field_label_agreeToTerms"
        />
        <span
          class="form-error"
          v-if="submitted && agreeToTermsErrors && agreeToTermsErrors.length"
        >
          {{ agreeToTermsErrors.join(', ') }}
        </span>
        <div
          v-if="submitted && errors.has('terms')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('terms') }}
        </div>
      </div>

      <div
        class="form-group mt-4 d-flex justify-content-center align-items-center"
      >
        <div class="flex-grow-1 pr-2">
          <router-link to="/login">
            <Button block color="outline">
              {{ messages.button_label_cancel }}
            </Button>
          </router-link>
        </div>
        <div class="flex-grow-1 pl-2">
          <Button
            block
            color="default"
            @click="handleSubmit"
            :disabled="status.registering"
          >
            {{ messages.button_label_register }}
          </Button>
        </div>
      </div>

      <div class="form-separator"></div>

      <div class="form-group my-3">
        <Checkbox
          v-model="receiveInformationalMessages"
          :label="messages.field_label_sendInformation"
        />
      </div>
      <div class="form-group my-3">
        <Checkbox
          v-model="receivePromotionalMessages"
          :label="messages.field_label_sendNews"
        />
      </div>
    </form>

    <Features></Features>

    <!--- Pricing Section --->
    <a
      class="pricing-section-link text-center d-block"
      href="https://getbubblenow.com/pricing/"
    >
      {{ messages.marketing_pricing_title }}
    </a>
    <!-- <div class="row px-5 mx-5">
      <div class="col-12 d-flex">
        <div
          class="plan flex-grow-1"
          v-for="(plan, index) in messages.marketing_pricing_options.split(',')"
          :key="index"
        >
          <p class="plan-name">
            {{ messages[`marketing_pricing_${plan}_title`] }}
          </p>
          <p class="plan-users">
            {{ messages[`marketing_pricing_${plan}_users`] }}
          </p>
          <p class="plan-pricing">
            {{ messages[`marketing_pricing_${plan}_users`] }}
          </p>
          <p
            class="plan-common-features"
            v-for="option in messages[`marketing_pricing_common_options`].split(
              ','
            )"
            :key="option"
          >
            {{ option }}
          </p>
          <p
            class="plan-features"
            v-for="option in messages[
              `marketing_pricing_${plan}_options`
            ].split(',')"
            :key="option"
          >
            {{ option }}
          </p>
        </div>
      </div>
    </div> -->
  </div>
</template>

<style lang="scss" scoped>
@import '../../_scss/components/form';

.pricing-section-link {
  color: $vivid-navy;
  font-size: 36px;
  margin-top: 25px;
}
</style>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required, email, minLength, sameAs } from 'vuelidate/lib/validators';

import { util } from '~/_helpers';
import { Button, Input, Checkbox } from '~/_components/shared';
import { Features } from '~/_components/sections';

export default {
  components: {
    Button,
    Input,
    Checkbox,

    Features,
  },

  mixins: [validationMixin],
  validations: {
    email: { required, email },
    password: { required, minLength: minLength(8) },
    confirmPassword: {
      sameAsPassword: sameAs('password'),
    },
    promoCode: {
      required,
    },
    agreeToTerms: {
      required,
    },
  },

  data() {
    return {
      email: '',
      password: '',
      receiveInformationalMessages: false,
      receivePromotionalMessages: false,
      agreeToTerms: null,
      promoCode: null,
      payMethods: null,
      selectedPaymentMethod: null,
      paymentMethodObject: null,
      confirmPassword: '',
      submitted: false,
    };
  },

  computed: {
    ...mapState('account', ['status']),
    ...mapState('system', ['messages', 'countries', 'configs']),
    ...mapState('plans', ['plans', 'plan']),
    ...mapState('paymentMethods', [
      'paymentMethods',
      'paymentMethod',
      'accountPaymentMethod',
      'paymentInfo',
    ]),

    emailErrors() {
      const errors = [];
      if (!this.$v.email.$dirty) return errors;
      !this.$v.email.email && errors.push(this.messages['err_email_invalid']);
      !this.$v.email.required &&
        errors.push(this.messages['err_email_required']);
      return errors;
    },

    passwordErrors() {
      const errors = [];
      if (!this.$v.password.$dirty) return errors;
      !this.$v.password.minLength &&
        errors.push(this.messages['err_password_tooShort']);
      !this.$v.password.required &&
        errors.push(this.messages['err_password_required']);
      return errors;
    },

    confirmPasswordErrors() {
      const errors = [];
      if (!this.$v.confirmPassword.$dirty) return errors;
      !this.$v.confirmPassword.sameAsPassword &&
        errors.push(this.messages['err_confirmPassword_mismatch']);
      return errors;
    },

    promoCodeErrors() {
      const errors = [];
      if (!this.$v.promoCode.$dirty) return errors;
      !this.$v.promoCode.required &&
        errors.push(this.messages['err_promoCode_required']);
      return errors;
    },

    agreeToTermsErrors() {
      const errors = [];
      !this.$v.agreeToTerms.$model &&
        errors.push(this.messages['err_terms_required']);
      return errors;
    },
  },

  created() {
    if (this.$route.query.plan) {
      this.getAllPaymentMethods(this.messages, this.errors);
      this.getPlanById({
        planId: this.$route.query.plan,
        messages: this.messages,
        errors: this.errors,
      });
    }
  },

  methods: {
    ...mapActions('account', ['register']),
    ...mapActions('plans', ['getPlanById']),
    ...mapActions('paymentMethods', [
      'getAllPaymentMethods',
      'setPaymentMethod',
    ]),
    ...mapGetters('system', ['promoCodesEnabled', 'promoCodeRequired']),

    handleSubmit(e) {
      this.errors.clear();
      if (util.checkSkipRegistration()) {
        return;
      }
      this.errors.clear();
      this.$v.$touch();
      this.submitted = true;
      if (!this.$v.$invalid) {
        this.register({
          user: {
            email: this.email,
            password: this.password,
            receiveInformationalMessages: this.receiveInformationalMessages,
            receivePromotionalMessages: this.receivePromotionalMessages,
            agreeToTerms: this.agreeToTerms,
            promoCode: this.promoCode,
          },
          messages: this.messages,
          errors: this.errors,
        });
      }
    },
  },

  watch: {
    paymentMethods(pms) {
      if (pms && pms.length) {
        const okMethods = [];
        for (let i = 0; i < pms.length; i++) {
          const pm = pms[i];
          if (!pm.driverClass.endsWith('NoopCloud')) {
            okMethods.push(pm);
          }
        }
        if (okMethods.length === 1) {
          this.selectedPaymentMethod = okMethods[0];
          this.setPaymentMethod(okMethods[0]);
        }
        this.payMethods = okMethods;
      }
    },
    accountPaymentMethod(apm) {
      if (apm) {
        this.paymentMethodObject = apm;
      }
    },
    plan(p) {
      if (p.uuid) {
        this.user.preferredPlan = p.uuid;
      }
    },
    configs(configs) {
      if (configs.allowRegistration === false) {
        this.$route.replace('/login');
      }
    },
  },
};
</script>
