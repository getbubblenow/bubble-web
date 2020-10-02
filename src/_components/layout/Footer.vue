<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <footer class="footer">
    <p class="text-white text-center">
      {{ messages.label_get_bubble_for_devices }}
    </p>
    <div class="devices">
      <a
        class="device"
        v-for="device in availableDevices"
        :key="device"
        download
        :href="appLink(device)"
      >
        <img :src="`/${device}.png`" />
        <span>{{ messages[`label_device_${device}`] }}</span>
      </a>
    </div>
    <div class="links">
      <a
        class="text-white link"
        v-for="item in footerLinks"
        :key="item"
        :href="messages[`link_${item}`]"
        :target="
          messages[`link_${item}`].startsWith('http') ? '_blank' : '_self'
        "
      >
        {{ messages[`title_${item}`] }}
      </a>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@import '../../_scss/breakpoints';

.footer {
  z-index: 1;
  & > * {
    margin: 20px 0;
  }

  p {
    font-size: 26px;
    line-height: 30px;
  }

  @include respond-below(sm) {
    padding: 0 70px;
  }
}

.devices,
.links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.device {
  width: 165px;
  padding: 10px;

  @include respond-below(lg) {
    width: 120px;
    padding: 10px 0;
  }

  margin: 10px;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0px 5px 30px #1551ab;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  span {
    font-size: 12px;
    color: #7c7c7c;
    margin-top: 16px;
  }
}

.link {
  font-size: 14px;
  &:not(:last-child) {
    display: inline-flex;
    align-items: center;
    &:after {
      content: '';
      width: 3px;
      height: 3px;
      background-color: white;
      margin: 0 12px;
      display: inline-flex;
      border-radius: 3px;
    }
  }
}
</style>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState('system', ['messages', 'appLinks']),

    availableDevices() {
      return this.messages.available_devices
        ? this.messages.available_devices.split(',')
        : [];
    },

    footerLinks() {
      return this.messages.footer_links
        ? this.messages.footer_links.split(',')
        : [];
    },
  },
  methods: {
    appLink(type) {
      if (!this.appLinks) return '';
      switch (type) {
        case 'iphone':
          return this.appLinks['ios'];
        case 'android':
          return this.appLinks['android'];
        case 'mac_computer':
          return this.appLinks['macos'];
        case 'windows_computer':
          return this.appLinks['windows'];
        case 'linux_computer':
          return this.appLinks['linux'];
        default:
          return '';
      }
    },
  },
};
</script>
