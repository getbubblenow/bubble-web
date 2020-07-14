<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div>
<!--        <h2 v-if="verifiedContacts || user.admin">{{messages.form_title_new_network}}</h2>-->

        <div v-if="inboundAction" :class="`alert ${inboundAction.alertType}`">
            {{messages['message_inbound_'+inboundAction.actionType]}}
            {{messages['message_inbound_'+inboundAction.status]}}
            <div v-if="errors.has('token')" class="invalid-feedback d-block">{{ errors.first('token') }}</div>
            <div v-if="errors.has('request')" class="invalid-feedback d-block">{{ errors.first('request') }}</div>
        </div>

        <div v-if="anyContacts !== null && !anyContacts && !user.admin">
            <h3>{{messages.message_no_contacts}}</h3>
            <router-link v-if="!anyContacts" to="/me/policy">{{messages.link_label_no_contacts}}</router-link>
        </div>
        <div v-else-if="verifiedContacts !== null && !verifiedContacts && !user.admin">
            <h3>{{messages.message_no_verified_contacts}}</h3>
            {{messages.message_no_verified_contacts_subtext}}
            <hr/>
            <button class="btn btn-primary" :disabled="actionStatus.requesting" @click="resendVerification(firstContact)">{{messages.button_label_resend_verify_code}}</button>
        </div>
        <div v-else-if="typeof accountPayMethods !== 'undefined' && accountPayMethods !== null && accountPayMethods.length === 0">

            <!-- plan -->
            <div class="form-group">
                <label htmlFor="plan">{{messages.field_label_choose_plan}}:</label>
                <select v-validate="'required'" v-if="planObjects" v-model="accountPlan.plan" name="plan" class="form-control" :class="{ 'is-invalid': submitted && errors.has('plan') }">
                    <option v-for="plan in planObjects" :value="plan.name">{{messages['plan_name_'+plan.name]}} - {{messages.price_format.parseExpression({messages: messages, ...plan})}}</option>
                </select>
                <div v-if="submitted && errors.has('plan')" class="invalid-feedback d-block">{{ errors.first('plan') }}</div>
            </div>
            <div>
                {{messages['plan_description_'+accountPlan.plan]}}
                <div v-if="selectedPlan">
                    <div v-if="typeof selectedPlan.maxAccounts !== 'undefined' && selectedPlan.maxAccounts !== null && selectedPlan.maxAccounts === 1">&bullet; {{messages.message_plan_max_accounts_one.parseExpression({max: selectedPlan.maxAccounts})}}</div>
                    <div v-else-if="typeof selectedPlan.maxAccounts !== 'undefined' && selectedPlan.maxAccounts !== null && selectedPlan.maxAccounts > 1">&bullet; {{messages.message_plan_max_accounts_multiple.parseExpression({max: selectedPlan.maxAccounts})}}</div>
                    <div v-else>&bullet; {{messages.message_plan_no_max_accounts}}</div>
                </div>
            </div>
            <hr/>

            <div v-if="promos && promos.length && promos.length > 0">
                <h4><b>{{messages.payment_first_details_with_promos}}</b></h4>
                <table border="0">
                    <tr v-for="promo in promos">
                        <td><b>{{messages['label_promotion_'+promo.name]}}</b>:</td>
                        <td>{{messages['label_promotion_'+promo.name+'_description']}}</td>
                    </tr>
                </table>
                <hr/>
                <p>{{messages.payment_first_details_with_promos_details}}</p>
            </div>
            <div v-else-if="(verifiedContacts || user.admin) && typeof accountPayMethods !== 'undefined' && accountPayMethods !== null && accountPayMethods.length > 0">
                <p v-html="messages.payment_first_details_no_promos"></p>
            </div>
            <hr/>

            <!-- add a new payment method -->
<!--            <label htmlFor="paymentMethod">{{messages.field_label_newPaymentMethod}}</label>-->
            <div v-if="payMethods && payMethods.length > 1">
                <span v-for="pm in payMethods">
                    <button v-if="!pm.driverClass.endsWith('NoopCloud')" class="btn btn-primary" :disabled="loading()" @click="setPaymentMethod(pm)">{{messages['payment_description_'+pm.paymentMethodType]}}</button>
                </span>
            </div>
            <div v-if="typeof payMethods !== 'undefined' && payMethods !== null || payMethods.length > 0" v-for="pm in payMethods">
                <div v-if="selectedPaymentMethod !== null && selectedPaymentMethod.driverClass !== null && selectedPaymentMethod.driverClass === pm.driverClass">
                    <router-view name="pay_stripe" v-if="pm.driverClass.endsWith('StripePaymentDriver')"></router-view>
                    <router-view name="pay_invite" v-else-if="pm.driverClass.endsWith('CodePaymentDriver')"></router-view>
                    <router-view name="pay_free" v-else-if="pm.driverClass.endsWith('FreePaymentDriver')"></router-view>
                    <!-- <router-view name="pay_unknown" v-else></router-view> -->
                </div>
            </div>
            <hr/>

        </div>
        <div v-else-if="typeof accountPayMethods !== 'undefined' && accountPayMethods !== null && accountPayMethods.length > 0">
        <form @submit.prevent="handleSubmit">

            <div class="form-group">
                <button class="btn btn-primary" :disabled="loading() || !isComplete" @click="launchBubble()">{{messages.button_label_create_new_network}}</button>
                <img v-show="loading()" :src="loadingImgSrc" />
            </div>
            <hr/>

            <div v-if="promos && promos.length && promos.length > 0">
                <h5>{{messages.title_account_promotions}}</h5>
                <table border="0">
                    <tr v-for="promo in promos">
                        <td><b>{{messages['label_promotion_'+promo.name]}}</b>:</td>
                        <td>{{messages['label_promotion_'+promo.name+'_description']}}</td>
                    </tr>
                </table>
                <hr/>
            </div>

            <div v-if="showAdvanced || showForkOption">

                <div v-if="!showForkOption">
                    <label for="showAdvanced"><b>{{messages.field_label_show_advanced_plan_options}}</b></label>
                    <input type="checkbox" name="showAdvanced" v-model="showAdvanced"/>
                </div>

                <div v-if="showForkOption">
                <!-- network type -->
                <div class="form-group">
                    <label for="networkType">{{messages.field_label_network_type}}</label>
                    <select v-model="networkType" name="networkType" class="form-control">
                        <option value="bubble">{{messages.field_label_network_type_regular}}</option>
                        <option value="fork">{{messages.field_label_network_type_fork}}</option>
                    </select>
                </div>
                <!-- fork host -->
                <div v-if="networkType === 'fork'" class="form-group">
                    <label for="forkHost">{{messages.field_label_network_fork_host}}</label>
                    <input type="text" v-model="accountPlan.forkHost" name="forkHost" class="form-control" :class="{ 'is-invalid': submitted && errors.has('forkHost') }" />
                    <div v-if="submitted && errors.has('forkHost')" class="invalid-feedback d-block">{{ errors.first('forkHost') }}</div>
                    <div v-if="submitted && errors.has('fqdn')" class="invalid-feedback d-block">{{ errors.first('fqdn') }}</div>
                    {{messages.field_description_network_fork_host}}
                </div>
                <!-- OR, name -->
                <div v-else class="form-group">
                    <label for="name">{{messages.field_label_network_name}}</label>
                    <input type="text" v-model="accountPlan.name" v-validate="'required'" name="name" class="form-control" :class="{ 'is-invalid': submitted && errors.has('name') }" />
                    <div v-if="submitted && errors.has('name')" class="invalid-feedback d-block">{{ errors.first('name') }}</div>
                </div>
            </div>
            <!-- name -->
            <div v-else class="form-group">
                <label for="name">{{messages.field_label_network_name}}</label>
                <input type="text" v-model="accountPlan.name" v-validate="'required'" name="name" class="form-control" :class="{ 'is-invalid': submitted && errors.has('name') }" />
                <div v-if="submitted && errors.has('name')" class="invalid-feedback d-block">{{ errors.first('name') }}</div>
            </div>

            <!-- plan -->
            <div v-if="customize.plan === true" class="form-group">
                <label htmlFor="plan">{{messages.field_label_plan}}:</label>
                <select v-validate="'required'" v-if="planObjects" v-model="accountPlan.plan" name="plan" class="form-control" :class="{ 'is-invalid': submitted && errors.has('plan') }">
                    <option v-for="plan in planObjects" :value="plan.name">{{messages['plan_name_'+plan.name]}} - {{messages.price_format.parseExpression({messages: messages, ...plan})}}</option>
                </select>
                <div v-if="submitted && errors.has('plan')" class="invalid-feedback d-block">{{ errors.first('plan') }}</div>
                <button @click="customize.plan = false">{{messages.button_label_use_default}}</button>
            </div>
            <div v-if="customize.plan === false">
                {{messages.field_label_plan}}:
                <span v-if="findPlan(defaults.plan) && defaults.plan">{{messages['plan_name_'+defaults.plan]}} - {{messages.price_format.parseExpression({messages: messages, ...findPlan(defaults.plan)})}}</span>
                <span v-else v-html="messages.message_auto_detecting"></span>
                <button @click="customize.plan = true">{{messages.button_label_customize}}</button>
            </div>
            <div>
                {{messages['plan_description_'+accountPlan.plan]}}
                <div v-if="networkType === 'fork'"><hr/>{{messages.message_plan_fork_apps}}</div>
                <div v-else-if="selectedPlan && selectedPlan.apps && selectedPlan.apps.length > 0">
                    <div v-if="typeof selectedPlan.maxAccounts !== 'undefined' && selectedPlan.maxAccounts !== null && selectedPlan.maxAccounts === 1">&bullet; {{messages.message_plan_max_accounts_one}}</div>
                    <div v-else-if="typeof selectedPlan.maxAccounts !== 'undefined' && selectedPlan.maxAccounts !== null && selectedPlan.maxAccounts > 1">&bullet; {{messages.message_plan_max_accounts_multiple.parseExpression({max: selectedPlan.maxAccounts})}}</div>
                    <div v-else>&bullet; {{messages.message_plan_no_max_accounts}}</div>
                    &bullet; {{messages.message_plan_node_apps}}
                    <div v-for="app in selectedPlan.apps">
                        <hr/>
                        <h5><img width="64" v-if="icons && icons[app.name]" :src="icons[app.name]"/>{{messages['app_'+app.name+'_name']}}</h5>
                        <div v-if="messages['!app_'+app.name+'_summary']"><h6><b>{{messages['app_'+app.name+'_summary']}}</b></h6></div>
                        <p>{{messages['app_'+app.name+'_description']}}</p>
                    </div>
                </div>
            </div>
            <hr/>

            <!-- domain -->
            <div v-if="customize.domain === true" class="form-group">
                <label for="domain">{{messages.field_label_network_domain}}</label>
                <select v-validate="'required'" v-if="domains" v-model="accountPlan.domain" name="domain" class="form-control" :class="{ 'is-invalid': submitted && errors.has('domain') }">
                    <option v-for="domain in domains" :value="domain.name">{{domain.name}}</option>
                </select>
                <div v-if="submitted && errors.has('domain')" class="invalid-feedback d-block">{{ errors.first('domain') }}</div>
                <button @click="customize.domain = false">{{messages.button_label_use_default}}</button>
            </div>
            <div v-if="customize.domain === false">
                {{messages.field_label_network_domain}}:
                <span v-if="defaults.domain">{{defaults.domain}}</span>
                <span v-else v-html="messages.message_auto_detecting"></span>
                <button @click="customize.domain = true">{{messages.button_label_customize}}</button>
            </div>
            <hr/>

            <!-- cloud+region -->
            <div v-if="customize.region === true" class="form-group">
                <label htmlFor="region">{{messages.field_label_region}}</label>
                <select name="region" v-validate="'required'" v-model="cloudRegionUuid" v-if="regions" class="form-control" :class="{ 'is-invalid': submitted && errors.has('region') }">
                    <option v-for="region in regions" :value="region.uuid">{{region.name}} {{regionDistance(region.uuid)}}</option>
                </select>

                <label for="flexRegion"><b>{{messages.field_label_flex_region}}</b></label>
                <input type="checkbox" name="exactRegion" v-model="flexRegion"/>
                <p v-if="flexRegion">{{messages.field_label_flex_region_description}}</p>
                <p v-else>{{messages.field_label_exact_region_description}}</p>

                <div v-if="submitted && errors.has('region')" class="invalid-feedback d-block">{{ errors.first('region') }}</div>
                <button @click="customize.region = false">{{messages.button_label_use_default}}</button>
            </div>
            <div v-if="customize.region === false">
                {{messages.field_label_region}}:
                <span v-if="defaults.region">{{defaults.region.name}} (~{{parseInt(defaults.region.distance/1000)}} {{messages.msg_km_distance_away}})</span>
                <span v-else v-html="messages.message_auto_detecting"></span>
                <button @click="customize.region = true">{{messages.button_label_customize}}</button>
            </div>
            <hr/>

            <!-- locale -->
            <div v-if="customize.locale === true" class="form-group">
                <label htmlFor="locale">{{messages.field_label_locale}}</label>
                <select v-validate="'required'" v-if="locales" v-model="accountPlan.locale" name="locale" class="form-control" :class="{ 'is-invalid': submitted && errors.has('locale') }">
                    <option v-for="locale in locales" :value="locale.localeCode">{{messages['locale_'+locale.localeCode]}}</option>
                </select>
                <div v-if="submitted && errors.has('locale')" class="invalid-feedback d-block">{{ errors.first('locale') }}</div>
                <button @click="customize.locale = false">{{messages.button_label_use_default}}</button>
            </div>
            <div v-if="customize.locale === false">
                {{messages.field_label_locale}}:
                <span v-if="defaults.locale">{{messages['locale_'+defaults.locale]}}</span>
                <span v-else v-html="messages.message_auto_detecting"></span>
                <button @click="customize.locale = true">{{messages.button_label_customize}}</button>
            </div>
            <hr/>

            <!-- timezone -->
            <div v-if="customize.timezone === true" class="form-group">
                <label htmlFor="timezone">{{messages.field_label_timezone}}</label>
                <v-select v-validate="'required'" :options="timezoneObjects" :reduce="tz => tz.timezoneId" label="timezoneDescription" type="text" v-model="accountPlan.timezone" name="timezone" class="form-control" :class="{ 'is-invalid': submitted && errors.has('timezone') }"></v-select>
                <div v-if="submitted && errors.has('timezone')" class="invalid-feedback d-block">{{ errors.first('timezone') }}</div>
                <button @click="customize.timezone = false">{{messages.button_label_use_default}}</button>
            </div>
            <div v-if="customize.timezone === false">
                {{messages.field_label_timezone}}:
                <span v-if="defaults.timezone">{{tzDescription(defaults.timezone)}}</span>
                <span v-else v-html="messages.message_auto_detecting"></span>
                <button @click="customize.timezone = true">{{messages.button_label_customize}}</button>
            </div>
            <hr/>

            <!-- footprint -->
            <div v-if="customize.footprint === true" class="form-group">
                <label htmlFor="footprint">{{messages.field_label_footprint}}</label>
                <select v-validate="'required'" v-if="footprintObjects" v-model="accountPlan.footprint" name="footprint" @change="refreshCloudRegions()" class="form-control" :class="{ 'is-invalid': submitted && errors.has('footprint') }">
                    <option v-for="footprint in footprintObjects" :value="footprint.name">{{messages['footprint_name_'+footprint.name]}}</option>
                </select>
                <div v-if="submitted && errors.has('footprint')" class="invalid-feedback d-block">{{ errors.first('footprint') }}</div>
                <button @click="customize.footprint = false">{{messages.button_label_use_default}}</button>
            </div>
            <div v-if="customize.footprint === false">
                {{messages.field_label_footprint}}:
                <span v-if="defaults.footprint">{{messages['footprint_name_'+defaults.footprint]}}</span>
                <span v-else v-html="messages.message_auto_detecting"></span>
                <button @click="customize.footprint = true">{{messages.button_label_customize}}</button>
            </div>
            <div>
                {{messages['footprint_description_'+accountPlan.footprint]}}
            </div>
            <hr/>

            <!-- SSH key -->
            <div v-if="customize.sshKey === true" class="form-group">
                <label for="sshKey">{{messages.field_label_network_ssh_key}}</label>
                <select v-validate="'required'" v-if="sshKeys" v-model="accountPlan.sshKey" name="sshKey" class="form-control" :class="{ 'is-invalid': submitted && errors.has('sshPublicKey') }">
                    <option v-for="key in sshKeyObjects" :value="key.value">{{key.name}}</option>
                </select>
                <div v-if="submitted && errors.has('sshPublicKey')" class="invalid-feedback d-block">{{ errors.first('sshPublicKey') }}</div>
                <button @click="customize.sshKey = false">{{messages.button_label_use_default}}</button>
                <router-link to="/me/keys">{{messages.link_label_account_ssh_keys}}</router-link>
            </div>
            <div v-if="customize.sshKey === false">
                {{messages.field_label_network_ssh_key}}:
                <span>{{messages.message_network_ssh_key_do_not_install}}</span>
                <button @click="customize.sshKey = true">{{messages.button_label_customize}}</button>
            </div>
            <div>{{messages.field_description_network_ssh_key}}</div>
            <hr/>

            <!-- sync password -->
            <div class="form-group">
                <label for="syncPassword">{{messages.field_label_sync_password}}</label>
                <input type="checkbox" id="syncPassword" v-model="accountPlan.syncPassword">
                <div v-if="submitted && errors.has('syncPassword')" class="invalid-feedback d-block">{{ errors.first('syncPassword') }}</div>
                <p>{{messages.field_label_sync_password_description}}</p>
            </div>
            <!-- launch lock -->
            <div class="form-group" v-if="networkType !== 'fork'">
                <label for="launchLock">{{messages.field_label_launch_lock}}</label>
                <input type="checkbox" id="launchLock" v-model="accountPlan.launchLock">
                <div v-if="submitted && errors.has('launchLock')" class="invalid-feedback d-block">{{ errors.first('launchLock') }}</div>
                <p>{{messages.field_label_launch_lock_description}}</p>
            </div>
            <!-- error reporting -->
            <div class="form-group" v-if="configs.requireSendMetrics && configs.requireSendMetrics !== true">
                <label for="sendErrors">{{messages.field_label_send_errors}}</label>
                <input type="checkbox" id="sendErrors" v-model="accountPlan.sendErrors">
                <div v-if="submitted && errors.has('sendErrors')" class="invalid-feedback d-block">{{ errors.first('sendErrors') }}</div>
                <p>{{messages.field_label_send_errors_description}}</p>
            </div>
            <!-- metrics reporting -->
            <div class="form-group" v-if="configs.requireSendMetrics && configs.requireSendMetrics !== true">
                <label for="sendMetrics">{{messages.field_label_send_metrics}}</label>
                <input type="checkbox" id="sendMetrics" v-model="accountPlan.sendMetrics">
                <div v-if="submitted && errors.has('sendMetrics')" class="invalid-feedback d-block">{{ errors.first('sendMetrics') }}</div>
                <p>{{messages.field_label_send_metrics_description}}</p>
            </div>
            <hr/>

            <!-- payment -->
            <div v-if="configs && configs.paymentsEnabled && payMethods && payMethods.length && payMethods.length > 1 && typeof accountPayMethods !== 'undefined' && accountPayMethods !== null && accountPayMethods.length > 1">
                <div v-if="submitted && errors.has('purchase')" class="invalid-feedback d-block">{{ errors.first('purchase') }}</div>

                <div class="form-group">
                    <div>
                        <h5>{{messages.field_label_existingPaymentMethod}}</h5>
                        <div v-for="apm in accountPayMethods">
                            <!-- show existing payment method as selected -->
                            <button v-if="accountPlan.paymentMethodObject.uuid === apm.uuid" class="btn btn-success" :disabled="loading()">{{messages['payment_method_'+apm.paymentMethodType]}}: {{apm.maskedPaymentInfo}}</button>
                            <button v-else class="btn btn-primary" :disabled="loading()" @click="setAccountPaymentMethod(apm)">{{messages['payment_method_'+apm.paymentMethodType]}}: {{apm.maskedPaymentInfo}}</button>
                        </div>
                        <hr/>
                    </div>
                </div>
            </div>

            </div>  <!-- end showAdvanced -->
            <div v-else>
                <table border="0">
                    <tr>
                        <td>{{messages.field_label_plan}}:</td>
                        <td>{{selectedPlanName}}<span v-if="messages && selectedPlan && selectedPlan.currency"> - {{messages.price_format.parseExpression({messages: messages, ...selectedPlan})}}</span></td>
                    </tr>
                    <tr>
                        <td>{{messages.field_label_network_name}}:</td>
                        <td>{{accountPlan.name}}</td>
                    </tr>
                    <tr>
                        <td>{{messages.field_label_region}}:</td>
                        <td>{{findRegionName(cloudRegionUuid)}} {{regionDistance(cloudRegionUuid)}}</td>
                    </tr>
                    <tr>
                        <td>{{messages.field_label_locale}}:</td>
                        <td>{{messages['locale_'+accountPlan.locale]}}</td>
                    </tr>
                    <tr>
                        <td>{{messages.field_label_timezone}}:</td>
                        <td>{{tzDescription(accountPlan.timezone)}}</td>
                    </tr>
                </table>
            </div>

            <div v-if="!showForkOption">
                <label for="showAdvanced"><b>{{messages.field_label_show_advanced_plan_options}}</b></label>
                <input type="checkbox" name="showAdvanced" v-model="showAdvanced"/>
                <hr/>
            </div>

            <div class="form-group">
                <button class="btn btn-primary" :disabled="loading() || !isComplete" @click="launchBubble()">{{messages.button_label_create_new_network}}</button>
                <img v-show="loading()" :src="loadingImgSrc" />
            </div>
        </form>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex'
    import { util } from '~/_helpers'
    import { loadingImgSrc } from '~/_store';

    // convenience methods
    import { isAuthenticator, isNotAuthenticator } from '~/_store/users.module';
    window.isAuthenticator = isAuthenticator;
    window.isNotAuthenticator = isNotAuthenticator;

    export default {
        data() {
            return {
                user: util.currentUser(),
                inboundAction: null,
                showAdvanced: false,
                accountPlan: {
                    name: '',
                    domain: '',
                    locale: util.currentUser().locale,
                    timezone: '',
                    plan: 'bubble',
                    footprint: 'Worldwide',
                    paymentMethodObject: {
                        uuid: null,
                        paymentMethodType: null,
                        paymentInfo: null
                    },
                    sshKey: '',
                    forkHost: '',
                    syncPassword: true,
                    launchLock: false,
                    sendErrors: true,
                    sendMetrics: true
                },
                networkType: 'bubble',
                cloudRegionUuid: null,
                regions: [],
                customize: {
                    domain: false,
                    locale: false,
                    timezone: false,
                    plan: false,
                    footprint: false,
                    region: false,
                    sshKey: false
                },
                defaults: {
                    domain: '',
                    locale: 'en_US',
                    timezone: '',
                    plan: 'bubble',
                    footprint: 'Worldwide',
                    region: '',
                    sshKey: ''
                },
                flexRegion: true,
                submitted: false,
                status: {
                    creating: false
                },
                verifiedContacts: null,
                verifiedContactRefresher: null,
                anyContacts: null,
                firstContact: null,
                payMethods: null,
                accountPayMethods: null,
                selectedPaymentMethod: null,
                loadingImgSrc: loadingImgSrc
            };
        },
        computed: {
            ...mapState('system', ['messages', 'locales', 'timezones', 'detectedTimezone', 'detectedLocale', 'configs']),
            ...mapState('domains', ['domains']),
            ...mapState('plans', ['plans']),
            ...mapState('apps', ['icons']),
            ...mapState('footprints', ['footprints']),
            ...mapState('paymentMethods', [
                'paymentMethods', 'accountPaymentMethods', 'accountPaymentMethod', 'paymentMethod', 'paymentInfo', 'promos'
            ]),
            ...mapState('networks', ['nearestRegions', 'newNodeNotification']),
            ...mapState('networks', {
                error: state => state.error
            }),
            ...mapState('users', ['policy', 'sshKeys']),
            ...mapState('account', ['actionStatus']),
            showForkOption () {
                return this.configs && this.configs.sageLauncher && this.configs.sageLauncher === true
                    && this.user && this.user.admin === true;
            },
            isComplete() {
                return (this.accountPlan.name !== '' || this.accountPlan.forkHost !== '')
                    && (this.customize.domain === false || this.accountPlan.domain !== '')
                    && (this.customize.locale === false || this.accountPlan.locale !== '')
                    && (this.customize.timezone === false || this.accountPlan.timezone !== '')
                    && (this.customize.plan === false || this.accountPlan.plan !== '')
                    && (this.customize.footprint === false || this.accountPlan.footprint !== '')
                    && (
                        (this.accountPlan.paymentMethodObject.paymentMethodType != null) && (this.accountPlan.paymentMethodObject.paymentInfo != null)
                        || (this.accountPlan.paymentMethodObject.uuid != null)
                    );
            },
            timezoneObjects: function () {
                const tz_objects = [];
                for (let i=0; i<this.timezones.length; i++) {
                    tz_objects.push({
                        timezoneId: this.timezones[i],
                        timezoneDescription: this.tzDescription(this.timezones[i])
                    })
                }
                return tz_objects;
            },
            planObjects: function () {
                const plans_array = [];
                if (this.plans) {
                    for (let i = 0; i < this.plans.length; i++) {
                        plans_array.push({
                            ...this.plans[i],
                            localName: this.messages['plan_name_' + this.plans[i].name],
                            description: this.messages['plan_description_' + this.plans[i].name],
                            priceMajorUnits: this.plans[i].price / 100,
                            priceMinorUnits: this.plans[i].price % 100
                        })
                    }
                }
                return plans_array;
            },
            selectedPlan: function () {
                return this.accountPlan && this.accountPlan.plan ? this.findPlan(this.accountPlan.plan) : null;
            },
            selectedPlanName: function () {
                const splan = this.selectedPlan;
                return splan === null ? null : this.messages['plan_name_'+splan.name];
            },
            footprintObjects: function () {
                const fp_array = [];
                if (this.footprints) {
                    for (let i = 0; i < this.footprints.length; i++) {
                        fp_array.push({
                            ...this.footprints[i],
                            localName: this.messages['footprint_name_' + this.footprints[i].name],
                            description: this.messages['footprint_description_' + this.footprints[i].name]
                        })
                    }
                }
                return fp_array;
            },
            sshKeyObjects: function () {
                if (this.sshKeys) {
                    const keyObjects = [];
                    keyObjects.push({name: this.messages.message_network_ssh_key_do_not_install, value: ''});
                    for (let i=0; i<this.sshKeys.length; i++) {
                        keyObjects.push({name: this.sshKeys[i].name, value: this.sshKeys[i].name});
                    }
                    return keyObjects;
                }
            }
        },
        methods: {
            ...mapActions('users', ['getPolicyByUserId', 'listSshKeysByUserId']),
            ...mapActions('account', ['approveAction', 'resendVerificationCode']),
            ...mapActions('system', ['detectTimezone', 'detectLocale', 'loadMessages']),
            ...mapActions('networks', ['getNearestRegions', 'addPlanAndStartNetwork']),
            ...mapGetters('networks', ['loading']),
            ...mapActions('domains', ['getAllDomains']),
            ...mapActions('plans', ['getAllPlans']),
            ...mapActions('apps', ['getAppsByUserId']),
            ...mapActions('footprints', ['getAllFootprints']),
            ...mapActions('paymentMethods', [
                'getAllPaymentMethods', 'getAllAccountPaymentMethods', 'setPaymentMethod', 'getPromosByAccount'
            ]),

            initDefaults() {
                const currentUser = util.currentUser();
                const selectedLocale = (currentUser !== null && typeof currentUser.locale !== 'undefined' && currentUser.locale !== null ? currentUser.locale : 'detect');
                this.accountPlan.name = currentUser.email.split("@")[0];
                this.loadMessages('post_auth', selectedLocale);
                this.loadMessages('apps', selectedLocale);
                this.getPolicyByUserId({userId: currentUser.uuid, messages: this.messages, errors: this.errors});
                this.detectTimezone();
                this.detectLocale();
                this.getAllDomains({userId: currentUser.uuid, messages: this.messages, errors: this.errors});
                this.getAllPlans(this.messages, this.errors);
                this.getAppsByUserId({userId: currentUser.uuid, messages: this.messages, errors: this.errors});
                this.getAllFootprints({userId: currentUser.uuid, messages: this.messages, errors: this.errors});
                this.getAllPaymentMethods(this.messages, this.errors);
                this.getAllAccountPaymentMethods({userId: currentUser.uuid, messages: this.messages, errors: this.errors});
                this.listSshKeysByUserId({userId: currentUser.uuid, messages: this.messages, errors: this.errors});
                this.getNearestRegions({footprintId: null, messages: this.messages, errors: this.errors});
                this.getPromosByAccount({userId: currentUser.uuid, messages: this.messages, errors: this.errors});
            },
            isAuthenticator(val) { return window.isAuthenticator(val); },
            isNotAuthenticator(val) { return window.isNotAuthenticator(val); },
            hasVerifiedContact(policy) {
                if (policy && policy.accountContacts) {
                    const contacts = policy.accountContacts;
                    for (let i=0; i<contacts.length; i++) {
                        if (contacts[i].verified && isNotAuthenticator(contacts[i])) return true;
                    }
                    return false;
                }
                return false;
            },
            hasAnyContacts(policy) {
                if (policy && policy.accountContacts) {
                    const contacts = policy.accountContacts;
                    for (let i=0; i<contacts.length; i++) {
                        if (isNotAuthenticator(contacts[i])) return true;
                    }
                    return false;
                }
                return false;
            },
            getFirstContact(policy) {
                if (policy && policy.accountContacts) {
                    const contacts = policy.accountContacts;
                    for (let i=0; i<contacts.length; i++) {
                        if (isNotAuthenticator(contacts[i])) return contacts[i];
                    }
                    return null;
                }
                return null;
            },
            submitVerification() {
                const codeElementId = 'verifyContactCode';
                const codeElement = document.getElementById(codeElementId);
                if (codeElement != null) {
                    const code = codeElement.value;
                    if (code === null || code === '') return;
                    this.errors.clear();
                    this.approveAction({
                        userId: util.currentUser().uuid,
                        code: code,
                        data: null,
                        messages: this.messages,
                        errors: this.errors
                    });
                } else {
                    console.log('submitVerification: DOM element not found: '+codeElementId);
                }
            },
            resendVerification(contact) {
                this.resendVerificationCode({
                    userId: util.currentUser().uuid,
                    contact: contact,
                    messages: this.messages,
                    errors: this.errors
                });
                return false; // do not follow the click
            },
            tzDescription(tz) {
                return this.messages['tz_name_'+tz] + " - " + this.messages['tz_description_'+tz]
            },
            findRegion(uuid) {
                if (this.regions) {
                    for (let i = 0; i < this.regions.length; i++) {
                        if (this.regions[i].uuid === uuid) return this.regions[i];
                    }
                }
                if (uuid !== null) console.log('findRegion: uuid not found: '+uuid);
                return null;
            },
            findRegionName(uuid) {
                const region = this.findRegion(uuid);
                return region !== null && typeof region.name !== 'undefined' ? region.name : null;
            },
            regionDistance (uuid) {
                const region = this.findRegion(uuid);
                if (region === null) return null;
                return "(~"+parseInt(region.distance/1000)+" "+this.messages.msg_km_distance_away+")";
            },
            findPlan(name) {
                const plans = this.planObjects;
                if (plans) {
                    for (let i=0; i<plans.length; i++) {
                        if (plans[i].name === name) return plans[i];
                    }
                }
                return null;
            },
            refreshCloudRegions() {
                this.getNearestRegions({footprintId: this.accountPlan.footprint, messages: this.messages, errors: this.errors});
            },
            setAccountPaymentMethod (apm) {
                this.accountPlan.paymentMethodObject = {
                    uuid: apm.uuid,
                    paymentMethodType: null,
                    paymentInfo: null
                };
                return false;
            },
            launchBubble () {
                this.submitted = true;
                this.errors.clear();
                this.$validator.validate().then(valid => {
                    if (valid) {
                        if (this.paymentInfo || this.accountPlan.paymentMethodObject.uuid) {
                            const cloudRegion = this.findRegion(this.cloudRegionUuid);
                            if (cloudRegion === null) {
                                this.errors.add({field: 'region', msg: this.messages['err_region_notFound']});
                            } else {
                                if (this.configs.requireSendMetrics) {
                                    this.accountPlan.sendErrors = true;
                                    this.accountPlan.sendMetrics = true;
                                } else {
                                    if (this.accountPlan.sendErrors === null) this.accountPlan.sendErrors = true;
                                    if (this.accountPlan.sendMetrics === null) this.accountPlan.sendMetrics = true;
                                }
                                this.addPlanAndStartNetwork({
                                    userId: this.user.uuid,
                                    accountPlan: this.accountPlan,
                                    cloud: cloudRegion.cloud,
                                    region: cloudRegion.internalName,
                                    exactRegion: !this.flexRegion,
                                    messages: this.messages,
                                    errors: this.errors
                                });
                            }
                        }
                    }
                });
            },
            handleSubmit(e) {}
        },
        watch: {
            domains (doms) {
                if (doms && doms[0]) {
                    if (this.accountPlan.domain == null || this.accountPlan.domain === '') this.accountPlan.domain = doms[0].name;
                    this.defaults.domain = doms[0].name;
                }
            },
            detectedTimezone (tz) {
                if (tz && tz.timeZoneId) {
                    if (this.accountPlan.timezone == null || this.accountPlan.timezone === '') this.accountPlan.timezone = tz.timeZoneId;
                    if (this.defaults.timezone == null || this.defaults.timezone === '') this.defaults.timezone = tz.timeZoneId;
                }
            },
            detectedLocale (loc) {
                if (loc) {
                    if (this.accountPlan.locale === null || this.accountPlan.locale === '') this.accountPlan.locale = loc;
                    this.defaults.locale = loc;
                }
            },
            nearestRegions (regions) {
                if (regions) {
                    this.regions = regions;
                    if (this.cloudRegionUuid === null || (typeof regions.find(r => r.uuid  === this.cloudRegionUuid) === 'undefined')) {
                        this.cloudRegionUuid = regions[0].uuid;
                    }
                    if (this.defaults.region === '' || (typeof regions.find(r => r.uuid  === this.defaults.region.uuid) === 'undefined')) {
                        this.defaults.region = regions[0];
                    }
                }
            },
            paymentMethods (pms) {
                if (pms && pms.length) {
                    const okMethods = [];
                    for (let i=0; i<pms.length; i++) {
                        const pm = pms[i];
                        if (!pm.driverClass.endsWith('NoopCloud')) {
                            okMethods.push(pm);
                        }
                    }
                    if (okMethods.length === 1) {
                        this.selectedPaymentMethod = okMethods[0];
                        this.setPaymentMethod(okMethods[0]);
                    }
                    this.payMethods = okMethods;
                }
            },
            accountPaymentMethods (pms) {
                if (pms) {
                    const payMethods = [];
                    for (let i=0; i<pms.length; i++) {
                        const pm = pms[i];
                        if ((typeof pm.promotion === 'undefined' || pm.promotion === null || !pm.promotion)
                            && (typeof pm.deleted === 'undefined' || pm.deleted === null)) {
                            payMethods.push(pm);
                        }
                    }
                    this.accountPayMethods = payMethods;
                    if (this.accountPlan.paymentMethodObject.uuid === null && payMethods.length > 0) {
                        this.setAccountPaymentMethod(payMethods[0]);
                    }
                }
            },
            paymentMethod (pm) {
                if (pm) {
                    this.selectedPaymentMethod = pm;
                    if (this.accountPlan.paymentMethodObject.uuid === null) {
                        this.accountPlan.paymentMethodObject.paymentMethodType = pm.paymentMethodType;
                        this.accountPlan.paymentMethodObject.paymentInfo = null;
                        this.accountPlan.paymentMethodObject.uuid = null;
                    }
                }
            },
            paymentInfo (info) {
                if (info) {
                    this.accountPlan.paymentMethodObject.paymentInfo = info;
                }
            },
            accountPaymentMethod (apm) {
                if (apm) {
                    this.accountPlan.paymentMethodObject.uuid = apm.uuid;
                    this.accountPlan.paymentMethodObject.paymentMethodType = null;
                    this.accountPlan.paymentMethodObject.paymentInfo = null;
                }
            },
            policy (p) {
                this.anyContacts = this.hasAnyContacts(p);
                this.verifiedContacts = this.hasVerifiedContact(p);
                this.firstContact = this.getFirstContact(p);
                if (!this.verifiedContacts) {
                    if (this.verifiedContactRefresher === null) {
                        const vue = this;
                        const currentUser = util.currentUser();
                        this.verifiedContactRefresher = window.setInterval(() => {
                            vue.getPolicyByUserId({userId: currentUser.uuid, messages: vue.messages, errors: vue.errors});
                        }, 5000);
                    }
                } else {
                    if (this.verifiedContactRefresher !== null) {
                        window.clearInterval(this.verifiedContactRefresher);
                        this.verifiedContactRefresher = null;
                    }
                }
            },
            actionStatus (status) {
                if (status.success) {
                    this.initDefaults();
                }
            },
            newNodeNotification (nn) {
                if (nn && nn.uuid) {
                    this.$router.push({path:'/bubble/'+nn.networkName});
                    this.submitted = false;
                }
            },
            plans (p) {
                if (p) {
                    if (this.user && this.user.preferredPlan) {
                        const plans = this.planObjects;
                        if (plans) {
                            for (let i=0; i<plans.length; i++) {
                                if (plans[i].uuid === this.user.preferredPlan) {
                                    this.defaults.plan = plans[i].name;
                                    this.accountPlan.plan = plans[i].name;
                                }
                            }
                        }
                    }
                }
            }
        },
        created() {
            this.inboundAction = util.setInboundAction(this.$route);
            this.initDefaults();
            const vue = this;
            window.setTimeout(() => { vue.inboundAction = null; }, 5000)
        }
    };
</script>