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
          :placeholder="messages.field_label_bubble_name"
        />
      </div>
      <div class="form-group" v-if="domains">
        <v-select
          :placeholder="messages.field_label_network_domain"
          :options="domains"
          label="name"
        >
        </v-select>
      </div>
      <div class="form-group" v-if="nearestRegions">
        <v-select
          :placeholder="messages.field_label_region"
          :options="nearestRegions"
          label="name"
        >
          <template v-slot:option="option">
            {{ option.name }} {{ regionDistance(option.uuid) }}
          </template>
        </v-select>
      </div>
      <div class="form-group" v-if="localeTexts">
        <v-select
          :placeholder="messages.field_label_locale"
          :options="localeTexts"
          label="label"
        >
        </v-select>
      </div>
      <div class="form-group" v-if="timezoneObjects">
        <v-select
          :placeholder="messages.field_label_timezone"
          :options="timezoneObjects"
          :reduce="(tz) => tz.timezoneId"
          label="timezoneDescription"
          type="text"
          name="timezone"
        ></v-select>
      </div>
      <div class="form-group" v-if="footprintObjects">
        <v-select
          :placeholder="messages.field_label_footprint"
          :options="footprintObjects"
          label="localName"
        ></v-select>
      </div>
      <div class="form-group">
        <v-select
          :placeholder="messages.field_label_network_ssh_key"
        ></v-select>
      </div>
      <div class="form-group">
        <Button color="outline" height="34">
          {{ messages.form_title_add_ssh_key }}
        </Button>
        <p class="description text-left ml-0 mt-2">
          {{ messages.field_description_network_ssh_key }}
        </p>
      </div>

      <div class="form-group my-4">
        <Checkbox :label="messages.field_label_sendInformation" />
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
    </form>
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
import { mapState, mapActions } from 'vuex';
import { util } from '~/_helpers';

import { Button, Input, Checkbox } from '../shared';

export default {
  components: {
    Button,
    Input,
    Checkbox,
  },

  data: () => ({}),

  computed: {
    ...mapState('system', ['configs', 'messages', 'locales', 'timezones']),
    ...mapState('domains', ['domains']),
    ...mapState('networks', ['nearestRegions']),
    ...mapState('footprints', ['footprints']),

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

    localeTexts: function() {
      return this.locales
        ? this.locales.map((locale) => ({
            ...locale,
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
    ...mapActions('networks', ['getNearestRegions']),
    ...mapActions('footprints', ['getAllFootprints']),

    show() {
      this.$modal.show('advanced-settings');
    },
    hide() {
      this.$modal.hide('advanced-settings');
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
  },

  mounted() {
    this.initDefaults();
    this.show();
  },

  watch: {},
};
</script>
