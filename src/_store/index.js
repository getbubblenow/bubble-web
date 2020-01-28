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
        accountPlans,
        networks,
        devices,
        apps
    }
});

const safeEval = require('safe-eval');

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
        return evalInContext(context, expression)
    }) : '';
};

String.prototype.parseDateMessage = function (millis, messages) {
    if (typeof millis === 'undefined' || millis === null || millis === 0) return messages.label_date_undefined;
    const date = new Date(millis);
    const context = {
        YYYY: date.getFullYear(),
        MMM: messages['label_date_month_'+date.getMonth()],
        MM: messages['label_date_month_short_'+date.getMonth()],
        M: messages['label_date_month_number_'+date.getMonth()],
        EEE: messages['label_date_day_'+date.getDay()],
        E: messages['label_date_day_short_'+date.getDay()],
        d: date.getDate(),
        H: date.getHours(),
        h: (date.getHours() > 12 ? date.getHours() - 12 : date.getHours()+1),
        a: (date.getHours() > 12 ? messages['label_date_day_half_pm'] : messages['label_date_day_half_am']),
        m: date.getMinutes(),
        s: date.getSeconds()
    };
    return this ? ''+this.replace(/{{[\w]+?}}/g, match => {
        const expression = match.slice(2, -2);
        return evalInContext(context, expression)
    }) : '';
};
