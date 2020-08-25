<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="wrapper">
    <h1 class="text-center white-text form-title">
      {{ messages.form_title_ssh_keys }}
      <span v-if="this.me === false"> - {{ this.userId }}</span>
    </h1>
    <div class="bubble-form">
      <table border="1">
        <thead>
          <tr>
            <td>{{ messages.field_label_ssh_key_name }}</td>
            <!--                <td>{{messages.field_label_ssh_key_public_key_hash}}</td>-->
            <td>{{ messages.field_label_ssh_key_expiration }}</td>
            <td><!-- delete --></td>
          </tr>
        </thead>
        <tbody v-if="sshKeys">
          <tr v-for="(key, index) in sshKeys" :key="index">
            <td>{{ key.name }}</td>
            <!--                <td><small>{{key.sshPublicKeyHash}}</small></td>-->
            <td nowrap="nowrap">
              <span v-if="key.expiration">{{
                messages.date_format_ssh_key_expiration.parseDateMessage(
                  key.expiration,
                  messages
                )
              }}</span>
              <span v-else>{{ messages.message_ssh_key_no_expiration }}</span>
            </td>
            <td>
              <i
                @click="removeSshKey(key.uuid)"
                aria-hidden="true"
                :class="messages.button_label_remove_ssh_key_icon"
                :title="messages.button_label_remove_ssh_key"
              ></i>
              <span class="sr-only">
                {{ messages.button_label_remove_ssh_key }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <hr />

      <Button color="default" block @click="addSSHKey">
        {{ messages.form_title_add_ssh_key }}
      </Button>

      <AddSSHKeyModal ref="sshKeyModal" />
    </div>
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
import { Settings } from 'luxon';

import { Button } from '~/_components/shared';
import { AddSSHKeyModal } from '~/_components/modals';

export default {
  components: {
    Button,
    AddSSHKeyModal,
  },

  data() {
    return {
      me: null,
      userId: null,
      linkPrefix: null,
      submitted: false,
      currentUser: util.currentUser(),
      name: null,
      expiration: null,
      sshPublicKey: null,
      minExpiration: new Date().toISOString(),
      timezone: null,
    };
  },
  computed: {
    ...mapState('system', ['messages', 'detectedTimezone', 'detectedLocale']),
    ...mapState('users', ['user', 'sshKeys']),
    newKeyValid() {
      return (
        this.name !== null &&
        this.name !== '' &&
        (this.sshPublicKey !== null &&
          this.sshPublicKey !== '' &&
          this.sshPublicKey.startsWith('ssh-rsa '))
      );
    },
    dateControlPhrases() {
      return {
        ok: this.messages.message_datecontrol_ok,
        cancel: this.messages.message_datecontrol_cancel,
      };
    },
  },
  methods: {
    ...mapActions('system', ['detectTimezone', 'detectLocale']),
    ...mapActions('users', [
      'addSshKeyByUserId',
      'removeSshKeyByUserId',
      'listSshKeysByUserId',
    ]),
    ...mapGetters('users', ['loading']),
    addSSHKey() {
      this.$refs.sshKeyModal.show();
    },
    removeSshKey(keyId) {
      this.removeSshKeyByUserId({
        userId: this.userId,
        sshKeyId: keyId,
        messages: this.messages,
        errors: this.errors,
      });
    },
  },
  watch: {
    detectedLocale(locale) {
      if (locale) {
        Settings.defaultLocale = util.jsLocale(this.user, locale);
      }
    },
    detectedTimezone(tz) {
      if (tz) this.timezone = tz.timeZoneId;
    },
  },
  created() {
    if (
      this.detectedTimezone === null ||
      !this.detectedTimezone.hasOwnProperty('timeZoneId')
    ) {
      this.detectTimezone();
    } else {
      this.timezone = this.detectedTimezone.timeZoneId;
    }

    if (util.validateAccount(this)) {
      this.listSshKeysByUserId({
        userId: this.userId,
        messages: this.messages,
        errors: this.errors,
      });
    }
  },
};
</script>
