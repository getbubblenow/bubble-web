<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <router-view v-if="isPageAvailable"></router-view>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { util } from '~/_helpers';
import { isAuthenticator, isNotAuthenticator } from '~/_store/users.module';

export default {
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
    hasPaymentMethod: false,
  }),

  computed: {
    ...mapState('users', ['policy']),
    ...mapState('paymentMethods', ['accountPaymentMethods']),
    ...mapState('system', ['configs', 'messages']),

    isPageAvailable() {
      console.log('current user', this.currentUser);
      return (
        !this.currentUser ||
        ((this.verifiedContacts ||
          this.currentUser.admin ||
          this.$route.path === '/verifyEmail' ||
          this.$route.path === '/me/action') &&
          (!this.configs.paymentsEnabled ||
            this.hasPaymentMethod === true ||
            this.$route.path === '/payment'))
      );
    },
  },

  created() {
    this.currentUser = util.currentUser();
    if (this.currentUser) {
      this.locale = this.currentUser.locale;
    }
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
      if (this.currentUser && !this.currentUser.admin) {
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
          this.hasPaymentMethod = true;
          this.navigateToDashboard();
        } else {
          this.navigateToPaymentPage();
        }
      }
    },
  },
};
</script>
