<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="wrapper">
    <h3 class="text-center form-title">
      {{ messages.label_launching_bubble_title }}
    </h3>
    <h5 class="d-flex align-items-center justify-content-center form-sub-title">
      <span class="text-center">
        {{ messages.label_launching_bubble_description }}
      </span>
    </h5>

    <div
      class="d-flex flex-column align-items-center justify-content-center mt-5 mx-auto launch-bubble-wrapper"
    >
      <div ref="lottie" class="lottie"></div>
      <Button color="default" width="195" height="60">
        {{ messages.button_cancel_lauch_bubble }}
      </Button>
    </div>

    <!--- Get Bubbles Section --->
    <div class="container">
      <h5 class="text-center d-block mt-5">
        {{ messages.label_get_bubble_for_devices }}
      </h5>
      <div class="row" v-if="messages && messages.marketing_message_topics">
        <div
          v-for="(item, index) in messages.available_devices.split(',')"
          :key="index"
          class="col-lg-3 col-md-6 col-sm-12 my-4 px-3"
        >
          <Card class="h-100">
            <div class="card-content">
              <img :src="`/${item}.png`" />
              <span class="card-message">
                {{ messages[`label_device_${item}`] }}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
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

.card-message {
  margin-top: 20px;
}

@include respond-below(sm) {
  .launch-bubble-wrapper {
    width: 300px;
  }
}
</style>

<script>
import { mapState } from 'vuex';
import Lottie from 'lottie-web';

import { util } from '~/_helpers';
import { Button, Card } from '~/_components/shared';

export default {
  components: {
    Button,
    Card,
  },

  data() {
    return {};
  },

  computed: {
    ...mapState('system', ['messages']),
    ...mapState('account', ['user']),
  },

  mounted() {
    Lottie.loadAnimation({
      container: this.$refs.lottie,
      renderer: '',
      loop: true,
      autoplay: true,
      path: '/launching-bubble.json',
    });

    console.log(this.user);
  },

  methods: {},

  watch: {},
};
</script>
