<template>
  <div class="d-flex align-items-center">
    <input
      v-bind="$attrs"
      v-model="content"
      type="checkbox"
      @change="handleChange"
    />
    <label v-html="label" class="label"></label>
  </div>
</template>

<style lang="scss" scoped>
.label {
  font-size: 14px;
  color: #666666;
  margin-bottom: 0;
  margin-left: 5px;
}
</style>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    label: {
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
    handleChange(e) {
      this.$emit('input', e.target.value === 'on');
    },
    handleBlur(e) {
      this.$emit('blur', e);
    },
  },
};
</script>
