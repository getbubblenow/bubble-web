import Vue from 'vue';
import Vuex from 'vuex';

import { alert } from './alert.module';
import { system } from './system.module';
import { account } from './account.module';
import { users } from './users.module';
import { plans } from './plans.module';
import { footprints } from './footprints.module';
import { domains } from './domains.module';
import { accountPlans } from './accountPlans.module';
import { networks } from './networks.module';

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        alert,
        system,
        account,
        users,
        domains,
        plans,
        footprints,
        accountPlans,
        networks
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

String.prototype.parseMessage = function (vue) {
    return this ? ''+this.replace(/{{.*?}}/g, match => {
        const expression = match.slice(2, -2);
        return evalInContext(vue, expression)
    }) : '';
};
