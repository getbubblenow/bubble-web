<template>
  <div class="wrapper">
    <h1 class="text-center white-text form-title">
      {{
        configs.sageLauncher ? messages.login_title_sage : messages.login_title
      }}
    </h1>
    <h4 class="text-center white-text form-sub-title">
      {{ messages.login_blurb }}
    </h4>

    <form class="auth-form" @submit.prevent="submit">
      <h4
        v-if="submitted && errors.has('approvalToken')"
        class="invalid-feedback d-block"
      >
        {{ errors.first('approvalToken') }}
      </h4>

      <div class="form-group">
        <Input
          class="form-control"
          :class="{
            'is-invalid': submitted && emailErrors && emailErrors.length,
          }"
          v-model="email"
          @input="$v.email.$touch()"
          :placeholder="messages.field_email_hint"
        />
        <span
          class="form-error"
          v-if="submitted && emailErrors && emailErrors.length"
        >
          {{ emailErrors.join(', ') }}
        </span>
        <div
          v-if="submitted && errors.has('account')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('account') }}
        </div>
        <div
          v-if="submitted && errors.has('name')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('name') }}
        </div>
      </div>
      <div class="form-group">
        <Input
          class="form-control"
          type="password"
          :class="{
            'is-invalid': submitted && passwordErrors && passwordErrors.length,
          }"
          v-model="password"
          @input="$v.password.$touch()"
          :placeholder="messages.field_label_enter_password"
        />
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

      <div class="form-group" v-if="showTotp">
        <Input
          class="form-control"
          :class="{
            'is-invalid': submitted && totpErrors && totpErrors.length,
          }"
          v-model="totpToken"
          @input="$v.totpToken.$touch()"
          :placeholder="messages.field_label_totp_code"
        />
        <span
          class="form-error"
          v-if="submitted && totpErrors && totpErrors.length"
        >
          {{ totpErrors.join(', ') }}
        </span>
        <div
          v-if="submitted && errors.has('totpToken')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('totpToken') }}
        </div>
      </div>
      <div
        class="form-group"
        v-if="
          configs &&
            configs.locked === true &&
            (configs.launchLock === null || configs.launchLock)
        "
      >
        <Input
          class="form-control"
          :class="{
            'is-invalid':
              submitted && unlockKeyErrors && unlockKeyErrors.length,
          }"
          v-model="unlockKey"
          @input="$v.unlockKey.$touch()"
          :placeholder="messages.field_label_unlock_key"
        />
        <span
          class="form-error"
          v-if="submitted && unlockKeyErrors && unlockKeyErrors.length"
        >
          {{ unlockKeyErrors.join(', ') }}
        </span>
        <div
          v-if="submitted && errors.has('unlockKey')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('unlockKey') }}
        </div>
      </div>

      <router-link to="/forgotPassword">
        {{ messages.button_label_forgotPassword }}
      </router-link>
      <Button
        color="default"
        class="auth-form-submit"
        @click="submit"
        :disabled="status.loggingIn"
      >
        {{ messages.button_label_sign_in }}
      </Button>

      <p
        class="text-center description"
        v-html="messages.message_login_agreeToTerms"
      ></p>
    </form>
    <p class="text-center mt-4">
      {{ messages.registration_label }}
      <router-link to="/sign-up">
        {{ messages.button_label_sign_up }}
      </router-link>
    </p>
  </div>
</template>

<style lang="scss" scoped>
@import '../../_scss/components/form';

.description {
  margin-top: 32px;
}
</style>

<script>
import { mapState, mapActions } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required, email, minLength } from 'vuelidate/lib/validators';

import { Button, Input } from '~/_components/shared';

export default {
  components: {
    Button,
    Input,
  },

  mixins: [validationMixin],
  validations: {
    email: { required, email },
    password: { required, minLength: minLength(8) },
  },

  data() {
    return {
      email: '',
      password: '',
      totpToken: null,
      unlockKey:
        this.$route.query && this.$route.query.k ? this.$route.query.k : null,
      showTotp: false,
      submitted: false,
    };
  },

  created() {
    this.loadSystemConfigs();
  },

  computed: {
    ...mapState('account', [
      'status',
      'loginError',
      'resetPasswordMessageSent',
    ]),
    ...mapState('system', ['configs', 'messages']),

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

    totpErrors() {
      const errors = [];
      if (!this.$v.totpToken.$dirty) return errors;
      !this.$v.totpToken.required &&
        errors.push(this.messages['err_totpToken_invalid']);
      return errors;
    },

    unlockKeyErrors() {
      const errors = [];
      if (!this.$v.unlockKey.$dirty) return errors;
      !this.$v.unlockKey.required &&
        errors.push(this.messages['err_unlock_required']);
      return errors;
    },
  },

  methods: {
    ...mapActions('account', ['login', 'logout']),
    ...mapActions('system', ['loadSystemConfigs']),

    submit() {
      this.errors.clear();
      this.$v.$touch();
      this.submitted = true;
      if (!this.$v.$invalid) {
        this.login({
          user: {
            name: this.email,
            password: this.password,
            totpToken: this.totpToken,
            unlockKey: this.unlockKey,
          },
          systemConfigs: this.configs,
          messages: this.messages,
          errors: this.errors,
        });
      }
    },
  },

  watch: {
    loginError(e) {
      if (
        (e && e === 'err_totpToken_required') ||
        e === 'err_totpToken_invalid'
      ) {
        this.showTotp = true;
      }
    },

    error(e) {
      console.log('watch error', e);
    },
  },
};
</script>
