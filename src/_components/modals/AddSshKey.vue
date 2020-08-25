<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <modal
    name="add-ssh-key"
    :adaptive="true"
    width="90%"
    :maxWidth="600"
    height="auto"
  >
    <form action="" class="form" @submit.prevent="addSshKey">
      <div class="form-group">
        <textarea
          :placeholder="messages.field_label_ssh_key_public_key"
          name="publicSsh"
          class="form-control public-ssh"
          rows="8"
          v-model="sshPublicKey"
        ></textarea>
        <div
          class="description text-left"
          v-html="messages.field_description_ssh_key_public_key"
        ></div>
        <div
          v-if="submitted && errors.has('sshPublicKey')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('sshPublicKey') }}
        </div>
      </div>

      <div class="form-group">
        <Input
          class="form-control"
          :placeholder="messages.field_label_ssh_key_name"
          v-model="name"
        />
        <div
          v-if="submitted && errors.has('name')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('name') }}
        </div>
      </div>

      <div class="form-group">
        <datetime
          v-model="expiration"
          input-id="expiration"
          input-class="form-control"
          class="position-relative"
          :min-datetime="minExpiration"
          :phrases="dateControlPhrases"
          :zone="timezone"
          :week-start="parseInt(messages.datecontrol_weekstart)"
          :placeholder="messages.field_label_ssh_key_expiration"
        >
          <template slot="after">
            <a v-if="expiration" href="#" class="clear-date" @click="clearDate">
              &times;
            </a>
          </template>
        </datetime>
        <div
          class="description text-left"
          v-html="messages.field_description_ssh_key_expiration"
        ></div>
        <div
          v-if="submitted && errors.has('expiration')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('expiration') }}
        </div>
      </div>

      <div
        class="form-group mt-4 d-flex justify-content-center align-items-center"
      >
        <div class="flex-grow-1 pr-2">
          <Button block color="outline" @click="hide">
            {{ messages.button_label_cancel }}
          </Button>
        </div>
        <div class="flex-grow-1 pl-2">
          <Button block color="default" type="submit">
            {{ messages.button_label_add_ssh_key }}
          </Button>
        </div>
      </div>
    </form>
  </modal>
</template>

<style lang="scss">
@import '../../_scss/components/form';
@import '../../_scss/components/modal';
@import '../../_scss/breakpoints';

.public-ssh {
  font-size: 14px;
}

.clear-date {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}
</style>

<script>
import { mapActions, mapState } from 'vuex';
import { util } from '~/_helpers';

import { Button, Input } from '../shared';

export default {
  components: {
    Button,
    Input,
  },

  data: () => ({
    name: '',
    sshPublicKey: '',
    minExpiration: new Date().toISOString(),
    expiration: null,
    timezone: null,
    submitted: false,
  }),

  methods: {
    ...mapActions('system', ['detectTimezone']),
    ...mapActions('users', ['addSshKeyByUserId']),

    show() {
      this.$modal.show('add-ssh-key');
    },
    hide() {
      this.$modal.hide('add-ssh-key');
    },

    addSshKey(e) {
      const currentUser = util.currentUser();

      this.errors.clear();
      this.submitted = true;
      this.addSshKeyByUserId({
        userId: currentUser.uuid,
        sshKey: {
          name: this.name,
          sshPublicKey: this.sshPublicKey,
          expirationISO8601: this.expiration,
        },
        messages: this.messages,
        errors: this.errors,
      }).then(() => {
        this.hide();
        this.$emit('updateSsh');
      });
    },

    clearDate(e) {
      e.preventDefault();

      this.expiration = null;
    },
  },

  computed: {
    ...mapState('system', ['messages', 'detectedTimezone']),

    dateControlPhrases() {
      return {
        ok: this.messages.message_datecontrol_ok,
        cancel: this.messages.message_datecontrol_cancel,
      };
    },
  },

  watch: {
    detectedTimezone(tz) {
      if (tz) this.timezone = tz.timeZoneId;
    },

    sshPublicKey(ssh) {
      const sshSections = ssh.split(' ');
      if (sshSections[2]) {
        this.name = sshSections[2];
      }
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
  },
};
</script>
