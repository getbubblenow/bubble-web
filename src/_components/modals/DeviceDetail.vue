<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <modal
    name="device-detail"
    :adaptive="true"
    width="90%"
    :maxWidth="600"
    height="auto"
  >
    <div class="close-btn" @click="hide">
      <i class="fa fa-times"></i>
    </div>

    <form action="" class="form" v-if="device">
      <h2 class="device-text">
        {{ device.name }}
      </h2>
      <img :src="`/device-${device.deviceType}.png`" class="mb-3" />

      <v-select
        v-if="configs.securityLevels"
        :clearable="false"
        :placeholder="messages.label_field_device_security_level"
        :options="configs.securityLevels"
        v-model="device.securityLevel"
        @input="setSecurityLevel($event)"
        class="mb-3 security-level"
      >
        <template v-slot:selected-option="option">
          <span>
            {{ messages.label_field_device_security_level }}: {{ option.label }}
          </span>
        </template>
      </v-select>

      <div
        class="d-flex align-items-center justify-content-center mb-3 flex-wrap"
      >
        <a
          v-if="appLinks"
          target="_blank"
          rel="noopener noreferrer"
          :href="appLinks[device.deviceType]"
          class="mr-3"
        >
          <Button color="default">
            {{ messages.message_download_app }}
          </Button>
        </a>

        <a :href="'/api/auth/cacert?deviceType=' + device.deviceType">
          <Button color="default">
            {{ messages.message_download_ca_cert }}
          </Button>
        </a>
      </div>

      <Button color="outline" @click="onDelete">
        {{ messages.delete }}
      </Button>
    </form>
    <ConfirmDeleteDevice ref="confirm" @confirm="confirm" />
  </modal>
</template>

<style lang="scss">
@import '../../_scss/components/form';
@import '../../_scss/components/modal';
@import '../../_scss/breakpoints';

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 20px;
}

.device-image {
  margin-bottom: 20px;
}

.security-level {
  width: 250px;
}
</style>

<script>
import { mapActions, mapState } from 'vuex';
import { util } from '~/_helpers';

import { Button, Input } from '../shared';
import ConfirmDeleteDevice from './ConfirmDeleteDevice';

export default {
  components: {
    Button,
    Input,
    ConfirmDeleteDevice,
  },

  data: () => ({
    userId: util.currentUser().uuid,
    device: null,
  }),

  methods: {
    ...mapActions('devices', [
      'removeDeviceByUserId',
      'setDeviceSecurityLevel',
    ]),

    show(selectedDevice) {
      this.device = selectedDevice;
      this.$modal.show('device-detail');
    },
    hide() {
      this.$modal.hide('device-detail');
    },

    confirm(v) {
      this.$refs.confirm.hide();
      if (v) {
        this.removeDevice();
      }
    },

    onDelete() {
      this.$refs.confirm.show();
    },

    removeDevice() {
      this.removeDeviceByUserId({
        userId: this.userId,
        deviceId: this.device.uuid,
        messages: this.messages,
        errors: this.errors,
      });
      this.$emit('delete');
    },

    setSecurityLevel(event) {
      this.setDeviceSecurityLevel({
        userId: this.userId,
        deviceId: this.device.uuid,
        securityLevel: event,
        messages: this.messages,
        errors: this.errors,
      });
    },
  },

  computed: {
    ...mapState('system', ['messages', 'appLinks', 'configs']),
  },
};
</script>
