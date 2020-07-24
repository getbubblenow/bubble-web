<template>
  <div class="wrapper">
    <h1 class="text-center white-text form-title">
      {{ messages.verify_email_title }}
    </h1>
    <h4 class="d-flex align-items-center justify-content-center form-sub-title">
      <span class="text-center white-text">
        {{ messages.resend_verify_email_label }}
      </span>
      <a class="resend-btn" href="#">
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
import { mapState } from 'vuex';
import Lottie from 'lottie-web';

import { Features } from '~/_components/sections';

export default {
  components: {
    Features,
  },

  computed: {
    ...mapState('system', ['messages']),
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
};
</script>
