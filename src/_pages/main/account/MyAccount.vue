<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div>
    <h1 class="title text-center">
      {{ messages.title_my_account }}
    </h1>
    <div class="row" v-if="messages && manage_account_actions">
      <div
        v-for="(item, index) in manage_account_actions"
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
import { util } from '~/_helpers';

export default {
  data() {
    return { currentUser: util.currentUser() }
  },
  components: {
    Card,
  },
  computed: {
    ...mapState('system', ['messages', 'configs']),
    manage_account_actions: function () {
      if (this.messages) {
        const account_actions = this.configs.bubbleNode === true ? 'manage_account_node_actions' : 'manage_account_sage_actions';
        const actions = this.messages[account_actions].split(',');
        if (this.currentUser.admin && this.currentUser.firstAdmin) {
          const delete_index = actions.indexOf('delete');
          if (delete_index !== -1) actions.splice(delete_index, 1);
        }
        return actions;
      }
    }
  },
  methods: {
    show_action: function(item) {
      return !(item === 'delete' && this.currentUser.admin && this.currentUser.firstAdmin);
    }
  }
};
</script>
