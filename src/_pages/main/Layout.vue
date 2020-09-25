<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="container-fluid" v-if="isPageAvailable">
    <img src="/bubble_bkgrnd.png" alt="" class="background-image" />
    <div class="content">
      <Sidebar />
      <div class="flex-grow-1 p-4">
        <header>
<!--          <p class="mb-0">{{ messages.label_homepage_welcome }},</p>-->
<!--          <p class="name">{{ currentUser.name }} 👋</p>-->
        </header>
        <main>
          <router-view></router-view>
        </main>
      </div>
      <Notification />
    </div>
    <Footer />
  </div>
</template>

<style lang="scss" scoped>
@import '../../_scss/breakpoints';

.container-fluid {
  background: linear-gradient(26.64deg, #1933dd -10.01%, #18d59d 86.47%);
  height: 100%;
  padding: 30px 20px;

  @include respond-below(lg) {
    padding: 0;
    .content {
      border-radius: 0;
    }
  }

  display: flex;
  flex-direction: column;
}

.background-image {
  position: absolute;
  bottom: 20px;
  left: 100px;
  pointer-events: none;

  @include respond-below(lg) {
    bottom: -20px;
    left: 0px;
  }
  @include respond-below(sm) {
    bottom: -20px;
    left: 0px;
    width: 100%;
  }
}

.content {
  position: relative;
  z-index: 2;
  flex-grow: 1;
  background: #fafafd;
  border-radius: 10px;
  box-shadow: 0px 4px 25px rgba(149, 149, 149, 0.25);

  display: flex;
  @include respond-below(sm) {
    flex-direction: column;
  }
}

header {
  .name {
    color: #172239;
    font-size: 3rem;
  }
}
</style>

<script>
import { mapState, mapActions } from 'vuex';
import { util } from '~/_helpers';

import { Footer, Notification, Sidebar } from '~/_components/layout';
export default {
  components: {
    Footer,
    Notification,
    Sidebar,
  },

  data: () => ({
    currentUser: null,
    hasPaymentMethod: false,
  }),

  computed: {
    ...mapState('system', ['configs', 'messages']),

    isPageAvailable() {
      return !this.configs.paymentsEnabled || this.hasPaymentMethod;
    },
  },

  created() {
    this.currentUser = util.currentUser();
  },

  mounted() {
    if (this.configs.paymentsEnabled) {
      this.hasPaymentMethod = true;
    }
    if (this.accountPaymentMethods && this.configs.paymentsEnabled) {
      const payMethods = [];
      Array.from(this.accountPaymentMethods).forEach((pm) => {
        if (
          (typeof pm.promotion === 'undefined' ||
            pm.promotion === null ||
            !pm.promotion) &&
          (typeof pm.deleted === 'undefined' || pm.deleted === null)
        ) {
          payMethods.push(pm);
        }
      });

      if (payMethods.length > 0) {
        this.hasPaymentMethod = true;
      }
    }
  },

  methods: {
    ...mapActions('paymentMethods', ['getAllAccountPaymentMethods']),
    ...mapState('paymentMethods', ['accountPaymentMethods']),
  },
};
</script>
