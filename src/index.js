/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import Vue from 'vue';
import VeeValidate from 'vee-validate';
import vSelect from 'vue-select';
import { Datetime } from 'vue-datetime';

// not sure what the best way is to include these icons
// import { library } from '@fortawesome/fontawesome-svg-core'
// import { faCoffee } from '@fortawesome/free-solid-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// library.add(faCoffee);

import { store } from './_store';
import { router } from './_router';
import TotpModal from './_components/TotpModal';
import FieldDisplay from './_components/FieldDisplay';
import FormField from './_components/FormField';
import App from './app/App';

Vue.use(VeeValidate);
Vue.component('v-select', vSelect);
Vue.component('datetime', Datetime);
Vue.component('totp-modal', TotpModal);
Vue.component('field-display', FieldDisplay);
Vue.component('form-field', FormField);
Vue.config.productionTip = false;

// plugins
import './_plugins/snotify';
import './_plugins/modal';
import './_plugins/select';

// not sure what the best way is to include these icons, we reference them programmatically via string resource/messages
// Vue.component('font-awesome-icon', FontAwesomeIcon);

new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
});
