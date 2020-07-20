<template>
  <div class="d-flex align-items-center">
    <div
      class="checkbox-wrapper"
      :class="{ active: value }"
      @click="handleChange()"
    >
      <i class="fas fa-check" v-if="value"></i>
    </div>
    <label v-html="label" class="label"></label>
  </div>
</template>

<style lang="scss" scoped>
@import '../../_scss/variables';

.label {
  font-size: 14px;
  color: #666666;
  margin-bottom: 0;
  margin-left: 5px;
}

.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  min-height: 20px;
  width: 20px;
  height: 20px;
  position: relative;
  overflow: hidden;

  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: #c5c5c5;

  &.active {
    border-color: $checkbox-color;
  }
  &::after {
    content: '';
    background: radial-gradient(circle, white, #eee);
    position: absolute;
    top: 0;
    left: 0;
    right: -100%;
    bottom: -100%;
  }

  i {
    z-index: 1;
    color: $checkbox-color;
    font-size: 12px;
  }
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
  methods: {
    handleChange() {
      console.log(this.value);
      this.$emit('input', !this.value);
    },
  },
};
</script>
