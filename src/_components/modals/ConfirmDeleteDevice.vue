<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <modal
    name="advanced-settings"
    width="90%"
    :maxWidth="600"
    height="auto"
    scrollable
  >
    <a class="close-btn" @click="hide">
      <i class="fa fa-times"></i>
    </a>
    <div class="d-flex flex-column align-items-center">
      <div class="alert alert-warning">
        <strong>{{ messages.warning }}:</strong>
        {{ messages.warning_delete_bubble }}
      </div>

      <div>
        {{ messages.label_add_device_back }}:
        <ol>
          <li v-for="(step, key) in addDeviceBackSteps" :key="key">
            {{ step }}
          </li>
        </ol>
      </div>

      <p>
        {{ messages.confirm_delete_device }}
      </p>
      <div class="d-flex">
        <Button color="default" class="mr-3" @click="confirm(true)">
          {{ messages.yes }}
        </Button>
        <Button color="outline" @click="confirm(false)">{{
          messages.no
        }}</Button>
      </div>
    </div>
  </modal>
</template>

<style lang="scss">
@import '../../_scss/components/form';
@import '../../_scss/components/modal';
@import '../../_scss/breakpoints';

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 20px;
}
</style>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { util } from '~/_helpers';

import { Button } from '../shared';

import AddSSHKeyModal from './AddSshKey';

export default {
  components: {
    Button,
  },
  computed: {
    ...mapState('system', ['messages']),
    addDeviceBackSteps() {
      return this.messages.steps_add_device_back
        ? this.messages.steps_add_device_back.split('|')
        : [];
    },
  },

  methods: {
    show() {
      this.$modal.show('advanced-settings');
    },
    hide() {
      this.$modal.hide('advanced-settings');
    },
    confirm(value) {
      this.$emit('confirm', value);
    },
  },
};
</script>
