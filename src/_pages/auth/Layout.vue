<template>
  <div class="auth-layout h-100 d-flex flex-column">
    <Header></Header>
    <div :class="backgroundClass" class="content flex-grow-1">
      <router-view></router-view>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../../_scss/breakpoints';

.content {
  background-repeat: no-repeat;
  background-size: 100% auto;
  background-position-x: center;

  padding: 80px;

  @include respond-below(sm) {
    background-size: 200%, auto;
    padding: 20px;
  }
}

.background1 {
  background-image: url('/background1.svg');
}

.background2 {
  background-image: url('/background2.svg');
}
</style>

<script>
import { Header } from '~/_components/layout';
export default {
  components: {
    Header,
  },
  computed: {
    backgroundClass() {
      const urlNodes = this.$route.fullPath.split('/');
      switch (urlNodes[2]) {
        case 'login':
        case 'forgot-password':
          return 'background1';
        default:
          return 'background2';
      }
      return 'background2';
    },
  },
};
</script>
