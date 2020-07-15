<template>
  <input v-bind="$attrs" v-model="content" @input="handleInput()" class="form-input"/>
</template>

<style lang="scss" scoped></style>

<script>
export default {
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      content: this.value,
    };
  },
  methods: {
    handleInput(e) {
      this.$emit('input', this.content);
    },
  },
};
</script>
