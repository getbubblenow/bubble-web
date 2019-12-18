import Vue from 'vue';
import Router from 'vue-router';

import HomePage from '../account/HomePage'
import RegisterPage from '../auth/RegisterPage'
import LoginPage from '../auth/LoginPage'
import ProfilePage from '../account/profile/ProfilePage'
import PolicyPage from '../account/profile/PolicyPage'
import NotificationsPage from '../account/NotificationsPage'
import ChangePasswordPage from '../account/profile/ChangePasswordPage'
import NetworksPage from '../account/NetworksPage'
import NewNetworkPage from '../account/NewNetworkPage'
import NetworkPage from '../account/NetworkPage'
import AccountsPage from '../admin/AccountsPage'
import StripePayment from "../account/payment/StripePayment";
import InviteCodePayment from "../account/payment/InviteCodePayment";
import UnknownPayment from "../account/payment/UnknownPayment";
import { currentUser } from '../_helpers'

Vue.use(Router);

const newNetworkChildren = [
  { path: '', component: NewNetworkPage,
    children: [{
      'path': '', components: {
        'stripe': StripePayment,
        'invite': InviteCodePayment,
        'unknown': UnknownPayment
      }
    }]
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
        { path: '/me/changePassword', component: ChangePasswordPage },
        { path: '/notifications', component: NotificationsPage },
        {
          path: '/networks', component: NetworksPage ,
          children: [
            {
              path: '', component: NewNetworkPage,
              children: newNetworkChildren
            },
          ]
        },
        { path: '/networks/new', component: NewNetworkPage,
          children: newNetworkChildren
        },
        { path: '/networks/:uuid', component: NetworkPage }
      ]
    },
    { path: '/register', component: RegisterPage },
    { path: '/login', component: LoginPage },
    { path: '/logout', component: LoginPage },
    { path: '/admin/accounts', component: AccountsPage },
    { path: '/admin/accounts/:uuid', component: ProfilePage },

    // otherwise redirect to home
    { path: '*', redirect: '/' }
  ]
});

router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/logout', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const user = currentUser();

  if (authRequired) {
    // redirect to login page if not logged in and trying to access a restricted page
    if (!user) return next('/login');

    // redirect to home page if not admin and trying to access an admin page
    if (to.path.startsWith('/admin') && user.admin !== true) return next('/');
  }
  next();
});
