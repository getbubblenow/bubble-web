<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div>
    <em v-if="loading && loading.networks">{{ messages.loading_networks }}</em>

    <div v-if="networks && networks.length > 0">
      <!-- Show network list -->
      <NetworkList />
    </div>
    <div v-else>
      <!-- Show Launch Bubble Page -->
      <LaunchBubble />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { util } from '~/_helpers';

import NetworkList from './Networks';
import LaunchBubble from './LaunchBubble';

export default {
  components: {
    NetworkList,
    LaunchBubble,
  },
  computed: {
    ...mapState('networks', ['networks']),
    ...mapState('system', ['messages', 'configs']),
    ...mapState('users', ['policy']),
  },

  created() {
    if (!this.configs.sageLauncher) {
      this.$router.replace({ path: '/bubble/' + this.configs.networkUuid });
    }

    const user = util.currentUser();
    const selectedLocale =
      user !== null &&
      typeof user.locale !== 'undefined' &&
      user.locale !== null
        ? user.locale
        : 'detect';
    this.getAllNetworks({
      userId: user.uuid,
      messages: this.messages,
      errors: this.errors,
    });
    this.loadMessages('post_auth', selectedLocale);
    this.loadMessages('apps', selectedLocale);
  },
  methods: {
    ...mapActions('networks', [
      'getAllNetworks',
      'stopNetwork',
      'deleteNetwork',
    ]),
    ...mapGetters('networks', ['loading']),
    ...mapActions('system', ['loadMessages']),
  },
  watch: {
    networks(nets) {
      if (nets && nets.length === 1 && util.currentUser().admin !== true) {
        this.$router.replace({ path: '/bubble/' + nets[0].name });
      }
    },
  },
};
</script>
