<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
  <div class="wrapper">
    <h3 class="text-center form-title">
      {{ messages.label_launching_bubble_title }}
    </h3>
    <h5 class="d-flex align-items-center justify-content-center form-sub-title">
      <span class="text-center">
        {{ messages.label_launching_bubble_description }}
      </span>
    </h5>

    <div
      class="d-flex flex-column align-items-center justify-content-center mt-5 mx-auto launch-bubble-wrapper"
    >
      <div ref="lottie" class="lottie"></div>
      <div
        v-if="
          stats &&
            (network.state === 'created' ||
              network.state === 'starting' ||
              network.state === 'restoring')
        "
      >
        <!-- adapted from: https://code-boxx.com/simple-vanilla-javascript-progress-bar/ -->
        <div v-if="stats.percent" class="progress-wrap">
          <div
            class="progress-bar"
            :style="'width: ' + stats.percent + '%'"
            :id="'progressBar_' + networkId"
          ></div>
          <div class="progress-text">
            {{
              messages.label_percent.parseMessage(this, {
                percent: stats.percent,
              })
            }}
          </div>
        </div>
        <div v-if="!statsError" :id="'progressBar_details_' + networkId">
          {{ messages[stats.messageKey] }}
        </div>
        <hr />
      </div>
      <Button color="default" width="195" height="60" @click="deleteNet">
        {{ messages.button_cancel_launch_bubble }}
      </Button>
    </div>

    <!--- Get Bubbles Section --->
    <div class="container">
      <h5 class="text-center d-block mt-5">
        {{ messages.label_get_bubble_for_devices }}
      </h5>
      <div class="row" v-if="messages && messages.marketing_message_topics">
        <div
          v-for="(item, index) in messages.available_devices.split(',')"
          :key="index"
          class="col-lg-3 col-md-6 col-sm-12 my-4 px-3"
        >
          <Card class="h-100">
            <div class="card-content">
              <img :src="`/${item}.png`" />
              <span class="card-message">
                {{ messages[`label_device_${item}`] }}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
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

.card-message {
  margin-top: 20px;
}

@include respond-below(sm) {
  .launch-bubble-wrapper {
    width: 300px;
  }
}
</style>

<script>
import { mapState, mapActions } from 'vuex';
import Lottie from 'lottie-web';

import { util } from '~/_helpers';
import { Button, Card } from '~/_components/shared';

export default {
  components: {
    Button,
    Card,
  },

  data() {
    return {
      stats: null,
      statsError: false,
      refresher: null,
      networkId: this.$route.params.id,
      lottie: null,
      timerID: null,
      frameNumber: 0,
      targetFrameNumber: 0,
    };
  },

  computed: {
    ...mapState('system', ['messages']),
    ...mapState('account', ['user']),
    ...mapState('networks', [
      'network',
      'networkStatuses',
      'deletedNetworkUuid',
    ]),
  },

  created() {
    const user = util.currentUser();
    this.refreshStatus(user.uuid);
    this.startStatusRefresher(user);
    this.restoreKeyCode = this.$route.query.keys_code;
    this.getAppLinks(user.locale);
    this.loadSystemConfigs();
  },

  mounted() {
    this.lottie = Lottie.loadAnimation({
      container: this.$refs.lottie,
      renderer: '',
      loop: false,
      autoplay: false,
      path: '/launching-bubble.json',
    });
    this.frameNumber = 0;
    this.targetFrameNumber = 20;

    setTimeout(() => {
      this.timerID = setInterval(() => {
        if (this.frameNumber < this.targetFrameNumber) {
          console.log(this.frameNumber);
          this.frameNumber++;
        }
      }, 100);
    }, 2000);
  },

  beforeDestroy() {
    this.clearRefresherInterval(this.refresher);
    this.clearRefresherInterval(this.stopRefresher);
    this.resetRestoreKey();
  },

  methods: {
    ...mapActions('networks', [
      'getNetworkById',
      'deleteNetwork',
      'getStatusesByNetworkId',
      'getNodesByNetworkId',
      'getLogFlag',
      'getBackups',
      'resetRestoreKey',
    ]),
    ...mapActions('system', [
      'getAppLinks',
      'loadSystemConfigs',
      'checkForUpgrade',
      'upgrade',
    ]),

    refreshStatus(userId) {
      this.getNetworkById({
        userId: userId,
        networkId: this.networkId,
        messages: this.messages,
        errors: this.errors,
      });
      this.getStatusesByNetworkId({
        userId: userId,
        networkId: this.networkId,
        messages: this.messages,
        errors: this.errors,
      });
      this.getNodesByNetworkId({
        userId: userId,
        networkId: this.networkId,
        nodes: this.nodes,
        messages: this.messages,
        errors: this.errors,
      });

      if (this.logFlag === null || this.refresher === null) {
        this.getLogFlag({
          networkId: this.networkId,
          messages: this.messages,
          errors: this.errors,
        });
      }
      if (this.backups === null || this.refresher === null) {
        // note about the second part of the condition above: if refreshes is turned on, then fetch backups
        // from BE only once
        this.getBackups({
          userId: userId,
          networkId: this.networkId,
          messages: this.messages,
          errors: this.errors,
        });
      }
    },

    startStatusRefresher(user) {
      // todo: separate refresher for network -- after "stop" we should refresh the status to show it is stopped
      this.refresher = setInterval(() => this.refreshStatus(user.uuid), 5000);
    },

    clearRefresherInterval(refresherId) {
      if (refresherId !== null) {
        clearInterval(refresherId);
        refresherId = null;
      }
    },

    stopNet() {
      if (this.networkUuid === null) {
        alert(this.messages.network_action_stop_not_ready);
      } else {
        if (confirm(this.messages.confirmation_network_action_stop)) {
          this.errors.clear();
          this.stopNetwork({
            userId: this.user.uuid,
            networkId: this.networkUuid,
            messages: this.messages,
            errors: this.errors,
          });
          this.clearRefresherInterval(this.refresher);
          this.stopRefresher = setInterval(
            () => this.stopRefreshStatus(this.user.uuid),
            5000
          );
        }
      }
    },

    deleteNet() {
      if (confirm(this.messages.confirmation_network_action_delete)) {
        this.errors.clear();
        this.deleteNetwork({
          userId: this.user.uuid,
          networkId: this.networkId,
          messages: this.messages,
          errors: this.errors,
        });
      }
    },
  },

  watch: {
    network(net) {
      if (net) {
        if (net.uuid === 'Not Found')
          this.$router.replace({ path: '/bubble' });
        this.networkUuid = net.uuid;
        if (net.state !== 'stopping')
          this.clearRefresherInterval(this.stopRefresher);
      }
    },

    networkStatuses(stats) {
      // console.log('watch.networkStatuses received: '+JSON.stringify(stats));
      let latestStats = null;
      if (this.network && stats && stats.length && stats.length > 0) {
        for (let i = 0; i < stats.length; i++) {
          if (
            stats[i].network === this.network.uuid &&
            (latestStats === null || stats[i].ctime > latestStats.ctime)
          ) {
            latestStats = stats[i];
          }
        }
      }
      if (latestStats !== null) {
        this.stats = latestStats;
        this.statsError = this.stats.messageKey.startsWith('meter_error_');

        let isStatsErrorRetry = this.stats.messageKey.startsWith(
          'meter_error_retry_'
        );
        let isStatsCompleted =
          this.stats.percent === 100 ||
          this.stats.messageKey.startsWith('meter_completed_');
        if ((this.statsError && !isStatsErrorRetry) || isStatsCompleted) {
          this.clearRefresherInterval(this.refresher);
          this.$router.push(`/bubble/${this.networkId}`);
        }
      } else {
        // status not found for our network
        this.clearRefresherInterval(this.refresher);
      }

      if (this.stats) {
        this.targetFrameNumber = 20 + (30 / 100) * this.stats.percent;
      }
    },

    deletedNetworkUuid(uuid) {
      if (uuid && this.networkUuid && uuid === this.networkUuid) {
        this.$router.replace({ path: '/bubble' });
      }
    },

    frameNumber() {
      this.lottie.goToAndStop(this.frameNumber, true);
      if (this.frameNumber >= 50) {
        clearInterval(this.timerID);
      }
    },
  },
};
</script>
