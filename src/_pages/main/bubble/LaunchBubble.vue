<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="wrapper">
    <h3 class="text-center form-title">
      {{
        messages.label_welcome_message &&
          messages.label_welcome_message.parseExpression({ user })
      }}
    </h3>
    <h3 class="d-flex align-items-center justify-content-center form-sub-title">
      <span class="text-center">
        {{ messages.label_time_to_launch_bubble }}
      </span>
    </h3>

    <div
      class="d-flex flex-column align-items-center justify-content-center mt-5 mx-auto launch-bubble-wrapper"
    >
      <div ref="lottie" class="lottie"></div>
      <Button
        color="default"
        width="80%"
        height="60"
        @click="launchBubble"
        :disabled="loading()"
      >
        {{
          submitted === true && loading()
            ? messages.button_label_launching_bubble
            : messages.button_label_launch_bubble
        }}
      </Button>

      <a class="mt-3 btn-modal" href="#" @click="openSettingsModal">
        {{ messages.button_label_advanced_bubble_settings }}
      </a>
    </div>

    <!--- How it works Section --->
    <!--
    <a class="how-it-works-section-link text-center d-block mt-5" href="#">
      {{ messages.how_it_works_title }}
    </a>
    -->
    <LaunchBubbleSettingsModal ref="settingsModal" />
  </div>
</template>

<style lang="scss" scoped>
@import '../../../_scss/components/button';
@import '../../../_scss/breakpoints';

.launch-bubble-wrapper {
  width: 500px;
}

.lottie {
  width: 100%;
}

.how-it-works-section-link {
  color: #3c3c3a;
  font-size: 2em;
  font-weight: bold;
  line-height: 1.5;
}

@include respond-below(sm) {
  .launch-bubble-wrapper {
    width: 300px;
  }
}
</style>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import Lottie from 'lottie-web';

import { util } from '~/_helpers';
import { Button } from '~/_components/shared';
import { LaunchBubbleSettingsModal } from '~/_components/modals';

export default {
  components: {
    Button,
    LaunchBubbleSettingsModal,
  },

  data: () => ({
    lottie: null,
    user: util.currentUser(),
    accountPlan: {
      name: '',
      domain: '',
      locale: util.currentUser().locale,
      timezone: '',
      plan: 'bubble',
      launchType: 'node',
      footprint: 'Worldwide',
      sshKey: '',
      paymentMethodObject: {
        uuid: null,
        paymentMethodType: null,
        paymentInfo: null,
      },
      forkHost: '',
      syncAccount: true,
      launchLock: false,
      sendErrors: true,
      sendMetrics: true,
    },
    defaults: {
      domain: '',
      locale: 'en_US',
      timezone: '',
      plan: 'bubble',
      footprint: 'Worldwide',
      region: '',
      sshKey: '',
    },
    flexRegion: true,
    cloudRegionUuid: '',
    networkType: 'bubble',
    submitted: false,
  }),

  computed: {
    ...mapState('system', [
      'configs',
      'messages',
      'locales',
      'timezones',
      'detectedTimezone',
    ]),
    ...mapState('domains', ['domains']),
    ...mapState('networks', ['nearestRegions', 'newNodeNotification']),
    ...mapState('footprints', ['footprints']),
    ...mapState('users', ['sshKeys']),
    ...mapState('paymentMethods', ['accountPaymentMethods']),
    ...mapState('plans', ['plans'])
  },

  methods: {
    ...mapActions('domains', ['getAllDomains']),
    ...mapActions('networks', ['getNearestRegions', 'addPlanAndStartNetwork']),
    ...mapActions('footprints', ['getAllFootprints']),
    ...mapActions('users', ['listSshKeysByUserId']),
    ...mapGetters('networks', ['loading']),
    ...mapActions('plans', ['getAllPlans']),
    ...mapActions('paymentMethods', ['getAllAccountPaymentMethods']),

    openSettingsModal(ev) {
      ev.preventDefault();
      this.$refs.settingsModal.show();
    },

    setAccountPaymentMethod(apm) {
      this.accountPlan.paymentMethodObject = {
        uuid: apm.uuid,
        paymentMethodType: null,
        paymentInfo: null,
      };
      return false;
    },

    show() {
      this.$modal.show('advanced-settings');
    },
    hide() {
      this.$modal.hide('advanced-settings');
    },

    addSSHKey() {
      this.$refs.sshKeyModal.show();
    },

    initDefaults() {
      const currentUser = util.currentUser();
      this.accountPlan.name = currentUser.email.split('@')[0];
      this.getAllAccountPaymentMethods({
        userId: currentUser.uuid,
        messages: this.messages,
        errors: this.errors,
      });
      this.getAllPlans({
        messages: this.messages,
        errors: this.errors,
      });
    },

    findRegion(uuid) {
      if (this.nearestRegions) {
        for (let i = 0; i < this.nearestRegions.length; i++) {
          if (this.nearestRegions[i].uuid === uuid)
            return this.nearestRegions[i];
        }
      }
      if (uuid !== null) console.log('findRegion: uuid not found: ' + uuid);
      return null;
    },

    launchBubble() {
      if (this.paymentInfo || this.accountPlan.paymentMethodObject.uuid) {
        const cloudRegion = this.findRegion(this.cloudRegionUuid);
        if (cloudRegion === null) {
          this.errors.add({
            field: 'region',
            msg: this.messages['err_region_notFound'],
          });
        } else {
          if (this.configs.requireSendMetrics) {
            this.accountPlan.sendErrors = true;
            this.accountPlan.sendMetrics = true;
          } else {
            if (this.accountPlan.sendErrors === null)
              this.accountPlan.sendErrors = true;
            if (this.accountPlan.sendMetrics === null)
              this.accountPlan.sendMetrics = true;
          }
          this.submitted = true;
          this.addPlanAndStartNetwork({
            userId: this.user.uuid,
            accountPlan: this.accountPlan,
            cloud: cloudRegion.cloud,
            region: cloudRegion.internalName,
            exactRegion: !this.flexRegion,
            messages: this.messages,
            errors: this.errors,
          });
        }
      }
    },
  },

  mounted() {
    this.lottie = Lottie.loadAnimation({
      container: this.$refs.lottie,
      renderer: '',
      loop: true,
      autoplay: true,
      path: '/rocket-launch.json',
    });
    this.initDefaults();
  },

  watch: {
    domains(doms) {
      if (doms && doms[0]) {
        if (this.accountPlan.domain == null || this.accountPlan.domain === '')
          this.accountPlan.domain = doms[0].name;
        this.defaults.domain = doms[0].name;
      }
    },

    detectedTimezone(tz) {
      if (tz && tz.timeZoneId) {
        if (
          this.accountPlan.timezone == null ||
          this.accountPlan.timezone === ''
        )
          this.accountPlan.timezone = tz.timeZoneId;
        if (this.defaults.timezone == null || this.defaults.timezone === '')
          this.defaults.timezone = tz.timeZoneId;
      }
    },

    detectedLocale(loc) {
      if (loc) {
        if (this.accountPlan.locale === null || this.accountPlan.locale === '')
          this.accountPlan.locale = loc;
        this.defaults.locale = loc;
      }
    },

    newNodeNotification(nn) {
      if (nn && nn.uuid) {
        this.$router.push({
          path: '/bubble/' + nn.networkName,
        });
        this.submitted = false;
      }
    },

    nearestRegions(regions) {
      if (regions) {
        this.regions = regions;
        if (
          this.cloudRegionUuid === null ||
          typeof regions.find((r) => r.uuid === this.cloudRegionUuid) ===
            'undefined'
        ) {
          this.cloudRegionUuid = regions[0].uuid;
        }
        if (
          this.defaults.region === '' ||
          typeof regions.find((r) => r.uuid === this.defaults.region.uuid) ===
            'undefined'
        ) {
          this.defaults.region = regions[0];
        }
      }
    },

    accountPaymentMethods(pms) {
      if (pms) {
        const payMethods = [];
        for (let i = 0; i < pms.length; i++) {
          const pm = pms[i];
          if (
            (typeof pm.promotion === 'undefined' ||
              pm.promotion === null ||
              !pm.promotion) &&
            (typeof pm.deleted === 'undefined' || pm.deleted === null)
          ) {
            payMethods.push(pm);
          }
        }
        this.accountPayMethods = payMethods;
        if (
          this.accountPlan.paymentMethodObject.uuid === null &&
          payMethods.length > 0
        ) {
          this.setAccountPaymentMethod(payMethods[0]);
        }
      }
    },
    plans(p) {
      if (p) {
        if (this.user && this.user.preferredPlan) {
          const plans = p;
          if (plans) {
            for (let i = 0; i < plans.length; i++) {
              if (plans[i].uuid === this.user.preferredPlan) {
                this.defaults.plan = plans[i].name;
                this.accountPlan.plan = plans[i].name;
              }
            }
          }
        }
      }
    }
  }
};
</script>
