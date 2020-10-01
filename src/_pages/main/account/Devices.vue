<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div>
    <em v-if="loading && loading.devices">{{ messages.loading_devices }}</em>
    <div v-if="devices && devices.length > 0">
      <h2>{{ messages.table_title_devices }}</h2>
      <div class="row">
        <div
          class="col-12 col-md-6 col-lg-4 col-xl-3"
          v-for="(device, key) in devices"
          :key="key"
        >
          <div class="device">
            <img
              :src="`/device-${device.deviceType}.png`"
              class="device-image"
            />
            <p class="device-text">
              {{ device.name }}
            </p>
            <div v-if="device.status.lastHandshakeTime" class="device-text">
              {{ messages.label_field_device_connection_handshake }}:
              <span v-if="device.status.lastHandshakeDays">
                {{ device.status.lastHandshakeDays }}&nbsp;
                {{
                  device.status.lastHandshakeDays === 1
                    ? messages.units_day
                    : messages.units_days
                }}
              </span>
              <span
                v-else-if="
                  device.status.lastHandshakeHours &&
                    device.status.lastHandshakeMinutes
                "
              >
                {{ device.status.lastHandshakeHours
                }}{{ messages.units_hours_short }},
                {{ device.status.lastHandshakeMinutes
                }}{{ messages.units_minutes_short }}
              </span>
              <span v-else-if="device.status.lastHandshakeHours">
                {{ device.status.lastHandshakeHours
                }}{{ messages.units_hours_short }}
              </span>
              <span
                v-else-if="
                  device.status.lastHandshakeMinutes &&
                    device.status.lastHandshakeSeconds
                "
              >
                {{ device.status.lastHandshakeMinutes
                }}{{ messages.units_minutes_short }},
                {{ device.status.lastHandshakeSeconds
                }}{{ messages.units_seconds_short }}
              </span>
              <span v-else-if="device.status.lastHandshakeMinutes">
                {{ device.status.lastHandshakeMinutes
                }}{{ messages.units_minutes_short }}
              </span>
              <span v-else-if="device.status.lastHandshakeSeconds">
                {{ device.status.lastHandshakeSeconds
                }}{{ messages.units_seconds_short }}
              </span>
              {{ messages.label_field_device_connection_handshake_ago }}
            </div>
            <div v-if="device.status.ip" class="device-text">
              {{ device.status.ip }}
            </div>
            <div v-if="device.status.location" class="device-text">
              <span
                v-if="
                  device.status.location.city &&
                    device.status.location.region &&
                    device.status.location.country
                "
              >
                {{ device.status.location.city }},
                {{ device.status.location.region }},
                {{ messages['country_' + device.status.location.country] }}
              </span>
              <span
                v-else-if="
                  device.status.location.region &&
                    device.status.location.country
                "
              >
                {{ device.status.location.region }},
                {{ messages['country_' + device.status.location.country] }}
              </span>
              <span
                v-else-if="
                  device.status.location.city && device.status.location.country
                "
              >
                {{ device.status.location.city }},
                {{ messages['country_' + device.status.location.country] }}
              </span>
              <span v-else-if="device.status.location.country">
                {{ messages['country_' + device.status.location.country] }}
              </span>
              <span
                v-else-if="
                  device.status.location.city && device.status.location.region
                "
              >
                {{ device.status.location.city }},
                {{ device.status.location.region }}
              </span>
              <span v-else-if="device.status.location.region">
                {{ device.status.location.region }}
              </span>
              <span v-else-if="device.status.location.city">
                {{ device.status.location.city }}
              </span>
            </div>
            <a @click="showDetails(device)" class="device-details">
              {{ messages.label_button_detail }}
            </a>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      {{ messages.no_devices_added }}
    </div>
    <DeviceDetailModal ref="deviceDetail" @delete="onDeleteDevice" />
  </div>
</template>

<style lang="scss" scoped>
@import '../../../_scss/components/form';

.bubble-form {
  width: 800px;
}

.device {
  display: flex;
  padding: 30px;
  flex-direction: column;
  align-items: center;
}

.device-image {
  height: 80px;
  margin-bottom: 10px;
}

.device-text {
  color: #666;
  font-size: 12px;
  line-height: 20px;
  margin-bottom: 8px;
}

.device-details {
  color: #221fe0 !important;
  font-size: 14px;
}
</style>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { util } from '~/_helpers';
import config from 'config';
import { loadingImgSrc } from '~/_store';

import { Input, Button } from '~/_components/shared';
import { DeviceDetailModal } from '~/_components/modals';

export default {
  components: {
    Input,
    Button,
    DeviceDetailModal,
  },
  data() {
    return {
      user: util.currentUser(),
      userId: util.currentUser().uuid,
      loadingImgSrc: loadingImgSrc,
    };
  },
  computed: {
    ...mapState('devices', [
      'deviceTypes',
      'devices',
      'device',
      'qrCodeImageBase64',
      'vpnConfBase64',
    ]),
    ...mapState('system', ['messages', 'appLinks', 'configs']),
    ...mapGetters('devices', ['loading']),
  },
  created() {
    this.getDevicesByUserId({
      userId: this.userId,
      messages: this.messages,
      errors: this.errors,
    });
    const user = util.currentUser();
    if (user) this.getAppLinks(user.locale);
    this.loadSystemConfigs();
  },
  methods: {
    ...mapActions('devices', ['getDevicesByUserId', 'setDeviceSecurityLevel']),
    ...mapActions('system', ['getAppLinks', 'loadSystemConfigs']),

    showDetails(device) {
      this.$refs.deviceDetail.show(device);
    },

    onDeleteDevice() {
      this.$refs.deviceDetail.hide();
      this.getDevicesByUserId({
        userId: this.userId,
        messages: this.messages,
        errors: this.errors,
      });
    },
  },
};
</script>
