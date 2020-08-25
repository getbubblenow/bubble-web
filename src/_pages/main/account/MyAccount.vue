<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div>
    <!--- We've Got You Covered Section --->
    <h1 class="title text-center">
      {{ messages.title_my_account }}
    </h1>
    <div class="row" v-if="messages && messages.manage_account_actions">
      <div
        v-for="(item, index) in messages.manage_account_actions.split(',')"
        :key="index"
        class="col-lg-6 col-md-6 col-sm-12 my-4 px-3"
      >
        <router-link :to="messages[`manage_account_${item}_link`]">
          <div class="h-100 card-container">
            <div class="d-flex justify-content-between align-items-center">
              <span>{{ messages[`manage_account_${item}_title`] }}</span>
              <span class="icon">
                <i class="fa fa-plus"></i>
              </span>
            </div>
          </div>
        </router-link>
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
