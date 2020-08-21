<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <modal
    name="advanced-settings"
    :adaptive="true"
    width="90%"
    :maxWidth="600"
    height="auto"
  >
    <a class="close-btn" @click="hide">
      <i class="fa fa-times"></i>
    </a>

    <form class="form">
      <h3 class="text-center mb-5">
        {{ messages.field_label_show_advanced_plan_options }}
      </h3>
      <div class="form-group">
        <Input
          class="form-control"
          v-validate="'required'"
          :placeholder="messages.field_label_bubble_name"
          v-model="accountPlan.name"
        />
      </div>
      <div class="form-group" v-if="domains">
        <v-select
          v-validate="'required'"
          :placeholder="messages.field_label_network_domain"
          :options="domains"
          v-model="accountPlan.domain"
          label="name"
        >
          <template v-slot:selected-option="option">
            <span>Domain: {{ option.name }}</span>
          </template>
        </v-select>
      </div>
      <div class="form-group" v-if="nearestRegions">
        <v-select
          v-validate="'required'"
          :placeholder="messages.field_label_region"
          :options="nearestRegions"
          v-model="cloudRegionUuid"
          label="name"
          :reduce="(region) => region.uuid"
        >
          <template v-slot:selected-option="option">
            <span>
              Location: {{ option.name }}
              {{ regionDistance(option.uuid) }}
            </span>
          </template>
          <template v-slot:option="option">
            {{ option.name }} {{ regionDistance(option.uuid) }}
          </template>
        </v-select>
      </div>
      <div class="form-group" v-if="localeTexts">
        <v-select
          v-validate="'required'"
          :placeholder="messages.field_label_locale"
          :options="localeTexts"
          v-model="accountPlan.locale"
          :reduce="(locale) => locale.name"
          label="label"
        >
          <template v-slot:selected-option="option">
            <span>Language: {{ option.label }}</span>
          </template>
        </v-select>
      </div>
      <div class="form-group" v-if="timezoneObjects">
        <v-select
          v-validate="'required'"
          :placeholder="messages.field_label_timezone"
          :options="timezoneObjects"
          :reduce="(tz) => tz.timezoneId"
          label="timezoneDescription"
          v-model="accountPlan.timezone"
          type="text"
          name="timezone"
        >
          <template v-slot:selected-option="option">
            <span>Time Zone: {{ option.timezoneDescription }}</span>
          </template>
        </v-select>
      </div>
      <div class="form-group" v-if="footprintObjects">
        <v-select
          v-validate="'required'"
          :placeholder="messages.field_label_footprint"
          :options="footprintObjects"
          v-model="accountPlan.footprint"
          :reduce="(options) => options.uuid"
          label="localName"
        >
          <template v-slot:selected-option="option">
            <span>Footprint: {{ option.localName }}</span>
          </template>
        </v-select>
      </div>
      <div class="form-group">
        <v-select
          :placeholder="messages.field_label_network_ssh_key"
          :options="sshKeys"
        >
          <template v-slot:selected-option="option">
            <span>SSH Key: {{ option.name }}</span>
          </template>
          <template v-slot:option="option">
            {{ option.name }}
            (
            <span v-if="option.expiration">{{
              messages.date_format_ssh_key_expiration.parseDateMessage(
                option.expiration,
                messages
              )
            }}</span>
            <span v-else>{{ messages.message_ssh_key_no_expiration }}</span>
            )
          </template>
        </v-select>
      </div>
      <div class="form-group">
        <Button color="outline" height="34" @click="addSSHKey">
          {{ messages.form_title_add_ssh_key }}
        </Button>
        <p class="description text-left ml-0 mt-2">
          {{ messages.field_description_network_ssh_key }}
        </p>
      </div>

      <div
        class="form-group"
        v-if="configs.requireSendMetrics && configs.requireSendMetrics !== true"
      >
        <Checkbox
          :label="messages.field_label_send_errors"
          v-model="accountPlan.sendErrors"
        />
        <div
          v-if="submitted && errors.has('sendErrors')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('sendErrors') }}
        </div>
        <p>{{ messages.field_label_send_errors_description }}</p>
      </div>
      <!-- metrics reporting -->
      <div
        class="form-group"
        v-if="configs.requireSendMetrics && configs.requireSendMetrics !== true"
      >
        <Checkbox
          :label="messages.field_label_send_metrics"
          v-model="accountPlan.sendMetrics"
        />
        <div
          v-if="submitted && errors.has('sendMetrics')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('sendMetrics') }}
        </div>
        <p>{{ messages.field_label_send_metrics_description }}</p>
      </div>

      <div
        class="form-group mt-4 d-flex justify-content-center align-items-center"
      >
        <div class="flex-grow-1 pr-2">
          <Button block color="outline" @click="hide">
            {{ messages.button_label_cancel }}
          </Button>
        </div>
        <div class="flex-grow-1 pl-2">
          <Button
            block
            color="default"
            @click="launchBubble"
            :disabled="loading() || !isComplete"
          >
            {{ messages.button_label_launch }}
          </Button>
        </div>
      </div>
    </form>
    <AddSSHKeyModal ref="sshKeyModal" @updateSsh="onUpdateSSH" />
  </modal>
</template>

<style lang="scss">
@import '../../_scss/components/form';
@import '../../_scss/breakpoints';

.vm--container {
  .vm--overlay {
    background-color: #6f28abcc;
  }
  .vm--modal {
    border-radius: 10px;
    padding: 40px;
    position: relative;

    @include respond-below(sm) {
      padding: 40px 20px;
    }
  }
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 20px;
}
</style>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { util } from '~/_helpers';

import { Button, Input, Checkbox } from '../shared';

import AddSSHKeyModal from './AddSshKey';

export default {
  components: {
    Button,
    Input,
    Checkbox,
    AddSSHKeyModal,
  },

  data: () => ({
    user: util.currentUser(),
    accountPlan: {
      name: '',
      domain: '',
      locale: util.currentUser().locale,
      timezone: '',
      plan: 'bubble',
      footprint: 'Worldwide',
      sshKey: '',
      paymentMethodObject: {
        uuid: null,
        paymentMethodType: null,
        paymentInfo: null,
      },
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
    cloudRegionUuid: '',
  }),

  computed: {
    ...mapState('system', ['configs', 'messages', 'locales', 'timezones']),
    ...mapState('domains', ['domains']),
    ...mapState('networks', ['nearestRegions', 'newNodeNotification']),
    ...mapState('footprints', ['footprints']),
    ...mapState('users', ['sshKeys']),
    ...mapState('paymentMethods', ['accountPaymentMethods']),

    timezoneObjects: function() {
      const tz_objects = [];
      for (let i = 0; i < this.timezones.length; i++) {
        tz_objects.push({
          timezoneId: this.timezones[i],
          timezoneDescription: this.tzDescription(this.timezones[i]),
        });
      }
      return tz_objects;
    },

    isComplete() {
      return (
        (this.accountPlan.name !== '' || this.accountPlan.forkHost !== '') &&
        this.accountPlan.domain !== '' &&
        this.accountPlan.locale !== '' &&
        this.accountPlan.timezone !== '' &&
        this.accountPlan.plan !== '' &&
        this.accountPlan.footprint !== '' &&
        ((this.accountPlan.paymentMethodObject.paymentMethodType != null &&
          this.accountPlan.paymentMethodObject.paymentInfo != null) ||
          this.accountPlan.paymentMethodObject.uuid != null)
      );
    },

    localeTexts: function() {
      return this.locales
        ? this.locales.map((locale) => ({
            name: locale.localeCode,
            label: this.messages['locale_' + locale.localeCode],
          }))
        : [];
    },

    footprintObjects: function() {
      return this.footprints
        ? this.footprints.map((footprint) => ({
            ...footprint,
            localName: this.messages['footprint_name_' + footprint.name],
            description: this.messages[
              'footprint_description_' + footprint.name
            ],
          }))
        : [];
    },
  },

  methods: {
    ...mapActions('domains', ['getAllDomains']),
    ...mapActions('networks', ['getNearestRegions', 'addPlanAndStartNetwork']),
    ...mapActions('footprints', ['getAllFootprints']),
    ...mapActions('users', ['listSshKeysByUserId']),
    ...mapGetters('networks', ['loading']),

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

      this.getAllDomains({
        userId: currentUser.uuid,
        messages: this.messages,
        errors: this.errors,
      });
      this.getNearestRegions({
        footprintId: null,
        messages: this.messages,
        errors: this.errors,
      });
      this.getAllFootprints({
        userId: currentUser.uuid,
        messages: this.messages,
        errors: this.errors,
      });
      this.onUpdateSSH();
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
    findRegionName(uuid) {
      const region = this.findRegion(uuid);
      return region !== null && typeof region.name !== 'undefined'
        ? region.name
        : null;
    },
    regionDistance(uuid) {
      const region = this.findRegion(uuid);
      if (region === null) return null;
      return (
        '(~' +
        +(region.distance / 1000).toFixed(0) +
        ' ' +
        this.messages.msg_km_distance_away +
        ')'
      );
    },

    tzDescription(tz) {
      return (
        this.messages['tz_name_' + tz] +
        ' - ' +
        this.messages['tz_description_' + tz]
      );
    },

    onUpdateSSH() {
      const currentUser = util.currentUser();
      this.listSshKeysByUserId({
        userId: currentUser.uuid,
        messages: this.messages,
        errors: this.errors,
      });
    },

    launchBubble() {
      this.submitted = true;
      this.errors.clear();
      this.$validator.validate().then((valid) => {
        if (valid) {
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
        }
      });
    },
  },

  mounted() {
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
        this.$router.push({ path: '/bubble/' + nn.networkName });
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
  },
};
</script>
