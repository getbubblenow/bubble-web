<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="background">
    <div
      :class="backgroundClass"
      class="auth-layout d-flex flex-column content"
    >
      <router-view></router-view>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../../../_scss/breakpoints';

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

.background3 {
  background-image: url('/background3.png');

  background-position: 85% 200px;
  background-size: auto;
}

.background {
  background: linear-gradient(180deg, #f3f3fb 10%, #ededed 50%, #ffffff 80%);
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
      switch (urlNodes[1]) {
        case 'payment':
          return 'background1';
        case 'me': {
          switch (urlNodes[2]) {
            case '':
              return 'background3';
            default:
              return 'background1';
          }
        }
      }

      // new pages in progress
      switch (urlNodes[2]) {
        case 'payment':
          return 'background1';
        case 'me': {
          switch (urlNodes[3]) {
            case '':
              return 'background3';
            default:
              return 'background1';
          }
        }
      }

      return 'background2';
    },
  },
};
</script>
