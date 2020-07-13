<template>
  <button
    v-bind="$attrs"
    @click="click($event)"
    :class="{
      round: round,
      block: block,
      [`color-${color}`]: color,
      link: link,
    }"
    class="app-btn"
  >
    <span class="btn--text">
      <slot></slot>
    </span>
  </button>
</template>

<style lang="scss" scoped>
@import '../../_scss/_variables';

.app-btn {
  font-size: 14px;
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0);
  transition: all 300ms ease 0ms;

  max-height: 100%;
  height: 60px;
  cursor: pointer;
  border: none;

  // &:hover {
  //   box-shadow: 0px 5px 5px 0px rgba(0, 0, 0, 0.2);
  // }

  &.round {
    border-radius: 50px;
  }

  &.block {
    display: block;
  }

  .btn--text {
    padding: 5px 20px;
  }

  &.link {
    background-color: transparent;
    color: #737373;

    .btn--text {
      padding: 0 5px;
    }
  }

  // TODP: color schemas
  &.color-default {
    background: linear-gradient(300deg, #b838c9 -5%, #ee2f8e 95%);
    color: white;
  }
}
</style>

<script>
export default {
  props: {
    round: {
      type: Boolean,
      default: true,
    },
    block: {
      type: Boolean,
      default: false,
    },
    link: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '',
    },
  },
  data() {
    return {};
  },
  methods: {
    click(event) {
      this.$emit('click', event);
    },
  },
};
</script>
