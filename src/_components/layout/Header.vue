<template>
  <div class="header">
    <div class="d-flex justify-content-center align-items-center container ">
      <img src="/small-BubbleLogo-Horizontal-BlackText.png" height="40" />
      <div class="flex-grow-1"></div>
      <div class="navbar d-flex justify-content-center align-items-center ">
        <router-link to="/help" class="d-flex align-items-center">
          <Button link>
            {{ messages.button_label_help || 'Help' }}
          </Button>
        </router-link>
        <router-link to="/sign-up" class="d-flex align-items-center">
          <Button link>
            {{ messages.button_label_sign_up || 'Sign Up' }}
          </Button>
        </router-link>
        <router-link to="/help" class="d-flex align-items-center">
          <Button color="default" width="118" height="48">
            {{ messages.button_label_sign_in || 'Sign In' }}
          </Button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header {
  background-color: white;

  height: 80px;

  .navbar {
    height: 100%;
  }
  .navbar a {
    height: 100%;
    text-decoration: none;
  }
}
</style>

<script>
import { mapState } from 'vuex';
import { Button } from '~/_components/shared';

export default {
  components: {
    Button,
  },
  computed: {
    ...mapState('system', ['messages']),
  },
};
</script>
