<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div>
    <h2>{{ messages.form_title_login }}</h2>
    <h4 v-if="resetPasswordMessageSent === true" class="alert-success">
      {{ messages.message_resetPassword_sent }}
    </h4>
    <h4
      v-if="submitted && errors.has('approvalToken')"
      class="invalid-feedback d-block"
    >
      {{ errors.first('approvalToken') }}
    </h4>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">{{ messages.field_label_email }}</label>
        <input
          type="text"
          v-model="name"
          name="name"
          class="form-control"
          :class="{ 'is-invalid': submitted && !name }"
        />
        <div v-show="submitted && !name" class="invalid-feedback">
          Name is required
        </div>
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
        <label htmlFor="password">{{ messages.field_label_password }}</label>
        <input
          type="password"
          v-model="password"
          name="password"
          class="form-control"
          :class="{ 'is-invalid': submitted && !password }"
        />
        <div
          v-if="submitted && errors.has('password')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('password') }}
        </div>
      </div>
      <div v-if="showTotp" class="form-group">
        <p>{{ messages.message_login_authenticator_auth }}</p>
        <label htmlFor="totpToken">{{ messages.field_label_totp_code }}</label>
        <input
          v-validate="'required'"
          v-model="totpToken"
          name="totpToken"
          class="form-control"
        />
        <div
          v-if="submitted && errors.has('totpToken')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('totpToken') }}
        </div>
      </div>
      <div
        v-if="
          configs &&
            configs.locked === true &&
            (configs.launchLock === null || configs.launchLock)
        "
        class="form-group"
      >
        <label htmlFor="unlockKey">{{ messages.field_label_unlock_key }}</label>
        <input
          type="password"
          v-model="unlockKey"
          name="unlockKey"
          class="form-control"
          :class="{ 'is-invalid': submitted && !unlockKey }"
        />
        <div v-show="submitted && !unlockKey" class="invalid-feedback">
          Unlock Key is required
        </div>
        <div
          v-if="submitted && errors.has('unlockKey')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('unlockKey') }}
        </div>
      </div>
      <div class="form-group">
        <div>
          <small v-html="messages.message_login_agreeToTerms"></small>
          <hr />
        </div>
        <button class="btn btn-primary" :disabled="status.loggingIn">
          {{ messages.button_label_login }}
        </button>
        <img v-show="status.loggingIn" :src="loadingImgSrc" />
        <router-link
          v-if="configs && configs.allowRegistration"
          to="/register"
          class="btn btn-link"
          >{{ messages.button_label_register }}</router-link
        >
      </div>
      <div class="form-group">
        <router-link to="/forgotPassword" class="btn btn-link">{{
          messages.button_label_forgotPassword
        }}</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { loadingImgSrc } from '~/_store';

export default {
  data() {
    return {
      name: '',
      password: '',
      totpToken: null,
      unlockKey:
        this.$route.query && this.$route.query.k ? this.$route.query.k : null,
      showTotp: false,
      submitted: false,
      loadingImgSrc: loadingImgSrc,
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
  },
  methods: {
    ...mapActions('account', ['login', 'logout']),
    ...mapActions('system', ['loadSystemConfigs']),
    handleSubmit(e) {
      this.errors.clear();
      this.submitted = true;
      const { name, password, totpToken, unlockKey } = this;
      if (name && password) {
        this.login({
          user: { name, password, totpToken, unlockKey },
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
  },
};
</script>
