import Vue from 'vue';
import Router from 'vue-router';

import HomePage from '../account/HomePage'
import RegisterPage from '../auth/RegisterPage'
import LoginPage from '../auth/LoginPage'
import ProfilePage from '../account/ProfilePage'
import NetworksPage from '../account/NetworksPage'
import NewNetworkPage from '../account/NewNetworkPage'
import NetworkPage from '../account/NetworkPage'
import AccountsPage from '../admin/AccountsPage'
import { currentUser } from '../_helpers'

Vue.use(Router);

export const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/', component: HomePage,
      children: [
        { path: '', component: NetworksPage },
        { path: '/profile', component: ProfilePage },
        { path: '/networks', component: NetworksPage },
        { path: '/networks/new', component: NewNetworkPage },
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
