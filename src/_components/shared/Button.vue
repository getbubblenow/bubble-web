<template>
  <button
    v-bind="$attrs"
    :class="{
      round: round,
      block: block,
      [`color-${color}`]: color,
      link: link,
      disabled: disabled
    }"
    :disabled="disabled"
    :style="cssVars"
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
  height: var(--height);
  width: var(--width);
  cursor: pointer;
  border: 1px solid $border-color;

  &:focus {
    outline: none;
  }

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
    text-transform: uppercase;
    padding: 5px 20px;
  }

  &.link {
    background-color: transparent;
    border: none;
    color: #737373;

    .btn--text {
      padding: 0 10px;
    }
  }

  // TODP: color schemas
  &.color-default {
    background: linear-gradient(300deg, #b838c9 -5%, #ee2f8e 95%);
    color: white;
  }

  &.color-outline {
    background: white;
    color: $vivid-pink;
  }

  &.disabled {
    opacity: 0.8;
    cursor: not-allowed;
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
    disabled: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '',
    },
    width: {
      type: String | Number,
      default: 0,
    },
    height: {
      type: String | Number,
      default: 60,
    },
  },

  data() {
    return {};
  },

  computed: {
    cssVars() {
      return {
        '--height': `${this.height}px`.replace('pxpx', 'px'),
        '--width': this.width
          ? `${this.width}px`.replace('pxpx', 'px')
          : '100%',
      };
    },
  },
};
</script>
