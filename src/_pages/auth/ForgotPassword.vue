<template>
  <div class="wrapper">
    <h1 class="text-center white-text form-title">
      {{ messages.form_title_forgotPassword }}
    </h1>
    <h4 class="text-center white-text form-sub-title">
      {{ messages.forgot_password_blurb }}
    </h4>

    <form class="auth-form">
      <div class="form-group">
        <Input
          class="form-control"
          v-model="email"
          :placeholder="messages.field_email_hint"
        />
      </div>
      <Button color="default" class="auth-form-submit">
        {{ messages.button_label_forgot_password }}
      </Button>
      <p class="text-center mt-3">
        <router-link to="/sign-in">
          {{ messages.forgot_password_login_link }}
        </router-link>
      </p>
    </form>
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

.forgot-password-btn {
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
