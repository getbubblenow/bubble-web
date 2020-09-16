<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="bubble-form">
    <h4 class="text-center form-title">
      {{ messages.manage_account_delete_title }}
    </h4>

    <span v-if="me && currentUser.name != 'root'">
      <div class="form-group">
        {{ messages.field_label_policy_account_deletion }}:
        <img v-show="!policy" :src="loadingImgSrc" />
        <b>{{ messages["account_deletion_name_" + policy.deletionPolicy] }}</b>
        <br />
        <span>
          {{
            messages["account_deletion_description_" + policy.deletionPolicy]
          }}
        </span>
        <br />
        {{ messages.account_deletion_change_tip }}
        <br />
        <Button
          class="btn btn-danger"
          name="deleteAccountBtn"
          :disabled="!policy || deleteRequestSent"
          v-on:click="clickRequestUserDeletion()"
        >
          {{ messages.button_label_delete_account }}
        </Button>
        <img v-show="loading()" :src="loadingImgSrc" />
        <div
          v-if="errors.requestUserDeletion"
          class="invalid-feedback d-block alert alert-danger"
        >
          {{ errors.requestUserDeletion }}
        </div>
        <div v-else-if="deleteRequestSent" class="alert alert-info">
          {{ messages.field_label_account_delete_requested_notice }}
        </div>
      </div>
    </span>
  </div>
</template>

<style lang="scss" scoped>
@import "../../../_scss/components/form";

.bubble-form {
  width: 800px;
}
</style>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import { util } from "~/_helpers";
import { loadingImgSrc } from "~/_store";
import { Button } from "~/_components/shared";

export default {
  components: { Button },
  data() {
    return {
      currentUser: util.currentUser(),
      submitted: false,
      loadingImgSrc: loadingImgSrc,
    };
  },
  computed: {
    ...mapState("system", ["messages"]),
    ...mapState("users", ["policy", "deleteRequestSent", "errors"]),
  },
  methods: {
    ...mapActions("users", ["getPolicyByUserId", "requestUserDeletion"]),
    ...mapGetters("users", ["loading"]),
    clickRequestUserDeletion() {
      this.errors.clear();
      this.requestUserDeletion({
        userId: this.currentUser.uuid,
        messages: this.messages,
        errors: this.errors,
      });
      return false; // do not follow the click
    },
  },
  created() {
    if (util.validateAccount(this)) {
      this.getPolicyByUserId({
        userId: this.currentUser.uuid,
        messages: this.messages,
        errors: this.errors,
      });
    }
  },
};
</script>
