<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div>
    <!--- We've Got You Covered Section --->
    <h1 class="title text-center white-text">
      {{ messages.title_legal_topics }}
    </h1>
    <div class="row" v-if="messages && messages.legal_topics">
      <div
        v-for="(item, index) in messages.legal_topics.split(',')"
        :key="index"
        class="col-lg-6 col-md-6 col-sm-12 my-4 px-3"
      >
        <a :href="messages[`legal_${item}_link`]" target="_blank">
          <div class="h-100 card-container">
            <div class="d-flex justify-content-between align-items-center">
              <span>{{ messages[`legal_${item}`] }}</span>
              <span class="icon">
                <i class="fa fa-plus"></i>
              </span>
            </div>
          </div>
        </a>
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
  computed: {
    ...mapState('system', ['messages']),
  },
};
</script>
