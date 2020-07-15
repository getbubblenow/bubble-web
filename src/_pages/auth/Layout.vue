<template>
  <div class="auth-layout h-100 d-flex flex-column">
    <Header></Header>
    <div class="content flex-grow-1">
      <router-view></router-view>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content {
  background-image: url('/green-curves.svg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position-x: center;
}
</style>

<script>
import { Header } from '~/_components/layout';
export default {
  components: {
    Header,
  },
};
</script>
