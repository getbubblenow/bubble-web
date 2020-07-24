/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import Vue from 'vue';
import Snotify, { SnotifyPosition } from 'vue-snotify';
import 'vue-snotify/styles/material.css';

const options = {
  toast: {
    position: SnotifyPosition.rightTop,
  },
  timeout: 3000,
  progressBar: true,
};

Vue.use(Snotify, options);
