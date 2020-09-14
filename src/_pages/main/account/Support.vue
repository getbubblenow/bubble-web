<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div>
    <h1 class="title text-center white-text">{{ messages.title_support }}</h1>
    <hr />
    <h5 class="text-center white-text">
      {{ messages.support_preamble }}
    </h5>
    <hr />
    <div class="row">
      <div
        class="col-lg-6 col-md-6 col-sm-12 my-4 px-3"
        v-if="configs && configs.support && configs.support.site"
      >
        <a :href="configs.support.site">
          <div class="h-100 card-container">
            <div class="d-flex justify-content-between align-items-center">
              <span>{{ messages.support_site_link }}</span>
              <span class="icon">
                <i class="fa fa-plus"></i>
              </span>
            </div>
          </div>
        </a>
      </div>
      <div
        v-if="configs && configs.support && configs.support.email"
        class="col-lg-6 col-md-6 col-sm-12 my-4 px-3"
      >
        <a :href="'mailto:' + configs.support.email">
          <div class="h-100 card-container">
            <div class="d-flex justify-content-between align-items-center">
              <span>{{ messages.support_email_link }}</span>
              <span class="icon">
                <i class="fa fa-plus"></i>
              </span>
            </div>
          </div>
        </a>
      </div>
      <div v-if="hasNoSupport">
        <h4>{{ messages.support_not_available }}</h4>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.title {
  margin-top: 64px;
  margin-bottom: 20px;
}

.card-container {
  padding: 24px;
  margin: 0 20px;

  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  background: #fff;

  color: #17aea6;
}

.icon {
  font-size: 14px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #eeeef0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<script>
import { mapState } from 'vuex';
import { Card } from '~/_components/shared';

export default {
  components: {
    Card,
  },
  data() {
    return {};
  },
  computed: {
    ...mapState('system', ['messages', 'configs']),
    hasNoSupport() {
      const configs = this.configs;
      if (configs && configs.support) {
        if (configs.support.email) return false;
        if (configs.support.site) return false;
      }
      return true;
    },
  },
};
</script>
