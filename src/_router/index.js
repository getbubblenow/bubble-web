/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import Vue from 'vue';
import Router from 'vue-router';

import ActivationPage from '~/auth/ActivationPage';
import ModelSetupPage from '~/admin/ModelSetupPage';
// import RegisterPage from '~/auth/RegisterPage';
// import LoginPage from '~/auth/LoginPage';
import LogoutPage from '~/auth/LogoutPage';
// import ForgotPasswordPage from '~/auth/ForgotPasswordPage';
import MultifactorAuthPage from '~/auth/MultifactorAuthPage';
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

export const router = new Router({
  mode: 'history',
  routes: [
    // existing pages
    // { path: '/legal', component: LegalPage },
    // { path: '/support', component: SupportPage },

    { path: '/me/old', component: ProfilePage },
    // { path: '/me/policy', component: PolicyPage },
    // { path: '/me/changePassword/old', component: ChangePasswordPage },
    // { path: '/me/setPassword/:code', component: SetPasswordPage },
    // { path: '/me/keys', component: SshKeysPage },
    // { path: '/me/bills', component: BillsPage },
    // {
    //   path: '/me/payment',
    //   component: PaymentMethodsPage,
    //   children: paymentMethodsChildren,
    // },
    { path: '/devices/old', component: DevicesPage },

    // {
    //   path: '/register',
    //   component: RegisterPage,
    //   children: paymentMethodsChildren,
    // },
    // { path: '/login', component: LoginPage },
    // { path: '/forgotPassword', component: ForgotPasswordPage },
    // { path: '/appLogin', component: AppLoginPage },
    // { path: '/restore', component: RestorePage },

    // new route
    { path: '', redirect: '/bubble', exact: true },

    {
      path: '',
      component: () => import('~/_pages/Layout'),
      children: [
        {
          path: '',
          component: () => import('~/_pages/main/Layout'),
          children: [
            { path: '', component: DashboardPage },
            {
              path: 'bubble',
              component: () => import('~/_pages/main/bubble/MyBubble'),
            },
            {
              path: 'bubble/:id',
              component: () => import('~/_pages/main/bubble/Network'),
            },
            { path: 'action', component: ActionPage },
            { path: 'resetPassword/:code', component: SetPasswordPage },

            { path: 'activate', component: ActivationPage },
            { path: 'auth', component: MultifactorAuthPage },
            { path: 'admin/accounts', component: AccountsPage },
            { path: 'admin/new_account', component: ProfilePage },
            { path: 'admin/accounts/:id', component: ProfilePage },
            { path: 'admin/accounts/:id/policy', component: PolicyPage },
            {
              path: 'admin/accounts/:id/changePassword',
              component: ChangePasswordPage,
            },
            { path: 'admin/accounts/:id/keys', component: SshKeysPage },
            { path: 'admin/accounts/:id/bills', component: BillsPage },
            {
              path: 'admin/accounts/:id/payment',
              component: PaymentMethodsPage,
              children: paymentMethodsChildren,
            },
            { path: 'admin/model', component: ModelSetupPage },
            {
              path: 'me',
              exact: true,
              component: () => import('~/_pages/main/account/MyAccount'),
            },
            {
              path: 'me/changePassword',
              component: () => import('~/_pages/main/account/ChangePassword'),
            },
            {
              path: 'me/setPassword/:code',
              component: () => import('~/_pages/main/account/SetPassword'),
            },
            {
              path: 'me/keys',
              component: () => import('~/_pages/main/account/ManageSSH'),
            },
            {
              path: 'me/payment',
              component: () => import('~/_pages/main/account/PaymentMethods'),
            },
            {
              path: 'me/bills',
              component: () => import('~/_pages/main/account/Bills'),
            },
            {
              path: 'me/policy',
              component: () => import('~/_pages/main/account/Policy'),
            },
            {
              path: 'me/delete',
              component: () => import('~/_pages/main/account/Delete'),
            },

            {
              path: 'devices',
              component: () => import('~/_pages/main/account/Devices'),
            },

            {
              path: 'bubble/:id',
              component: () => import('~/_pages/main/bubble/Network'),
            },
            {
              path: 'restore',
              component: () => import('~/_pages/main/bubble/Restore'),
            },
            {
              path: 'legal',
              component: () => import('~/_pages/main/account/Legal'),
            },
            {
              path: 'support',
              component: () => import('~/_pages/main/account/Support'),
            },
          ],
        },
        {
          path: '',
          component: () => import('~/_pages/auth/Layout'),
          children: [
            { path: '', component: DashboardPage },
            {
              path: 'me/download/:uuid',
              redirect: (r) => ({
                path: 'me/policy',
                query: { download: r.params.uuid },
              }),
            },
            { path: 'login', component: () => import('~/_pages/auth/Login') },
            {
              path: 'forgotPassword',
              component: () => import('~/_pages/auth/ForgotPassword'),
            },
            {
              path: 'register',
              component: () => import('~/_pages/auth/Register'),
            },
            { path: 'me/action', component: ActionPage },
            { path: 'apps', component: AppsPage },
            { path: 'app/:app', component: AppPage },
            { path: 'app/:app/config/:view', component: AppConfigPage },
            {
              path: 'app/:app/config/:view/:item',
              component: AppConfigPage,
            },
            { path: 'app/:app/view/:view', component: AppDataViewPage },
            { path: 'app/:app/site/:site', component: AppSitePage },
            {
              path: 'app/:app/site/:site/view/:view',
              component: AppDataViewPage,
            },
            { path: 'notifications', component: NotificationsPage },
            {
              path: 'appLogin',
              component: () => import('~/_pages/auth/AppLogin'),
            },
            {
              path: 'verifyEmail',
              component: () => import('~/_pages/auth/VerifyEmail'),
            },
            {
              path: 'payment',
              component: () => import('~/_pages/auth/Payment'),
            },
            { path: 'logout', component: () => import('~/auth/LogoutPage') },
          ],
        },
      ],
    },

    // otherwise redirect to dashboard
    { path: '*', redirect: '' },
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

  '/me/action',
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
