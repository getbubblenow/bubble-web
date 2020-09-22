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
        href=""
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
        :to="messages[`link_${item}`]"
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
    ...mapState('system', ['messages']),

    availableDevices() {
      return this.messages.available_devices ? this.messages.available_devices.split(',') : [];
    },

    footerLinks() {
      return this.messages.footer_links ? this.messages.footer_links.split(',') : [];
    },
  },
};
</script>
