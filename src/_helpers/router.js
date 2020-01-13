import Vue from 'vue';
import Router from 'vue-router';

import HomePage from '../account/HomePage'
import ActivationPage from '../auth/ActivationPage'
import ModelSetupPage from '../admin/ModelSetupPage'
import RegisterPage from '../auth/RegisterPage'
import LoginPage from '../auth/LoginPage'
import MultifactorAuthPage from '../auth/MultifactorAuthPage'
import ProfilePage from '../account/profile/ProfilePage'
import ActionPage from '../account/profile/ActionPage'
import PolicyPage from '../account/profile/PolicyPage'
import NotificationsPage from '../account/NotificationsPage'
import ChangePasswordPage from '../account/profile/ChangePasswordPage'
import SshKeysPage from '../account/profile/SshKeysPage'
import NetworksPage from '../account/NetworksPage'
import NewNetworkPage from '../account/NewNetworkPage'
import NetworkPage from '../account/NetworkPage'
import AccountsPage from '../admin/AccountsPage'
import StripePayment from "../account/payment/StripePayment";
import InviteCodePayment from "../account/payment/InviteCodePayment";
import FreePayment from "../account/payment/FreePayment";
import UnknownPayment from "../account/payment/UnknownPayment";
import { util } from '../_helpers'

Vue.use(Router);

const newNetworkChildren = [
  { path: '', components: {
      default: NewNetworkPage,
      pay_stripe: StripePayment,
      pay_invite: InviteCodePayment,
      pay_free: FreePayment,
      pay_unknown: UnknownPayment
    }
  }
];

export const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/', component: HomePage,
      children: [
        {
          path: '', component: NetworksPage,
          children: newNetworkChildren
        },
        { path: '/me', component: ProfilePage },
        { path: '/me/policy', component: PolicyPage },
        { path: '/me/action', component: ActionPage },
        { path: '/me/changePassword', component: ChangePasswordPage },
        { path: '/me/keys', component: SshKeysPage },
        { path: '/notifications', component: NotificationsPage },
        {
          path: '/bubbles', component: NetworksPage ,
          children: [
            {
              path: '', component: NewNetworkPage,
              children: newNetworkChildren
            },
          ]
        },
        { path: '/new_bubble', component: NewNetworkPage,
          children: newNetworkChildren
        },
        { path: '/bubble/:id', component: NetworkPage }
      ]
    },
    { path: '/action', component: ActionPage },

    { path: '/activate', component: ActivationPage },
    { path: '/register', component: RegisterPage },
    { path: '/auth', component: MultifactorAuthPage },
    { path: '/login', component: LoginPage },
    { path: '/logout', component: LoginPage },

    { path: '/admin/users', component: AccountsPage },
    { path: '/admin/users/:id', component: ProfilePage },
    { path: '/admin/model', component: ModelSetupPage },

    // otherwise redirect to home
    { path: '*', redirect: '/' }
  ]
});

router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/logout', '/register', '/auth', '/activate'];
  const authRequired = !publicPages.includes(to.path);
  const user = util.currentUser();

  if (authRequired) {
    // redirect to login page if not logged in and trying to access a restricted page
    if (!user) {
      util.setLandingPage(to);
      return next('/login');
    }

    // redirect to home page if not admin and trying to access an admin page
    if (to.path.startsWith('/admin') && user.admin !== true) return next('/');
  }
  next();
});
