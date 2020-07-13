<template>
  <div
    class="d-flex justify-content-center align-items-center container header"
  >
    <img src="/small-BubbleLogo-Horizontal-BlackText.png" height="40" />
    <div class="flex-grow-1"></div>
    <div class="navbar d-flex justify-content-center align-items-center ">
      <router-link to="/help" class="d-flex align-items-center">
        <Button link>HELP</Button>
      </router-link>
      <router-link to="/sign-up" class="d-flex align-items-center">
        <Button link>SIGN UP</Button>
      </router-link>
      <router-link to="/help" class="d-flex align-items-center">
        <Button color="default">SIGN IN</Button>
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header {
  background-color: white;

  height: 85px;

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
import { Button } from '~/_components/shared';

export default {
  components: {
    Button,
  },
};
</script>
