<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="wrapper">
    <h3 class="text-center form-title">
      {{ messages.label_welcome_message.parseExpression({ user }) }}
    </h3>
    <h3 class="d-flex align-items-center justify-content-center form-sub-title">
      <span class="text-center">
        {{ messages.label_time_to_launch_bubble }}
      </span>
    </h3>

    <div
      class="d-flex flex-column align-items-center justify-content-center mt-5 mx-auto launch-bubble-wrapper"
    >
      <div ref="lottie" class="lottie"></div>
      <Button color="default" width="80%" height="60" @click="launchBubble">
        {{ messages.button_label_launch_bubble }}
      </Button>

      <a class="mt-3 btn-modal" href="#" @click="openSettingsModal">
        {{ messages.button_label_advanced_bubble_settings }}
      </a>
    </div>

    <!--- How it works Section --->
    <a class="how-it-works-section-link text-center d-block mt-5" href="#">
      {{ messages.how_it_works_title }}
    </a>
    <AdvancedSettingsModal ref="settingsModal" />
  </div>
</template>

<style lang="scss" scoped>
@import '../../../_scss/components/button';
@import '../../../_scss/breakpoints';

.launch-bubble-wrapper {
  width: 500px;
}

.lottie {
  width: 100%;
}

.how-it-works-section-link {
  color: #3c3c3a;
  font-size: 2em;
  font-weight: bold;
  line-height: 1.5;
}

@include respond-below(sm) {
  .launch-bubble-wrapper {
    width: 300px;
  }
}
</style>

<script>
import { mapState, mapActions } from 'vuex';
import Lottie from 'lottie-web';

import { util } from '~/_helpers';
import { Button } from '~/_components/shared';
import { AdvancedSettingsModal } from '~/_components/modals';

export default {
  components: {
    Button,
    AdvancedSettingsModal,
  },

  data() {
    return {
      lottie: null,
    };
  },

  computed: {
    ...mapState('system', ['messages']),
    ...mapState('account', ['user']),
  },

  mounted() {
    this.lottie = Lottie.loadAnimation({
      container: this.$refs.lottie,
      renderer: '',
      loop: true,
      autoplay: true,
      path: '/rocket-launch.json',
    });
  },

  methods: {
    openSettingsModal(ev) {
      ev.preventDefault();
      this.$refs.settingsModal.show();
    },

    launchBubble() {
      
    },
  },

  watch: {},
};
</script>
