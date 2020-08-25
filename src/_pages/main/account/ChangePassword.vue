<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="wrapper">
    <h1 class="text-center white-text form-title">
      {{ messages.form_title_change_password }}
      <span v-if="this.me === false"> - {{ this.userId }}</span>
    </h1>

    <h4 class="text-center white-text form-sub-title">
      {{ messages.message_change_password_external_auth }}
    </h4>

    <form class="bubble-form" @submit.prevent="changePass">
      <div v-if="me && requiredExternalAuthContacts.length > 0">
        <div class="form-group">
          <div v-for="(contact, key) in requiredExternalAuthContacts" :key="key">
            {{ messages['field_label_' + contact.type] }}: {{ contact.info }}
          </div>
        </div>
        <div v-if="me && hasRequiredAuthenticator" class="form-group">
          <p>{{ messages.message_change_password_authenticator_auth }}</p>
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
      </div>
      <div v-else>
        <div v-if="me && hasRequiredAuthenticator">
          <p>{{ messages.message_change_password_authenticator_auth }}</p>
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

        <div v-if="me || (user && user.admin)" class="form-group">
          <Input
            type="password"
            v-validate="'required'"
            v-model="currentPassword"
            name="currentPassword"
            class="form-control"
            :placeholder="messages.field_label_current_password"
          />
          <div
            v-if="submitted && errors.has('oldPassword')"
            class="invalid-feedback d-block"
          >
            {{ errors.first('oldPassword') }}
          </div>
          <div
            v-if="submitted && errors.has('currentPassword')"
            class="invalid-feedback d-block"
          >
            {{ errors.first('currentPassword') }}
          </div>
        </div>

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
      </div>
      <Button
        color="default"
        class="bubble-form-submit"
        block
        @click="changePass"
        :disabled="loading()"
      >
        {{ messages.button_label_change_password }}
      </Button>
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
    Button,
    Input,
  },

  data() {
    return {
      submitted: false,
      me: null,
      linkPrefix: null,
      userId: null,
      currentUser: util.currentUser(),
      currentPassword: null,
      newPassword: null,
      newPasswordConfirm: null,
      totpToken: null,
      hasRequiredAuthenticator: null,
      hasRequiredExternalAuth: null,
      requiredExternalAuthContacts: [],
    };
  },
  computed: {
    ...mapState('users', ['user', 'policy', 'changePasswordResponse']),
    ...mapState('system', ['messages']),
  },
  methods: {
    ...mapActions({ alertSuccess: 'alert/success', alertError: 'alert/error' }),
    ...mapActions('users', [
      'getUserById',
      'getPolicyByUserId',
      'changePassword',
      'adminChangePassword',
    ]),
    ...mapGetters('users', ['loading']),
    changePass(e) {
      this.submitted = true;
      this.errors.clear();
      // todo: validate that newPassword and newPasswordConfirm match
      if (this.me) {
        this.changePassword({
          request: {
            oldPassword: this.currentPassword,
            newPassword: this.newPassword,
            totpToken: this.totpToken,
          },
          messages: this.messages,
          errors: this.errors,
        });
      } else if (this.currentUser.admin) {
        this.adminChangePassword({
          userId: this.userId,
          request: {
            oldPassword: this.currentPassword,
            newPassword: this.newPassword,
            totpToken: this.totpToken,
          },
          messages: this.messages,
          errors: this.errors,
        });
      } else {
        // should never happen
        console.warn(
          'Not current user and not admin, API call would fail anyway, not sending'
        );
      }
    },
  },
  created() {
    if (util.validateAccount(this)) {
      this.getUserById({
        userId: this.userId,
        messages: this.messages,
        errors: this.errors,
      });
      this.getPolicyByUserId({
        userId: this.userId,
        messages: this.messages,
        errors: this.errors,
      });
    }
  },
  watch: {
    policy(p) {
      if (p) {
        const contacts = [];
        if (p.accountContacts && p.accountContacts.length > 0) {
          for (let i = 0; i < p.accountContacts.length; i++) {
            const contact = p.accountContacts[i];
            if (
              contact.type !== 'authenticator' &&
              contact.requiredForAccountOperations === true &&
              contact.info
            ) {
              contacts.push(contact);
            } else if (
              contact.type === 'authenticator' &&
              contact.requiredForAccountOperations === true
            ) {
              this.hasRequiredAuthenticator = true;
            }
          }
        }
        // console.log('watch.policy: setting requiredExternalAuthContacts = '+JSON.stringify(contacts));
        this.requiredExternalAuthContacts = contacts;
      }
    },
    changePasswordResponse(r) {
      if (r) {
        if (r.uuid && r.token) {
          this.alertSuccess(
            this.messages['message_change_password_request_sent']
          );
        } else {
          this.alertError(this.messages['message_change_password_error']);
        }
      }
    },
  },
};
</script>
