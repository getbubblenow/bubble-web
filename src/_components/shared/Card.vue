<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="card-container h-100">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.card-container {
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0px 10px 50px #dee1ec;
}

.card-content {
  display: flex;
  flex-direction: column;

  align-items: center;

  .card-icon {
    font-family: ETmodules;
    content: attr(data-icon);
    font-weight: 400;
    font-size: 32px;
    line-height: 1;
    padding: 25px;
    border-radius: 100%;
  }

  .card-title {
    text-align: center;
    font-weight: bold;
    color: #333;
    margin-top: 30px;
    margin-bottom: 20px;
  }

  .card-message {
    text-align: center;
    font-weight: 400;
    color: #666;
    line-height: 2;
  }
}
</style>

<script>
export default {};
</script>
