<template>
  <div class="wrapper">
    <h1 class="text-center white-text form-title">
      {{ messages.login_title }}
    </h1>
    <h4 class="text-center white-text form-sub-title">
      {{ messages.login_blurb }}
    </h4>

    <form class="auth-form">
      <div class="form-group">
        <Input
          class="form-control"
          v-model="email"
          :placeholder="messages.field_email_hint"
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
      <Button color="default" class="auth-form-submit">
        {{ messages.button_label_sign_in }}
      </Button>
      <p
        class="text-center description"
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

.description {
  margin-top: 32px;
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
