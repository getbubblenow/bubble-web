<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="wrapper">
    <h1 class="text-center white-text form-title">
      {{ messages.form_title_forgotPassword }}
    </h1>
    <h4 class="text-center white-text form-sub-title">
      {{ messages.forgot_password_blurb }}
    </h4>

    <form class="bubble-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <Input
          class="form-control"
          v-model="email"
          :placeholder="messages.field_email_hint"
        />
        <span
          class="form-error"
          v-if="submitted && emailErrors && emailErrors.length"
        >
          {{ emailErrors.join(', ') }}
        </span>
        <div
          v-if="submitted && errors.has('name')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('name') }}
        </div>
      </div>
      <Button
        color="default"
        class="bubble-form-submit"
        block
        @click="handleSubmit"
        :disabled="status.sendingResetPasswordMessage"
      >
        {{ messages.button_label_forgot_password }}
      </Button>
      <p class="text-center mt-3">
        <router-link to="/login">
          {{ messages.forgot_password_login_link }}
        </router-link>
      </p>
    </form>
  </div>
</template>

<style lang="scss" scoped>
@import '../../_scss/components/form';

.title {
  margin-top: 80px;
}

.sub-title {
  margin-top: 16px;
}

.forgot-password-btn {
  margin-top: 55px;
}

.privacy-description {
  width: 280px;
  font-size: 14px;
  margin: 32px auto 8px;
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
  },

  data() {
    return {
      email: '',
      submitted: false,
    };
  },

  computed: {
    ...mapState('system', ['configs', 'messages']),
    ...mapState('account', ['status', 'resetPasswordMessageSent']),

    emailErrors() {
      const errors = [];
      if (!this.$v.email.$dirty) return errors;
      !this.$v.email.email && errors.push(this.messages['err.email.invalid']);
      !this.$v.email.required &&
        errors.push(this.messages['err.email.required']);
      return errors;
    },
  },
  methods: {
    ...mapActions('account', ['forgotPassword']),
    handleSubmit(e) {
      this.errors.clear();
      this.$v.$touch();
      this.submitted = true;
      if (!this.$v.$invalid) {
        this.forgotPassword({
          username: this.email,
          messages: this.messages,
          errors: this.errors,
        })
          .then(() => {
            this.$snotify.success(this.messages.message_resetPassword_sent);
          })
          .catch((err) => {
            this.$snotify.error(this.messages.message_resetPassword_sent);
          });
      }
    },
  },
  watch: {
    resetPasswordMessageSent(m) {
      if (m === true) this.$router.push('/login');
    },
  },
};
</script>
