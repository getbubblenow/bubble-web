<template>
  <div class="wrapper">
    <h1 class="text-center white-text title">
      {{ messages.login_title }}
    </h1>
    <h4 class="text-center white-text sub-title">
      {{ messages.login_blurb }}
    </h4>

    <form class="login-form">
      <div class="form-group">
        <Input
          class="form-control"
          v-model="email"
          :placeholder="messages.field_label_email"
        />
      </div>
      <div class="form-group">
        <Input
          class="form-control"
          v-model="password"
          :placeholder="messages.field_label_password"
        />
      </div>
      <router-link to="/new_pages/forgot-password">
        {{ messages.button_label_forgotPassword }}
      </router-link>
      <Button color="default" class="login-btn">
        {{ messages.button_label_sign_in }}
      </Button>
      <p
        class="text-center privacy-description"
        v-html="messages.message_login_agreeToTerms"
      ></p>
    </form>
    <p class="text-center mt-4">
      {{ messages.registration_label }}
      <router-link to="/sign-up">
        {{ messages.button_label_sign_up }}
      </router-link>
    </p>
  </div>
</template>

<style lang="scss" scoped>
@import '../../_scss/components/form';

.title {
  margin-top: 80px;
}

.sub-title {
  margin-top: 16px;
}

.login-form {
  background-color: white;
  box-shadow: $form-box-shadow;

  width: 450px;
  max-width: 90%;
  margin: 80px auto 0;
  padding: 40px 36px;

  border-radius: $form-border-radius;
}

.login-btn {
  margin-top: 55px;
}

.privacy-description {
  width: 280px;
  font-size: 14px;
  margin: 32px auto 8px;
}
</style>

<script>
import { mapState } from 'vuex';

import { Button, Input } from '~/_components/shared';

export default {
  components: {
    Button,
    Input,
  },

  data() {
    return {
      email: '',
      password: '',
    };
  },

  computed: {
    ...mapState('system', ['messages']),
  },
};
</script>
