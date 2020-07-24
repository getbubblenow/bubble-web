<template>
  <div>
    <!--- We've Got You Covered Section --->
    <h2 class="covered-section-title text-center">
      {{ messages.marketing_message_got_you_covered_title }}
    </h2>
    <div class="row" v-if="messages && messages.marketing_message_topics">
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
  </div>
</template>

<style lang="scss" scoped>
.covered-section-title {
  margin-top: 64px;
  margin-bottom: 20px;
  color: #3c3c3c;
}
</style>

<script>
import { mapState } from 'vuex';
import { Card } from '../shared';

export default {
  components: {
    Card,
  },
  computed: {
    ...mapState('system', ['messages']),
  },
};
</script>
