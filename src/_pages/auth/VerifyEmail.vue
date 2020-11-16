<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="wrapper">
    <h1 class="text-center white-text form-title">
      {{ messages.verify_email_title }}
    </h1>
    <h4 class="d-flex align-items-center justify-content-center form-sub-title">
      <span class="text-center white-text">
        {{ messages.resend_verify_email_label }}
      </span>
      <a class="resend-btn" href="#" @click="resendVerification(firstContact)">
        {{ messages.button_label_resend_verify_email }}
      </a>
    </h4>

    <div class="d-flex justify-content-center mt-5">
      <div ref="lottie" class="lottie"></div>
    </div>

    <Features></Features>

    <a
      class="features-section-link text-center d-block"
      href="https://getbubblenow.com/features/"
    >
      {{ messages.more_features_label }}
    </a>
  </div>
</template>

<style lang="scss" scoped>
@import '../../_scss/components/form';

.features-section-link {
  color: $vivid-navy;
  font-size: 16px;
  margin-top: 25px;
}

.sub-title {
  font-size: 24px;
}

.lottie {
  width: 400px;
}

.resend-btn {
  text-decoration: underline;
  color: white;
  margin-left: 10px;
}
</style>

<script>
import { mapState, mapActions } from 'vuex';
import Lottie from 'lottie-web';

import { util } from '~/_helpers';
import { Features } from '~/_components/sections';

// convenience methods
import { isAuthenticator, isNotAuthenticator } from '~/_store/users.module';
window.isAuthenticator = isAuthenticator;
window.isNotAuthenticator = isNotAuthenticator;

export default {
  components: {
    Features,
  },

  data() {
    return {
      firstContact: null,
    };
  },

  computed: {
    ...mapState('system', ['messages', 'configs']),
    ...mapState('users', ['policy']),
  },

  mounted() {
    Lottie.loadAnimation({
      container: this.$refs.lottie,
      renderer: '',
      loop: true,
      autoplay: true,
      path: '/green_email_sent.json',
    });
  },

  methods: {
    ...mapActions('account', ['resendVerificationCode']),

    getFirstContact(policy) {
      if (policy && policy.accountContacts) {
        const contacts = policy.accountContacts;
        for (let i = 0; i < contacts.length; i++) {
          if (isNotAuthenticator(contacts[i])) return contacts[i];
        }
        return null;
      }
      return null;
    },

    resendVerification(contact) {
      console.log(contact);
      this.resendVerificationCode({
        userId: util.currentUser().uuid,
        contact: contact,
        messages: this.messages,
        errors: this.errors,
      });
      return false; // do not follow the click
    },
  },

  watch: {
    policy(p) {
      this.firstContact = this.getFirstContact(p);
    },
  },
};
</script>
