<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="wrapper">
    <h1 class="text-center white-text form-title">
      {{ messages.form_title_set_password }}
    </h1>

    <form class="bubble-form" @submit.prevent="setPass()">
      <h4
        v-if="submitted && errors.has('approvalToken')"
        class="invalid-feedback d-block"
      >
        {{ errors.first('approvalToken') }}
      </h4>
      <div class="form-group">
        <Input
          type="password"
          v-validate="'required'"
          v-model="newPassword"
          name="newPassword"
          class="form-control"
          :placeholder="messages.field_label_new_password"
        />
        <div
          v-if="submitted && errors.has('password')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('password') }}
        </div>
      </div>
      <div class="form-group">
        <Input
          type="password"
          v-validate="'required'"
          v-model="newPasswordConfirm"
          name="newPasswordConfirm"
          class="form-control"
          :placeholder="messages.field_label_new_password_confirm"
        />
      </div>

      <div v-if="showTotp" class="form-group">
        <p>{{ messages.message_set_password_authenticator_auth }}</p>
        <Input
          v-validate="'required'"
          v-model="totpToken"
          name="totpToken"
          class="form-control"
          :placeholder="messages.field_label_totp_code"
        />
        <div
          v-if="submitted && errors.has('totpToken')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('totpToken') }}
        </div>
      </div>

      <div class="form-group">
        <Button
          color="default"
          class="bubble-form-submit"
          type="submit"
          block
          :disabled="loading()"
        >
          {{ messages.button_label_set_password }}
        </Button>
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
@import '../../../_scss/components/form';

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
import { mapState, mapActions, mapGetters } from 'vuex';
import { util } from '~/_helpers';

import { Button, Input } from '~/_components/shared';

export default {
  components: {
    Input,
    Button,
  },

  data() {
    return {
      submitted: false,
      userId: null,
      newPassword: null,
      newPasswordConfirm: null,
      code: null,
      showTotp: false,
      totpToken: null,
    };
  },
  computed: {
    ...mapState('account', ['actionStatus']),
    ...mapState('users', ['user', 'policy', 'changePasswordResponse']),
    ...mapState('system', ['messages']),
  },
  methods: {
    ...mapActions('account', ['approveAction', 'denyAction']),
    ...mapActions('users', [
      'getUserById',
      'getPolicyByUserId',
      'changePassword',
    ]),
    ...mapGetters('users', ['loading']),
    setPass(e) {
      // todo: verify that newPassword === newPasswordConfirm
      this.errors.clear();
      this.submitted = true;
      const dataParams = [{ name: 'password', value: this.newPassword }];
      if (this.totpToken) {
        dataParams.push({ name: 'totpToken', value: this.totpToken });
      }
      this.approveAction({
        userId: this.userId,
        code: this.code,
        data: dataParams,
        messages: this.messages,
        errors: this.errors,
        enableTotpModal: false,
      });
    },
  },
  created() {
    if (
      typeof this.$route.params.code === 'undefined' ||
      this.$route.params.code === null ||
      this.$route.params.code === ''
    ) {
      console.log('SetPasswordPage: no code found, sending to home');
      this.$router.push('/');
    }
    this.code = this.$route.params.code;

    if (
      typeof this.$route.query.user !== 'undefined' &&
      this.$route.query.user !== null &&
      this.$route.query.user !== ''
    ) {
      this.userId = this.$route.query.user;
    } else {
      this.userId =
        this.currentUser !== null
          ? this.currentUser.uuid
          : util.userLoggedIn()
          ? util.currentUser().uuid
          : null;
    }
    if (this.userId === null) {
      console.warn(
        'SetPasswordPage.created: no user found in session or query'
      );
    }
  },
  watch: {
    actionStatus(status) {
      if (status) {
        console.log(
          'SetPasswordPage.watch.actionStatus: received: ' +
            JSON.stringify(status)
        );
        if (
          status.error &&
          status.error.length > 0 &&
          status.error.filter(
            (e) =>
              e === 'err_totpToken_required' || e === 'err_totpToken_invalid'
          )
        ) {
          console.log(
            'SetPasswordPage.watch.actionStatus: set this.showTotp=' +
              this.showTotp
          );
          this.showTotp = true;
        } else if (status.success && status.success === true) {
          console.log(
            'SetPasswordPage.watch.actionStatus: success, sending to home'
          );
          this.$router.push('/');
        }
      }
    },
  },
};
</script>
