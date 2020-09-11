<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="header d-flex align-items-center justify-content-center">
    <div class="d-flex justify-content-center align-items-center container ">
      <img src="/small-BubbleLogo-Horizontal-BlackText.png" height="40" />
      <div class="flex-grow-1"></div>
      <div class="navbar d-none d-lg-flex">
        <!--- If not logged in --->
        <div
          v-if="status.loggedIn !== true"
          class="d-flex justify-content-center align-items-center"
        >
          <router-link to="/help" class="d-flex align-items-center">
            <Button headerLink>
              {{ messages.button_label_help }}
            </Button>
          </router-link>
          <router-link
            v-if="configs.allowRegistration === true"
            to="/register"
            class="d-flex align-items-center"
          >
            <Button headerLink>
              {{ messages.button_label_sign_up }}
            </Button>
          </router-link>
          <router-link to="/login" class="d-flex align-items-center">
            <Button color="default" width="118" height="48">
              {{ messages.button_label_sign_in }}
            </Button>
          </router-link>
        </div>
        <div v-else class="d-flex justify-content-center align-items-center">
          <router-link to="/" class="d-flex align-items-center">
            <Button headerLink>
              {{ messages.label_menu_dashboard }}
            </Button>
          </router-link>
          <router-link to="/bubbles" class="d-flex align-items-center">
            <Button headerLink>
              {{ messages.label_menu_network }}
            </Button>
          </router-link>
          <router-link
            to="/devices"
            class="d-flex align-items-center"
            v-if="!configs.sageLauncher"
          >
            <Button headerLink>
              {{ messages.label_menu_devices }}
            </Button>
          </router-link>
          <router-link
            to="/apps"
            class="d-flex align-items-center"
            v-if="!configs.sageLauncher"
          >
            <Button headerLink>
              {{ messages.label_menu_apps }}
            </Button>
          </router-link>
          <router-link
            to="/admin/accounts"
            class="d-flex align-items-center"
            v-if="!configs.sageLauncher"
          >
            <Button headerLink>
              {{ messages.label_menu_admin_users }}
            </Button>
          </router-link>
          <router-link to="/me" class="d-flex align-items-center">
            <Button headerLink>
              {{ messages.label_menu_account }}
            </Button>
          </router-link>
          <router-link to="/help" class="d-flex align-items-center">
            <Button headerLink>
              {{ messages.button_label_help }}
            </Button>
          </router-link>
          <router-link to="/logout" class="d-flex align-items-center">
            <Button color="default" width="118" height="48">
              {{ messages.label_menu_logout }}
            </Button>
          </router-link>
        </div>
      </div>
      <div class="navbar d-lg-none" @click="toggleNavbar()">
        <i class="fas fa-bars"></i>
      </div>
    </div>

    <div
      :class="{ show: menuVisible }"
      class="dropdown-menu dropdown-menu-right w-100 my-0"
      v-click-outside="hide"
    >
      <div v-if="status.loggedIn === false">
        <router-link class="dropdown-item" to="#">
          {{ messages.button_label_help }}
        </router-link>
        <router-link class="dropdown-item" to="/register">
          {{ messages.button_label_sign_up }}
        </router-link>
        <router-link class="dropdown-item" to="/login">
          {{ messages.button_label_sign_in }}
        </router-link>
      </div>
      <div v-else>
        <router-link class="dropdown-item" to="/">
          {{ messages.label_menu_dashboard }}
        </router-link>
        <router-link class="dropdown-item" to="/bubbles">
          {{ messages.label_menu_network }}
        </router-link>
        <router-link
          to="/devices"
          class="dropdown-item"
          v-if="!configs.sageLauncher"
        >
          {{ messages.label_menu_devices }}
        </router-link>
        <router-link
          to="/apps"
          class="dropdown-item"
          v-if="!configs.sageLauncher"
        >
          {{ messages.label_menu_apps }}
        </router-link>
        <router-link
          to="/admin/accounts"
          class="dropdown-item"
          v-if="!configs.sageLauncher"
        >
          {{ messages.label_menu_admin_users }}
        </router-link>
        <router-link to="/me" class="dropdown-item">
          {{ messages.label_menu_account }}
        </router-link>
        <router-link class="dropdown-item" to="/help">
          {{ messages.button_label_help }}
        </router-link>
        <router-link class="dropdown-item" to="/logout">
          {{ messages.label_menu_logout }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header {
  background-color: white;
  position: relative;
  height: 80px;
  min-height: 80px;

  .navbar {
    height: 100%;
  }
}

.dropdown-menu {
  border-radius: 4px;
  box-shadow: 0px 2px 10px -5px rgb(0, 0, 0);

  font-size: 1em;
}

.dropdown-item {
  padding: 0.5rem 1.5rem;

  font-size: 1em;
}
</style>

<script>
import ClickOutside from 'vue-click-outside';

import { mapState, mapGetters } from 'vuex';
import { Button } from '~/_components/shared';

export default {
  components: {
    Button,
  },
  directives: {
    ClickOutside,
  },

  data() {
    return {
      menuVisible: false,
      timerId: null,
    };
  },

  computed: {
    ...mapState('system', ['messages', 'configs']),
    ...mapState('account', ['status']),
  },

  methods: {
    toggleNavbar() {
      this.menuVisible = !this.menuVisible;
      this.timerId = setTimeout(() => {
        this.timerId = null;
      }, 100);
    },
    hide() {
      if (!this.timerId) {
        this.menuVisible = false;
      }
    },
  },
};
</script>
