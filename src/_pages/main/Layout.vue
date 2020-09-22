<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="container-fluid">
    <img src="/bubble_bkgrnd.png" alt="" class="background-image" />
    <div class="content">
      <Sidebar />
      <div class="flex-grow-1 p-4">
        <header>
          <p class="mb-0">{{ messages.label_homepage_welcome }},</p>
          <p class="name">{{ currentUser.name }} 👋</p>
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
import { isAuthenticator, isNotAuthenticator } from '~/_store/users.module';
import { Footer, Notification, Sidebar } from '~/_components/layout';

export default {
  components: {
    Footer,
    Notification,
    Sidebar,
  },
  data: () => ({
    verifiedContacts: null,
    verifiedContactRefresher: null,
    accountPlan: {
      currentUser: null,
      name: '',
      domain: '',
      locale: null,
      timezone: '',
      plan: 'bubble',
      footprint: 'Worldwide',
      paymentMethodObject: {
        uuid: null,
        paymentMethodType: null,
        paymentInfo: null,
      },
      sshKey: '',
      forkHost: '',
      syncAccount: true,
      launchLock: false,
      sendErrors: true,
      sendMetrics: true,
    },
    payMethods: null,
  }),

  computed: {
    ...mapState('users', ['policy']),
    ...mapState('paymentMethods', ['accountPaymentMethods']),
    ...mapState('system', ['configs', 'messages']),
  },

  created() {
    this.currentUser = util.currentUser();
    this.locale = this.currentUser.locale;
  },

  mounted() {
    this.initDefaults();
  },

  methods: {
    ...mapActions('users', ['getPolicyByUserId']),
    ...mapActions('paymentMethods', ['getAllAccountPaymentMethods']),

    initDefaults() {
      const selectedLocale =
        this.currentUser !== null &&
        typeof this.currentUser.locale !== 'undefined' &&
        this.currentUser.locale !== null
          ? this.currentUser.locale
          : 'detect';
      if (!this.currentUser.admin) {
        this.getPolicyByUserId({
          userId: this.currentUser.uuid,
          messages: this.messages,
          errors: this.errors,
        });
      }
    },

    hasVerifiedContact(policy) {
      if (policy && policy.accountContacts) {
        const contacts = policy.accountContacts;
        for (let i = 0; i < contacts.length; i++) {
          if (contacts[i].verified && isNotAuthenticator(contacts[i]))
            return true;
        }
        return false;
      }
      return false;
    },

    navigateToVerifyEmail() {
      if (this.$route.path !== '/verifyEmail') {
        this.$router.push('/verifyEmail');
      }
    },

    navigateToPaymentPage() {
      if (this.$route.path !== '/payment') {
        this.$router.push('/payment');
      }
    },

    navigateToDashboard() {
      if (
        this.$route.path === '/payment' ||
        this.$route.path === '/verifyEmail'
      ) {
        this.$router.push('/');
      }
    },
  },

  watch: {
    policy(p) {
      this.verifiedContacts = this.hasVerifiedContact(p);
      const currentUser = util.currentUser();
      if (!this.verifiedContacts && !currentUser.admin) {
        this.navigateToVerifyEmail();
        if (this.verifiedContactRefresher === null) {
          const vue = this;
          const currentUser = util.currentUser();
          this.verifiedContactRefresher = window.setInterval(() => {
            vue.getPolicyByUserId({
              userId: currentUser.uuid,
              messages: vue.messages,
              errors: vue.errors,
            });
          }, 5000);
        }
      } else {
        const currentUser = util.currentUser();
        this.getAllAccountPaymentMethods({
          userId: currentUser.uuid,
          messages: this.messages,
          errors: this.errors,
        });
        if (this.verifiedContactRefresher !== null) {
          window.clearInterval(this.verifiedContactRefresher);
          this.verifiedContactRefresher = null;
        }
      }
    },

    accountPaymentMethods(pms, oldpms) {
      if (pms && this.configs.paymentsEnabled) {
        const payMethods = [];
        for (let i = 0; i < pms.length; i++) {
          const pm = pms[i];
          if (
            (typeof pm.promotion === 'undefined' ||
              pm.promotion === null ||
              !pm.promotion) &&
            (typeof pm.deleted === 'undefined' || pm.deleted === null)
          ) {
            payMethods.push(pm);
          }
        }

        if (
          this.accountPlan.paymentMethodObject.uuid === null &&
          payMethods.length > 0
        ) {
          this.navigateToDashboard();
        } else {
          this.navigateToPaymentPage();
        }
      }
    },
  },
};
</script>
