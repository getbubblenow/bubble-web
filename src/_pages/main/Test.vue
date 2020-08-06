<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div>
    Test Page
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  methods: {
    ...mapActions('account', ['checkSession']),
  },
  mounted() {
    this.checkSession({ messages: this.messages, errors: this.errors });
  },
};
</script>
