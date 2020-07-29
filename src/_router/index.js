/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import Vue from 'vue';
import Router from 'vue-router';

import LegalPage from '~/app/LegalPage';
import SupportPage from '~/app/SupportPage';
import ActivationPage from '~/auth/ActivationPage';
import ModelSetupPage from '~/admin/ModelSetupPage';
// import RegisterPage from '~/auth/RegisterPage';
// import LoginPage from '~/auth/LoginPage';
import LogoutPage from '~/auth/LogoutPage';
// import ForgotPasswordPage from '~/auth/ForgotPasswordPage';
import MultifactorAuthPage from '~/auth/MultifactorAuthPage';
import AppLoginPage from '~/auth/AppLoginPage';
import RestorePage from '~/auth/RestorePage';
import DashboardPage from '~/account/DashboardPage';
import ProfilePage from '~/account/profile/ProfilePage';
import ActionPage from '~/account/profile/ActionPage';
import PolicyPage from '~/account/profile/PolicyPage';
import DevicesPage from '~/account/DevicesPage';
import AppsPage from '~/account/AppsPage';
import AppPage from '~/account/AppPage';
import BillsPage from '~/account/payment/BillsPage';
import PaymentMethodsPage from '~/account/payment/PaymentMethodsPage';
import AppSitePage from '~/account/AppSitePage';
import AppDataViewPage from '~/account/AppDataViewPage';
import AppConfigPage from '~/account/AppConfigPage';
import NotificationsPage from '~/account/NotificationsPage';
import ChangePasswordPage from '~/account/profile/ChangePasswordPage';
import SetPasswordPage from '~/account/profile/SetPasswordPage';
import SshKeysPage from '~/account/profile/SshKeysPage';
import NetworksPage from '~/account/NetworksPage';
import NewNetworkPage from '~/account/NewNetworkPage';
import NetworkPage from '~/account/NetworkPage';
import AccountsPage from '~/admin/AccountsPage';
import StripePayment from '~/account/payment/StripePayment';
import InviteCodePayment from '~/account/payment/InviteCodePayment';
import FreePayment from '~/account/payment/FreePayment';
import UnknownPayment from '~/account/payment/UnknownPayment';
import { util } from '~/_helpers';

Vue.use(Router);

const paymentMethods = {
  pay_stripe: StripePayment,
  pay_invite: InviteCodePayment,
  pay_free: FreePayment,
  pay_unknown: UnknownPayment,
};

const paymentMethodsChildren = [{ path: '', components: paymentMethods }];

const newNetworkChildren = [
  {
    path: '',
    components: {
      default: NewNetworkPage,
      ...paymentMethods,
    },
  },
];

export const router = new Router({
  mode: 'history',
  routes: [
    // new Pages & lazy loading
    {
      path: '/new_pages',
      component: () => import('~/_pages/Layout'),
      children: [
        {
          path: '',
          component: () => import('~/_pages/main/Layout'),
          children: [
            {
              path: '',
              component: () => import('~/_pages/main/account/Layout'),
              children: [
                {
                  path: 'verify-email',
                  component: () => import('~/_pages/main/account/VerifyEmail'),
                },
                {
                  path: 'payment',
                  component: () => import('~/_pages/main/account/Payment'),
                },
              ],
            },
            {
              path: 'test',
              component: () => import('~/_pages/main/Test'),
            },
          ],
        },
      ],
    },

    // existing pages
    { path: '', component: DashboardPage },
    { path: '/', component: DashboardPage },
    { path: '/legal', component: LegalPage },
    { path: '/support', component: SupportPage },

    { path: '/me', component: ProfilePage },
    { path: '/me/policy', component: PolicyPage },
    {
      path: '/me/download/:uuid',
      redirect: (r) => ({
        path: '/me/policy',
        query: { download: r.params.uuid },
      }),
    },
    { path: '/me/action', component: ActionPage },
    { path: '/me/changePassword', component: ChangePasswordPage },
    { path: '/me/setPassword/:code', component: SetPasswordPage },
    { path: '/me/keys', component: SshKeysPage },
    { path: '/me/bills', component: BillsPage },
    {
      path: '/me/payment',
      component: PaymentMethodsPage,
      children: paymentMethodsChildren,
    },
    { path: '/devices', component: DevicesPage },
    { path: '/apps', component: AppsPage },
    { path: '/app/:app', component: AppPage },
    { path: '/app/:app/config/:view', component: AppConfigPage },
    { path: '/app/:app/config/:view/:item', component: AppConfigPage },
    { path: '/app/:app/view/:view', component: AppDataViewPage },
    { path: '/app/:app/site/:site', component: AppSitePage },
    { path: '/app/:app/site/:site/view/:view', component: AppDataViewPage },
    { path: '/notifications', component: NotificationsPage },
    {
      path: '/bubbles',
      component: NetworksPage,
      children: [
        {
          path: '',
          component: NewNetworkPage,
          children: newNetworkChildren,
        },
      ],
    },
    {
      path: '/new_bubble',
      component: NewNetworkPage,
      children: newNetworkChildren,
    },
    { path: '/bubble/:id', component: NetworkPage },
    { path: '/action', component: ActionPage },
    { path: '/resetPassword/:code', component: SetPasswordPage },

    { path: '/activate', component: ActivationPage },
    // {
    //   path: '/register',
    //   component: RegisterPage,
    //   children: paymentMethodsChildren,
    // },
    { path: '/auth', component: MultifactorAuthPage },
    // { path: '/login', component: LoginPage },
    { path: '/logout', component: LogoutPage },
    // { path: '/forgotPassword', component: ForgotPasswordPage },
    { path: '/appLogin', component: AppLoginPage },
    { path: '/restore', component: RestorePage },

    { path: '/admin/accounts', component: AccountsPage },
    { path: '/admin/new_account', component: ProfilePage },
    { path: '/admin/accounts/:id', component: ProfilePage },
    { path: '/admin/accounts/:id/policy', component: PolicyPage },
    {
      path: '/admin/accounts/:id/changePassword',
      component: ChangePasswordPage,
    },
    { path: '/admin/accounts/:id/keys', component: SshKeysPage },
    { path: '/admin/accounts/:id/bills', component: BillsPage },
    {
      path: '/admin/accounts/:id/payment',
      component: PaymentMethodsPage,
      children: paymentMethodsChildren,
    },
    { path: '/admin/model', component: ModelSetupPage },

    // new route
    {
      path: '',
      component: () => import('~/_pages/Layout'),
      children: [
        {
          path: '',
          component: () => import('~/_pages/auth/Layout'),
          children: [
            {
              path: 'login',
              component: () => import('~/_pages/auth/Login'),
            },
            {
              path: 'forgotPassword',
              component: () => import('~/_pages/auth/ForgotPassword'),
            },
            {
              path: 'register',
              component: () => import('~/_pages/auth/Register'),
            },
          ],
        },
        {
          path: '',
          component: () => import('~/_pages/main/Layout'),
          children: [],
        },
      ],
    },

    // otherwise redirect to dashboard
    { path: '*', redirect: '/' },
  ],
});

const publicPages = [
  '/login',
  '/logout',
  '/register',
  '/appLogin',
  '/restore',
  '/forgotPassword',
  '/resetPassword',
  '/action',
  '/auth',
  '/activate',
  '/legal',

  // new Pages
  '/new_pages',
];

router.beforeEach((to, from, next) => {
  const authRequired =
    !publicPages.includes(to.path) &&
    publicPages.filter((p) => to.path.startsWith(p)).length === 0;
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
