import Vue from 'vue';
import VeeValidate from 'vee-validate';
import VueSidebarMenu from 'vue-sidebar-menu'
import vSelect from 'vue-select'
import { Datetime } from 'vue-datetime';

// not sure what the best way is to include these icons
// import { library } from '@fortawesome/fontawesome-svg-core'
// import { faCoffee } from '@fortawesome/free-solid-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// library.add(faCoffee);

import { store } from './_store';
import { router } from './_helpers';
import App from './app/App';

// why can't i import this?
// import 'vue-select/dist/vue-select.css';

Vue.use(VeeValidate);
Vue.use(VueSidebarMenu);
Vue.component('v-select', vSelect);
Vue.component('datetime', Datetime);
Vue.config.productionTip = false;

// not sure what the best way is to include these icons, we reference them programmatically via string resource/messages
// Vue.component('font-awesome-icon', FontAwesomeIcon);

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});