<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <input
    v-bind="$attrs"
    v-model="content"
    @input="handleInput()"
    class="form-input"
  />
</template>

<style lang="scss" scoped></style>

<script>
export default {
  props: {
    value: {
      type: String | Number,
      default: '',
    },
  },
  data() {
    return {
      content: this.value,
    };
  },
  watch: {
    value(v) {
      this.content = v;
    },
  },
  methods: {
    handleInput(e) {
      this.$emit('input', this.content);
    },
  },
};
</script>
