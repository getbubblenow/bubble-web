<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
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

    <form class="bubble-form" @submit.prevent="submit">
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
            'is-invalid': submitted && errors.has('name'),
          }"
          v-model="email"
          :placeholder="messages.field_email_hint"
        />
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
            'is-invalid': submitted && errors.has('password'),
          }"
          v-model="password"
          :placeholder="messages.field_label_enter_password"
        />
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
            'is-invalid': submitted && errors.has('totpToken'),
          }"
          v-model="totpToken"
          :placeholder="messages.field_label_totp_code"
        />
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
            'is-invalid': submitted && errors.has('unlockKey'),
          }"
          v-model="unlockKey"
          :placeholder="messages.field_label_unlock_key"
        />
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
        block
        color="default"
        class="bubble-form-submit"
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
    <p class="text-center mt-4" v-if="configs.allowRegistration === true">
      {{ messages.registration_label }}
      <router-link to="/register">
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

  computed: {
    ...mapState('account', [
      'status',
      'loginError',
      'resetPasswordMessageSent',
    ]),
    ...mapState('system', ['configs', 'messages']),
  },

  methods: {
    ...mapActions('account', ['login', 'logout']),

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
