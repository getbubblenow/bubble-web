/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import Vue from 'vue';
import Vuex from 'vuex';

import { alert } from './alert.module';
import { system } from './system.module';
import { account } from './account.module';
import { users } from './users.module';
import { plans } from './plans.module';
import { footprints } from './footprints.module';
import { domains } from './domains.module';
import { paymentMethods } from './paymentMethods.module';
import { bills } from './bills.module';
import { accountPlans } from './accountPlans.module';
import { networks } from './networks.module';
import { devices } from './devices.module';
import { apps } from './apps.module';

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        alert,
        system,
        account,
        users,
        plans,
        footprints,
        domains,
        paymentMethods,
        bills,
        accountPlans,
        networks,
        devices,
        apps
    }
});

export const safeEval = require('safe-eval');
export const loadingImgSrc = 'data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4'
                             + 'wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2'
                             + 'MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63'
                             + 'P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAA'
                             + 'EAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQo'
                             + 'AAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TA'
                             + 'AAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsG'
                             + 'o/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3'
                             + 'lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTA'
                             + 'UkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMT'
                             + 'CpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==';

function evalInContext(vue, string) {
    try {
        return safeEval('vue.'+string, {vue});
    } catch (error) {
        try {
            return safeEval(string);
        } catch (errorWithoutThis) {
            console.warn('evalInContext: Error evaluating "' + string + '"', errorWithoutThis);
            return '';
        }
    }
}

String.prototype.parseMessage = function (vue, ctx) {
    const context = (typeof ctx !== 'undefined' && ctx !== null) ? Object.assign(vue, ctx) : vue;
    return this ? ''+this.replace(/{{[\w][\w\._]*?}}/g, match => {
        const expression = match.slice(2, -2);
        return evalInContext(context, expression);
    }) : '';
};

String.prototype.parseExpression = function (ctx) {
    return this ? ''+this.replace(/{{.+?}}/g, match => {
        const expression = match.slice(2, -2);
        return safeEval(expression, ctx);
    }) : '';
};

String.prototype.parseDateMessage = function (millis, messages) {
    if (typeof millis === 'undefined' || millis === null || millis === 0) return messages.label_date_undefined;
    const date = new Date(millis);
    const context = {
        YYYY: date.getFullYear(),
        YY: (date.getFullYear() % 100 < 10 ? '0' + (date.getFullYear() % 100) : (date.getFullYear() % 100)),
        MMMM: messages['label_date_month_'+date.getMonth()],
        MMM: messages['label_date_month_short_'+date.getMonth()],
        MM: date.getMonth() < 10 ? '0' + messages['label_date_month_number_'+date.getMonth()] : messages['label_date_month_number_'+date.getMonth()],
        M: messages['label_date_month_number_'+date.getMonth()],
        EEE: messages['label_date_day_'+date.getDay()],
        E: messages['label_date_day_short_'+date.getDay()],
        dd: date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
        d: date.getDate(),
        H: date.getHours(),
        h: (date.getHours() > 12 ? date.getHours() - 12 : date.getHours() === 0 ? 12 : date.getHours()),
        A: (date.getHours() >= 12 ? messages['label_date_day_half_pm'].toUpperCase() : messages['label_date_day_half_am']).toUpperCase(),
        a: (date.getHours() >= 12 ? messages['label_date_day_half_pm'].toLowerCase() : messages['label_date_day_half_am']).toLowerCase(),
        m: date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes(),
        s: date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds()
    };
    return this ? ''+this.replace(/{{[\w]+?}}/g, match => {
        const expression = match.slice(2, -2);
        return evalInContext(context, expression)
    }) : '';
};
