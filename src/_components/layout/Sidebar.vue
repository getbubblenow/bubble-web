<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="d-flex align-items-center logo">
      <router-link to="/">
        <img src="/small-BubbleLogo-Horizontal-BlackText.png" height="40" />
      </router-link>
      <a @click="toggleMenu" class="toggle-menu">
        <i class="fa fa-bars"></i>
      </a>
    </div>
    <div
      class="flex-grow-1 d-flex flex-column menu"
      :class="{ 'menu-invisible': !menuVisible }"
    >
      <!-- Profile -->
      <router-link to="/me" @click.native="closeMenu()">
        <div class="profile">
          <img
            :src="`https://www.gravatar.com/avatar/${userHash}?r=pg`"
            class="profile-image"
          />
          <div class="profile-info">
            <strong>{{ currentUser.name }}</strong>
            <br />
            <span>{{ currentUser.email }}</span>
          </div>
          <i class="fa fa-chevron-right"></i>
        </div>
      </router-link>

      <!-- Navigation -->
      <div class="navigation">
        <router-link
          to="/bubble"
          class="navigation-item"
          @click.native="closeMenu()"
        >
          <i class="fa fa-home icon icon-home"></i>
          <span>{{ messages.label_menu_network }}</span>
        </router-link>

        <router-link
          to="/devices"
          v-if="!configs.sageLauncher"
          class="navigation-item"
        >
          <i class="fa fa-tablet icon icon-devices"></i>
          <span>{{ messages.label_menu_devices }}</span>
        </router-link>

        <router-link
          to="/apps"
          v-if="!configs.sageLauncher"
          class="navigation-item"
        >
          <i class="fa fa-smile icon icon-apps"></i>
          <span>{{ messages.label_menu_apps }}</span>
        </router-link>

        <router-link
          to="/admin/accounts"
          v-if="!configs.sageLauncher"
          class="navigation-item"
        >
          <i class="fa fa-users icon icon-users"></i>

          <span>
            {{ messages.label_menu_admin_users }}
          </span>
        </router-link>

        <!-- settings -->
        <!-- <router-link class="navigation-item">
          <i class="fa fa-cog icon icon-settings"></i>
          <span>{{ messages.label_menu_settings }}</span>
        </router-link> -->

        <router-link
          to="/support"
          class="navigation-item"
          @click.native="closeMenu()"
        >
          <i class="fa fa-question-circle icon icon-help"></i>
          <span>{{ messages.label_menu_help }}</span>
        </router-link>
      </div>
      <!-- Upgrade Plan -->

      <!-- <div class="flex-grow-1"></div> -->
      <!-- Logout -->
      <router-link
        to="/logout"
        class="logout-button"
        @click.native="closeMenu()"
      >
        <Button color="outline" block>
          {{ messages.log_out }}
        </Button>
      </router-link>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
@import '../../_scss/breakpoints';

.sidebar {
  z-index: 1;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.logout-button {
  margin-top: 30px;
}

.profile {
  color: #172239;
  margin-top: 30px;
  padding: 24px;
  border: 1px solid #e0e2f0;
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  @include respond-between(sm, lg) {
    margin-top: 0px;
    border: none;
    > *:not(.profile-image) {
      display: none;
    }
  }
}

.logo {
  padding: 0 20px;
}

.profile-image {
  height: 48px;
  width: 48px;
  border-radius: 50%;
}
.profile-info {
  width: 156px;
  overflow: hidden;
  text-overflow: ellipsis;

  margin: 0 20px;
  font-size: 12px;
  strong {
    font-size: 16px;
  }
}

.toggle-menu {
  display: none;
  @include respond-below(sm) {
    display: block;
  }
}

.menu {
  max-height: 10000px;
  padding: 0 20px 20px;

  transition: max-height 0.5s;
  overflow: hidden;
  background-color: white;

  @include respond-below(sm) {
    position: absolute;
    left: 0;
    right: 0;
    top: 60px;

    &.menu-invisible {
      max-height: 0px;
    }
  }
}

.navigation {
  margin-top: 30px;
  border: 1px solid #e0e2f0;
  border-radius: 32px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @include respond-between(sm, lg) {
    margin-top: 12px;
    span {
      display: none;
    }
  }
}

.navigation-item {
  color: #6d6d78;
  padding: 16px;
  margin: 10px 0;
  width: 240px;

  display: flex;
  align-items: center;

  span {
    margin-left: 20px;
  }

  &.router-link-active {
    background-color: #66cda4;
    color: white;
    border-radius: 20px;

    .icon {
      color: white;
    }
  }

  @include respond-between(sm, lg) {
    width: auto;
  }
}

.toggle-menu {
  margin-left: 20px;
  font-size: 20px;
  font-weight: bold;
  color: #1930d7 !important;
}

.icon {
  font-size: 20px;
  width: 20px;
}

.icon-home {
  color: #5055bd;
}
.icon-devices {
  color: #4b53df;
}
.icon-apps {
  color: #9916df;
}
.icon-users {
  color: #2ed1a1;
}
.icon-settings {
  color: #e6458a;
}
.icon-help {
  color: #57c8e9;
}
</style>

<script>
import { mapState } from 'vuex';
import md5 from 'blueimp-md5';

import { util } from '~/_helpers';
import { Button } from '~/_components/shared';

export default {
  components: {
    Button,
  },

  data: () => ({
    currentUser: util.currentUser(),
    menuVisible: false,
  }),

  computed: {
    ...mapState('system', ['messages', 'configs']),

    userHash() {
      return md5(this.currentUser.email);
    },
  },

  methods: {
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    },
    closeMenu() {
      console.log('click.nativeed');
      this.menuVisible = false;
    },
  },
};
</script>
