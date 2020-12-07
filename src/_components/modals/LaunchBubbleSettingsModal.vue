<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <modal
    name="advanced-settings"
    width="90%"
    :maxWidth="600"
    height="auto"
    scrollable
  >
    <a class="close-btn" @click="hide">
      <i class="fa fa-times"></i>
    </a>

    <form class="form">
      <h3 class="text-center mb-5">
        {{ messages.field_label_show_advanced_plan_options }}
      </h3>

      <div v-if="showForkOption">
        <!-- network type -->
        <div class="form-group">
          <v-select
            :clearable="false"
            v-validate="'required'"
            :placeholder="messages.field_label_network_type"
            :options="networkTypeOptions"
            v-model="accountPlan.launchType"
            label="name"
            :reduce="(option) => option.value"
          >
            <template v-slot:selected-option="option">
              <span>
                {{ messages.field_label_network_type }}: {{ option.name }}
              </span>
            </template>
          </v-select>
          <p
            class="text-center description"
            v-html="messages.field_description_network_type"
          />
        </div>
      </div>
      <!-- fork host and admin name -->
      <div
        v-if="
          showForkOption &&
            (accountPlan.launchType === 'fork_sage' ||
              accountPlan.launchType === 'fork_node')
        "
        class="form-group"
      >
        <Input
          type="text"
          v-model="accountPlan.forkHost"
          name="forkHost"
          :placeholder="messages.field_label_network_fork_host"
          class="form-control"
          :class="{ 'is-invalid': submitted && errors.has('forkHost') }"
        />
        <div
          v-if="submitted && errors.has('forkHost')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('forkHost') }}
        </div>
        <div
          v-if="submitted && errors.has('fqdn')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('fqdn') }}
        </div>
        <p
          class="text-center description"
          v-html="messages.field_description_network_fork_host"
        />

        <Input
          type="text"
          v-model="accountPlan.adminEmail"
          name="adminEmail"
          :placeholder="messages.field_label_network_admin_email"
          class="form-control"
          :class="{ 'is-invalid': submitted && errors.has('adminEmail') }"
        />
        <div
          v-if="submitted && errors.has('adminEmail')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('adminEmail') }}
        </div>
        <p
          class="text-center description"
          v-html="messages.field_description_network_admin_email"
        />
      </div>
      <!-- OR, name -->
      <div v-else class="form-group">
        <Input
          type="text"
          v-model="accountPlan.name"
          :placeholder="messages.field_label_network_name"
          v-validate="'required'"
          name="name"
          class="form-control"
          :class="{ 'is-invalid': submitted && errors.has('name') }"
        />
        <div
          v-if="submitted && errors.has('name')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('name') }}
        </div>
      </div>

      <div class="form-group" v-if="planObjects">
        <v-select
          v-model="accountPlan.plan"
          name="plan"
          :class="{ 'is-invalid': submitted && errors.has('plan') }"
          :options="planObjects"
          label="name"
          :placeholder="messages.field_label_plan"
          :reduce="(option) => option.uuid"
        >
          <template v-slot:option="option">
            <span>
              {{ messages['plan_name_' + option.name] }} -
              {{
                messages.price_format.parseExpression({
                  messages: messages,
                  ...option,
                })
              }}
            </span>
          </template>
          <template v-slot:selected-option="option">
            <span>
              {{ messages.field_label_plan }}:
              {{ messages['plan_name_' + option.name] }} -
              {{
                messages.price_format.parseExpression({
                  messages: messages,
                  ...selectedPlan,
                  ...option,
                })
              }}
            </span>
          </template>
        </v-select>
        <div
          v-if="submitted && errors.has('plan')"
          class="invalid-feedback d-block"
        >
          {{ errors.first('plan') }}
        </div>
      </div>

      <div class="form-group" v-if="domains">
        <v-select
          :clearable="false"
          v-validate="'required'"
          :placeholder="messages.field_label_network_domain"
          :options="domains"
          :reduce="(d) => d.name"
          v-model="accountPlan.domain"
          label="name"
        >
          <template v-slot:selected-option="option">
            <span
              >{{ messages.field_label_network_domain }}:
              {{ option.name }}</span
            >
          </template>
        </v-select>
      </div>
      <div class="form-group" v-if="nearestRegions">
        <v-select
          :clearable="false"
          v-validate="'required'"
          :placeholder="messages.field_label_region"
          :options="nearestRegions"
          v-model="cloudRegionUuid"
          label="name"
          :reduce="(region) => region.uuid"
        >
          <template v-slot:selected-option="option">
            <span>
              {{ messages.field_label_region }}: {{ option.name }}
              {{ regionDistance(option.uuid) }}
            </span>
          </template>
          <template v-slot:option="option">
            {{ option.name }} {{ regionDistance(option.uuid) }}
          </template>
        </v-select>
      </div>
      <div class="form-group">
        <Checkbox
          :label="messages.field_label_flex_region"
          v-model="flexRegion"
        />
        <p class="description">
          {{
            flexRegion
              ? messages.field_label_flex_region_description
              : messages.field_label_exact_region_description
          }}
        </p>
      </div>

      <div class="form-group" v-if="localeTexts">
        <v-select
          :clearable="false"
          v-validate="'required'"
          :placeholder="messages.field_label_locale"
          :options="localeTexts"
          v-model="accountPlan.locale"
          :reduce="(locale) => locale.name"
          label="label"
        >
          <template v-slot:selected-option="option">
            <span>{{ messages.field_label_locale }}: {{ option.label }}</span>
          </template>
        </v-select>
      </div>
      <div class="form-group" v-if="timezoneObjects">
        <v-select
          :clearable="false"
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
            <span>
              {{ messages.field_label_timezone }}:
              {{ option.timezoneDescription }}
            </span>
          </template>
        </v-select>
      </div>
      <div class="form-group" v-if="footprintObjects">
        <v-select
          :clearable="false"
          v-validate="'required'"
          :placeholder="messages.field_label_footprint"
          :options="footprintObjects"
          v-model="accountPlan.footprint"
          :reduce="(options) => options.uuid"
          label="localName"
        >
          <template v-slot:selected-option="option">
            <span>
              {{ messages.field_label_footprint }}:
              {{ option.localName }}
            </span>
          </template>
        </v-select>
      </div>
      <div class="form-group">
        <v-select
          :clearable="false"
          :placeholder="messages.field_label_network_ssh_key"
          v-model="accountPlan.sshKey"
          :reduce="(options) => options.uuid"
          :options="sshKeys"
        >
          <template v-slot:selected-option="option">
            <span>
              {{ messages.field_label_network_ssh_key }}:
              {{ option.name }}
            </span>
          </template>
          <template v-slot:option="option">
            {{ option.name }}
            (
            <span v-if="option.expiration">
              {{
                messages.date_format_ssh_key_expiration.parseDateMessage(
                  option.expiration,
                  messages
                )
              }}
            </span>
            <span v-else>
              {{ messages.message_ssh_key_no_expiration }}
            </span>
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
            {{
              submitted === true && loading()
                ? messages.button_label_launching_bubble
                : messages.button_label_launch_bubble
            }}
          </Button>
        </div>
      </div>
    </form>
    <AddSSHKeyModal ref="sshKeyModal" @updateSsh="onUpdateSSH" />
  </modal>
</template>

<style lang="scss">
@import '../../_scss/components/form';
@import '../../_scss/components/modal';
@import '../../_scss/breakpoints';

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 20px;
}

.vm--modal {
  max-width: 600px;
  left: 50% !important;
  transform: translate(-50%, 0) !important;
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
      launchType: null,
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
      forkHost: '',
      adminEmail: '',
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
    ...mapState('plans', ['plans']),
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

    planObjects: function() {
      const plans_array = [];
      if (this.plans) {
        for (let i = 0; i < this.plans.length; i++) {
          plans_array.push({
            ...this.plans[i],
            localName: this.messages['plan_name_' + this.plans[i].name],
            description: this.messages[
              'plan_description_' + this.plans[i].name
            ],
            priceMajorUnits: this.plans[i].price / 100,
            priceMinorUnits: this.plans[i].price % 100,
          });
        }
      }
      return plans_array;
    },

    selectedPlan: function() {
      return this.accountPlan && this.accountPlan.plan
        ? this.findPlan(this.accountPlan.plan)
        : null;
    },

    networkTypeOptions: function() {
      const opts = [];
      if (!(this.configs.localNetwork === true)) {
        opts.push({
          name: this.messages.field_label_network_type_regular,
          value: 'node',
        });
        if (this.accountPlan.launchType === null) {
          this.accountPlan.launchType = 'node';
        }
      }
      opts.push({
        name: this.messages.field_label_network_type_fork_sage,
        value: 'fork_sage',
      });
      opts.push({
        name: this.messages.field_label_network_type_fork_node,
        value: 'fork_node',
      });
      if (this.accountPlan.launchType === null) {
        this.accountPlan.launchType = 'fork_node';
      }
      return opts;
    },

    isComplete() {
      return (
        (this.accountPlan.name !== '' ||
          (this.accountPlan.forkHost !== '' &&
            this.accountPlan.adminEmail !== '')) &&
        this.accountPlan.domain !== '' &&
        this.accountPlan.locale !== '' &&
        this.accountPlan.timezone !== '' &&
        this.accountPlan.plan !== '' &&
        this.accountPlan.footprint !== '' &&
        (this.configs.paymentsEnabled === false ||
          ((this.accountPlan.paymentMethodObject.paymentMethodType != null &&
            this.accountPlan.paymentMethodObject.paymentInfo != null) ||
            this.accountPlan.paymentMethodObject.uuid != null))
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

    showForkOption() {
      return (
        this.configs &&
        this.configs.sageLauncher &&
        this.configs.sageLauncher === true &&
        this.user &&
        this.user.admin === true
      );
    },
  },

  methods: {
    ...mapActions('domains', ['getAllDomains']),
    ...mapActions('networks', ['getNearestRegions', 'addPlanAndStartNetwork']),
    ...mapActions('footprints', ['getAllFootprints']),
    ...mapActions('users', ['listSshKeysByUserId']),
    ...mapGetters('networks', ['loading']),
    ...mapActions('plans', ['getAllPlans']),
    ...mapActions('paymentMethods', ['getAllAccountPaymentMethods']),

    findPlan(name) {
      const plans = this.planObjects;
      if (plans) {
        for (let i = 0; i < plans.length; i++) {
          if (plans[i].name === name) return plans[i];
        }
      }
      return null;
    },

    setAccountPaymentMethod(apm) {
      this.accountPlan.paymentMethodObject = {
        uuid: apm.uuid,
        paymentMethodType: null,
        paymentInfo: null,
      };
      return false;
    },

    getDefaultName() {
      const currentUser = util.currentUser();
      return currentUser.email.split('@')[0];
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
      this.accountPlan.name = this.getDefaultName();

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
      this.getAllAccountPaymentMethods({
        userId: currentUser.uuid,
        messages: this.messages,
        errors: this.errors,
      });
      this.getAllPlans({
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
      if (region.distance === -1) return '';
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
          if (
            this.configs.paymentsEnabled === false ||
            this.paymentInfo ||
            this.accountPlan.paymentMethodObject.uuid
          ) {
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
    'accountPlan.name'(newVal) {
      if (newVal === '') {
        this.$nextTick(() => {
          this.accountPlan.name = this.getDefaultName();
        });
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
        // console.log('plans', JSON.stringify(this.user));
        if (this.user && this.user.preferredPlan) {
          const plans = this.planObjects;
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
    },
  },
};
</script>
