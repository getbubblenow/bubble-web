<template>
  <div class="header d-flex align-items-center">
    <div class="d-flex justify-content-center align-items-center container ">
      <img src="/small-BubbleLogo-Horizontal-BlackText.png" height="40" />
      <div class="flex-grow-1"></div>
      <div
        class="navbar justify-content-center align-items-center d-none d-md-flex"
      >
        <router-link to="/help" class="d-flex align-items-center">
          <Button link>
            {{ messages.button_label_help }}
          </Button>
        </router-link>
        <router-link to="/register" class="d-flex align-items-center">
          <Button link>
            {{ messages.button_label_sign_up }}
          </Button>
        </router-link>
        <router-link to="/login" class="d-flex align-items-center">
          <Button color="default" width="118" height="48">
            {{ messages.button_label_sign_in }}
          </Button>
        </router-link>
      </div>
      <div class="navbar d-md-none" @click="toggleNavbar()">
        <i class="fas fa-bars"></i>
      </div>
    </div>

    <div
      class="dropdown-menu dropdown-menu-right d-md-none w-100 my-0"
      :class="{ show: menuVisible }"
      v-click-outside="hide"
    >
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

import { mapState } from 'vuex';
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
    };
  },

  computed: {
    ...mapState('system', ['messages']),
  },

  methods: {
    toggleNavbar() {
      this.menuVisible = !this.menuVisible;
    },
    hide() {
      this.menuVisible = false;
    },
  },
};
</script>
