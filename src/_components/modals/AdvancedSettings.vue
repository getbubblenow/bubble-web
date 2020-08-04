<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <modal
    name="advanced-settings"
    :adaptive="true"
    width="90%"
    maxWidth="600"
    height="auto"
  >
    <a class="close-btn" @click="hide">
      <i class="fa fa-times"></i>
    </a>

    <form class="form">
      <h3 class="text-center mb-5">
        {{ messages.field_label_show_advanced_plan_options }}
      </h3>
      <div class="form-group">
        <Input
          class="form-control"
          :placeholder="messages.field_label_bubble_name"
        />
      </div>
      <div class="form-group">
        <v-select :placeholder="messages.field_label_network_domain"></v-select>
      </div>
      <div class="form-group">
        <v-select :placeholder="messages.field_label_region"></v-select>
      </div>
      <div class="form-group">
        <v-select :placeholder="messages.field_label_locale"></v-select>
      </div>
      <div class="form-group">
        <v-select :placeholder="messages.field_label_timezone"></v-select>
      </div>
      <div class="form-group">
        <v-select :placeholder="messages.field_label_footprint"></v-select>
      </div>
      <div class="form-group">
        <v-select
          :placeholder="messages.field_label_network_ssh_key"
        ></v-select>
      </div>
      <div class="form-group">
        <Button color="outline" height="34">
          {{ messages.form_title_add_ssh_key }}
        </Button>
        <p class="description text-left ml-0 mt-2">
          {{ messages.field_description_network_ssh_key }}
        </p>
      </div>

      <div class="form-group my-4">
        <Checkbox :label="messages.field_label_sendInformation" />
      </div>

      <div
        class="form-group mt-4 d-flex justify-content-center align-items-center"
      >
        <div class="flex-grow-1 pr-2">
          <Button block color="outline">
            {{ messages.button_label_cancel }}
          </Button>
        </div>
        <div class="flex-grow-1 pl-2">
          <Button block color="default">
            {{ messages.button_label_register }}
          </Button>
        </div>
      </div>
    </form>
  </modal>
</template>

<style lang="scss">
@import '../../_scss/components/form';
@import '../../_scss/breakpoints';

.vm--container {
  .vm--overlay {
    background-color: #6f28abcc;
  }
  .vm--modal {
    border-radius: 10px;
    padding: 40px;
    position: relative;

    @include respond-below(sm) {
      padding: 40px 20px;
    }
  }
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 20px;
}
</style>

<script>
import { mapState } from 'vuex';

import { Button, Input, Checkbox } from '../shared';

export default {
  components: {
    Button,
    Input,
    Checkbox,
  },

  computed: {
    ...mapState('system', ['configs', 'messages']),
  },

  methods: {
    show() {
      this.$modal.show('advanced-settings');
    },
    hide() {
      this.$modal.hide('advanced-settings');
    },
  },

  mounted() {
  },
};
</script>
