<template>
    <div>
        <h2>{{messages.form_title_new_network}}</h2>

        <div v-if="!anyContacts && !user.admin">
            <h3>{{messages.message_no_contacts}}</h3>
            <router-link v-if="!anyContacts" to="/me/policy">{{messages.link_label_no_contacts}}</router-link>
        </div>
        <div v-else-if="!verifiedContacts && !user.admin">
            <h3>{{messages.message_no_verified_contacts}}</h3>
            {{messages.message_no_verified_contacts_subtext}}
            <table border="1">
                <tr>
                    <td v-if="typeof firstContact.nick !== 'undefined' && firstContact.nick !== null && firstContact.nick !== ''">
                        {{firstContact.nick}}
                    </td>
                    <td>{{messages['field_label_policy_contact_type_'+firstContact.type]}}</td>
                    <td>{{firstContact.info}}</td>
                    <td>
                        <form @submit.prevent="submitVerification()">
        <label htmlFor="verifyCode">{{messages.field_label_policy_contact_verify_code}}</label>
        <input :disabled="actionStatus.requesting" :id="'verifyContactCode'" v-validate="'required'" name="verifyCode" type="text" size="8"/>
        <div v-if="errors.has('token')" class="invalid-feedback d-block">{{ errors.first('token') }}</div>
        <button class="btn btn-primary" :disabled="actionStatus.requesting">{{messages.button_label_submit_verify_code}}</button>
        <button class="btn btn-primary" :disabled="actionStatus.requesting" @click="resendVerification(firstContact)">{{messages.button_label_resend_verify_code}}</button>
                        </form>
                    </td>
                </tr>
            </table>
        </div>
        <div v-else>
        <form @submit.prevent="handleSubmit">

            <div v-if="configs && configs.sageLauncher && configs.sageLauncher === true && user && user.admin === true">
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
                    <div v-if="submitted && errors.has('forkHost')" class="invalid-feedback">{{ errors.first('forkHost') }}</div>
                    {{messages.field_description_network_fork_host}}
                </div>
                <!-- OR, name -->
                <div v-else class="form-group">
                    <label for="name">{{messages.field_label_network_name}}</label>
                    <input type="text" v-model="accountPlan.name" v-validate="'required'" name="name" class="form-control" :class="{ 'is-invalid': submitted && errors.has('name') }" />
                    <div v-if="submitted && errors.has('name')" class="invalid-feedback">{{ errors.first('name') }}</div>
                </div>
            </div>
            <!-- name -->
            <div v-else class="form-group">
                <label for="name">{{messages.field_label_network_name}}</label>
                <input type="text" v-model="accountPlan.name" v-validate="'required'" name="name" class="form-control" :class="{ 'is-invalid': submitted && errors.has('name') }" />
                <div v-if="submitted && errors.has('name')" class="invalid-feedback">{{ errors.first('name') }}</div>
            </div>

            <!-- plan -->
            <div v-if="customize.plan === true" class="form-group">
                <label htmlFor="plan">{{messages.field_label_plan}}</label>
                <select v-validate="'required'" v-if="planObjects" v-model="accountPlan.plan" name="plan" class="form-control" :class="{ 'is-invalid': submitted && errors.has('plan') }">
                    <option v-for="plan in planObjects" :value="plan.name">{{messages['plan_name_'+plan.name]}}</option>
                </select>
                <div v-if="submitted && errors.has('plan')" class="invalid-feedback">{{ errors.first('plan') }}</div>
                <button @click="customize.plan = false">{{messages.button_label_use_default}}</button>
            </div>
            <div v-if="customize.plan === false">
                {{messages.field_label_plan}}:
                <span v-if="defaults.plan">{{messages['plan_name_'+defaults.plan]}}</span>
                <span v-else v-html="messages.message_auto_detecting"></span>
                <button @click="customize.plan = true">{{messages.button_label_customize}}</button>
            </div>
            <div>
                {{messages['plan_description_'+accountPlan.plan]}}
            </div>
            <hr/>

            <!-- domain -->
            <div v-if="customize.domain === true" class="form-group">
                <label for="domain">{{messages.field_label_network_domain}}</label>
                <select v-validate="'required'" v-if="domains" v-model="accountPlan.domain" name="domain" class="form-control" :class="{ 'is-invalid': submitted && errors.has('domain') }">
                    <option v-for="domain in domains" :value="domain.name">{{domain.name}}</option>
                </select>
                <div v-if="submitted && errors.has('domain')" class="invalid-feedback">{{ errors.first('domain') }}</div>
                <button @click="customize.domain = false">{{messages.button_label_use_default}}</button>
            </div>
            <div v-if="customize.domain === false">
                {{messages.field_label_network_domain}}:
                <span v-if="defaults.domain">{{defaults.domain}}</span>
                <span v-else v-html="messages.message_auto_detecting"></span>
                <button @click="customize.domain = true">{{messages.button_label_customize}}</button>
            </div>
            <hr/>

            <div>
                <label for="showAdvanced">{{messages.field_label_show_advanced_plan_options}}</label>
                <input type="checkbox" name="showAdvanced" v-model="showAdvanced"/>
            </div>
            <hr/>

            <div v-if="showAdvanced">

            <!-- cloud+region -->
            <div v-if="customize.region === true" class="form-group">
                <label htmlFor="region">{{messages.field_label_region}}</label>
                <select name="region" v-validate="'required'" v-model="cloudRegionUuid" v-if="regions" class="form-control" :class="{ 'is-invalid': submitted && errors.has('region') }">
                    <option v-for="region in regions" :value="region.uuid">{{region.name}} (~{{parseInt(region.distance/1000)}} {{messages.msg_km_distance_away}})</option>
                </select>
                <div v-if="submitted && errors.has('region')" class="invalid-feedback">{{ errors.first('region') }}</div>
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
                <div v-if="submitted && errors.has('locale')" class="invalid-feedback">{{ errors.first('locale') }}</div>
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
                <div v-if="submitted && errors.has('timezone')" class="invalid-feedback">{{ errors.first('timezone') }}</div>
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
                <div v-if="submitted && errors.has('footprint')" class="invalid-feedback">{{ errors.first('footprint') }}</div>
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
                <div v-if="submitted && errors.has('sshPublicKey')" class="invalid-feedback">{{ errors.first('sshPublicKey') }}</div>
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

            </div>  <!-- end showAdvanced -->
            <div v-else>

            </div>

            <!-- payment -->
            <div class="form-group">
                <label htmlFor="paymentMethod">{{messages.field_label_paymentMethod}}</label>
                <div v-if="typeof paymentMethods === 'undefined' || paymentMethods === null || paymentMethods.length === 0" class="invalid-feedback d-block">
                    <h5>{{messages.err_noPaymentMethods}}</h5>
                </div>
                <span v-for="pm in paymentMethods">
                    <button class="btn btn-primary" :disabled="status.loading" @click="setPaymentMethod(pm)">{{messages['payment_description_'+pm.paymentMethodType]}}</button>
                </span>
            </div>

            <div v-if="selectedPaymentMethod !== null && selectedPaymentMethod.paymentMethodType === 'credit'">
                <router-view name="pay_stripe" v-if="selectedPaymentMethod.driverClass.endsWith('StripePaymentDriver')"></router-view>
                <router-view name="pay_unknown" v-else></router-view>
            </div>
            <div v-else-if="selectedPaymentMethod !== null && selectedPaymentMethod.paymentMethodType === 'code'">
                <router-view name="pay_invite" v-if="selectedPaymentMethod.driverClass.endsWith('CodePaymentDriver')"></router-view>
                <router-view name="pay_unknown" v-else></router-view>
            </div>
            <div v-else-if="selectedPaymentMethod !== null && selectedPaymentMethod.paymentMethodType === 'free'">
                <router-view name="pay_free" v-if="selectedPaymentMethod.driverClass.endsWith('FreePaymentDriver')"></router-view>
                <router-view name="pay_unknown" v-else></router-view>
            </div>
            <div v-else-if="selectedPaymentMethod !== null">
                <router-view name="pay_unknown"></router-view>
            </div>
            <hr/>

            <div class="form-group">
                <button class="btn btn-primary" :disabled="status.loading || !isComplete">{{messages.button_label_create_new_network}}</button>
                <img v-show="status.loading" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>
        </form>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex'
    import { util } from '../_helpers'

    // convenience methods
    import { isAuthenticator, isNotAuthenticator } from '../_store/users.module';
    window.isAuthenticator = isAuthenticator;
    window.isNotAuthenticator = isNotAuthenticator;

    export default {
        data() {
            return {
                user: util.currentUser(),
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
                    forkHost: ''
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
                submitted: false,
                status: {
                    creating: false
                },
                verifiedContacts: false,
                anyContacts: false,
                firstContact: null,
                selectedPaymentMethod: null
            };
        },
        computed: {
            ...mapState('system', ['messages', 'locales', 'timezones', 'detectedTimezone', 'detectedLocale', 'configs']),
            ...mapState('domains', ['domains']),
            ...mapState('plans', ['plans']),
            ...mapState('footprints', ['footprints']),
            ...mapState('paymentMethods', ['paymentMethods', 'accountPaymentMethod', 'paymentMethod', 'paymentInfo']),
            ...mapState('networks', ['nearestRegions', 'newNodeNotification']),
            ...mapState('networks', {
                error: state => state.error
            }),
            ...mapState('users', ['policy', 'sshKeys']),
            ...mapState('account', ['actionStatus']),
            isComplete() {
                return (this.accountPlan.name !== '')
                    && (this.customize.domain === false || this.accountPlan.domain !== '')
                    && (this.customize.locale === false || this.accountPlan.locale !== '')
                    && (this.customize.timezone === false || this.accountPlan.timezone !== '')
                    && (this.customize.plan === false || this.accountPlan.plan !== '')
                    && (this.customize.footprint === false || this.accountPlan.footprint !== '')
                    && (this.accountPlan.paymentMethodObject.paymentMethodType != null)
                    && (this.accountPlan.paymentMethodObject.paymentInfo != null);
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
                            description: this.messages['plan_description_' + this.plans[i].name]
                        })
                    }
                }
                return plans_array;
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
            ...mapActions('system', ['detectTimezone', 'detectLocale']),
            ...mapActions('networks', ['getNearestRegions', 'addPlanAndStartNetwork']),
            ...mapGetters('networks', ['loading']),
            ...mapActions('domains', ['getAllDomains']),
            ...mapActions('plans', ['getAllPlans']),
            ...mapActions('footprints', ['getAllFootprints']),
            ...mapActions('paymentMethods', ['getAllPaymentMethods', 'setPaymentMethod']),
            initDefaults() {
                const currentUser = util.currentUser();
                this.getPolicyByUserId({userId: currentUser.uuid, messages: this.messages, errors: this.errors});
                this.detectTimezone();
                this.detectLocale();
                this.getAllDomains({userId: currentUser.uuid, messages: this.messages, errors: this.errors});
                this.getAllPlans(this.messages, this.errors);
                this.getAllFootprints({userId: currentUser.uuid, messages: this.messages, errors: this.errors});
                this.getAllPaymentMethods(this.messages, this.errors);
                this.listSshKeysByUserId({userId: currentUser.uuid, messages: this.messages, errors: this.errors});
                this.getNearestRegions({footprintId: null, messages: this.messages, errors: this.errors});
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
                        uuid: util.currentUser().uuid,
                        code: code,
                        messages: this.messages,
                        errors: this.errors
                    });
                } else {
                    console.log('submitVerification: DOM element not found: '+codeElementId);
                }
            },
            resendVerification(contact) {
                this.resendVerificationCode({
                    uuid: util.currentUser().uuid,
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
                console.log('findRegion: uuid not found: '+uuid);
                return null;
            },
            refreshCloudRegions() {
                this.getNearestRegions({footprintId: this.accountPlan.footprint, messages: this.messages, errors: this.errors});
            },
            handleSubmit(e) {
                this.submitted = true;
                this.$validator.validate().then(valid => {
                    if (valid) {
                        if (this.paymentInfo) {
                            const cloudRegion = this.findRegion(this.cloudRegionUuid);
                            if (cloudRegion === null) {
                                console.log('no region selected'); // todo: set error
                            } else {
                                console.log('sending accountPlan: ' + JSON.stringify(this.accountPlan) + ' cloud/region=' + cloudRegion.cloud + '/' + cloudRegion.internalName);
                                this.addPlanAndStartNetwork({
                                    userId: this.user.uuid,
                                    accountPlan: this.accountPlan,
                                    cloud: cloudRegion.cloud,
                                    region: cloudRegion.internalName,
                                    messages: this.messages,
                                    errors: this.errors
                                });
                            }
                        }
                    }
                });
            }
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
            paymentMethod (pm) {
                if (pm) {
                    this.selectedPaymentMethod = pm;
                    this.accountPlan.paymentMethodObject.paymentMethodType = pm.paymentMethodType;
                    this.accountPlan.paymentMethodObject.paymentInfo = null;
                }
            },
            paymentInfo (info) {
                if (info) {
                    this.accountPlan.paymentMethodObject.paymentInfo = info;
                }
            },
            accountPaymentMethod (apm) {
                if (apm) {
                    this.accountPlan.paymentMethodObject.uuid = apm.uuid
                }
            },
            policy (p) {
                this.anyContacts = this.hasAnyContacts(p);
                this.verifiedContacts = this.hasVerifiedContact(p);
                this.firstContact = this.getFirstContact(p);
            },
            actionStatus (status) {
                if (status.success) {
                    this.initDefaults();
                }
            },
            newNodeNotification (nn) {
                if (nn && nn.uuid) {
                    this.$router.push({path:'/bubble/'+nn.networkName});
                }
            }
        },
        created() {
            this.initDefaults();
        }
    };
</script>