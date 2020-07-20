<template>
  <div class="wrapper">
    <h1 class="text-center white-text form-title">
      {{ messages.register_title }}
    </h1>
    <h4 class="text-center white-text form-sub-title">
      {{ messages.register_blurb }}
    </h4>

    <form class="auth-form">
      <div class="form-group">
        <Input
          class="form-control"
          v-model="email"
          :placeholder="messages.register_field_label_email"
        />
      </div>
      <div class="form-group">
        <Input
          class="form-control"
          v-model="password"
          :placeholder="messages.field_label_password"
        />
        <p class="description">
          {{ messages.field_password_hint }}
        </p>
      </div>

      <div class="form-group">
        <Input
          class="form-control"
          v-model="confirmPassword"
          :placeholder="messages.field_label_password_confirm"
        />
      </div>
      <div class="form-group">
        <Input
          class="form-control"
          v-model="promoCode"
          :placeholder="messages.field_label_promoCode"
        />
      </div>
      <a :href="messages.message_request_promoCode_link" target="_blank">
        {{ messages.message_request_promoCode }}
      </a>

      <div class="form-group my-5">
        <Checkbox
          v-model="agreeTOC"
          :label="messages.field_label_agreeToTerms"
        />
      </div>

      <div
        class="form-group mt-4 d-flex justify-content-center align-items-center"
      >
        <div class="flex-grow-1 pr-2">
          <Button block color="outline">
            {{ messages.button_label_cancel }}
          </Button>
        </div>
        <div class="flex-grow-1 pl-2">
          <Button block color="default">
            {{ messages.button_label_register }}
          </Button>
        </div>
      </div>

      <div class="form-separator"></div>

      <div class="form-group my-3">
        <Checkbox
          v-model="sendInformation"
          :label="messages.field_label_sendInformation"
        />
      </div>
      <div class="form-group my-3">
        <Checkbox v-model="sendNews" :label="messages.field_label_sendNews" />
      </div>
    </form>

    <!--- We've Got You Covered Section --->
    <h2 class="covered-section-title text-center">
      {{ messages.marketing_message_got_you_covered_title }}
    </h2>
    <div class="row" v-if="messages">
      <div
        v-for="(item, index) in messages.marketing_message_topics.split(',')"
        :key="index"
        class="col-lg-3 col-md-6 col-sm-12 my-4 px-3"
      >
        <Card>
          <div class="card-content">
            <span
              class="card-icon"
              :style="{
                color: messages[`marketing_message_${item}_color`],
                backgroundColor:
                  messages[`marketing_message_${item}_background_color`],
              }"
              v-html="messages[`marketing_message_${item}_icon`]"
            >
            </span>
            <p class="card-title">
              {{ messages[`marketing_message_${item}_title`] }}
            </p>
            <span class="card-message">
              {{ messages[`marketing_message_${item}_content`] }}
            </span>
          </div>
        </Card>
      </div>
    </div>

    <!--- Pricing Section --->
    <a
      class="pricing-section-link text-center d-block"
      href="https://getbubblenow.com/pricing/"
    >
      {{ messages.marketing_pricing_title }}
    </a>
    <!-- <div class="row px-5 mx-5">
      <div class="col-12 d-flex">
        <div
          class="plan flex-grow-1"
          v-for="(plan, index) in messages.marketing_pricing_options.split(',')"
          :key="index"
        >
          <p class="plan-name">
            {{ messages[`marketing_pricing_${plan}_title`] }}
          </p>
          <p class="plan-users">
            {{ messages[`marketing_pricing_${plan}_users`] }}
          </p>
          <p class="plan-pricing">
            {{ messages[`marketing_pricing_${plan}_users`] }}
          </p>
          <p
            class="plan-common-features"
            v-for="option in messages[`marketing_pricing_common_options`].split(
              ','
            )"
            :key="option"
          >
            {{ option }}
          </p>
          <p
            class="plan-features"
            v-for="option in messages[
              `marketing_pricing_${plan}_options`
            ].split(',')"
            :key="option"
          >
            {{ option }}
          </p>
        </div>
      </div>
    </div> -->
  </div>
</template>

<style lang="scss" scoped>
@import '../../_scss/components/form';

.covered-section-title {
  margin-top: 64px;
  margin-bottom: 20px;
  color: #3c3c3c;
}

.pricing-section-link {
  color: $vivid-navy;
  font-size: 36px;
  margin-top: 25px;
}
</style>

<script>
import { mapState } from 'vuex';

import { Button, Input, Checkbox, Card } from '~/_components/shared';

export default {
  components: {
    Button,
    Input,
    Checkbox,
    Card,
  },

  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      promoCode: '',
      agreeTOC: false,
      sendInformation: false,
      sendNews: false,
    };
  },

  computed: {
    ...mapState('system', ['messages']),
  },
};
</script>
