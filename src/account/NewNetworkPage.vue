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
            <!-- name -->
            <div class="form-group">
                <label for="name">{{messages.field_label_network_name}}</label>
                <input type="text" v-model="network.name" v-validate="'required'" name="name" class="form-control" :class="{ 'is-invalid': submitted && errors.has('name') }" />
                <div v-if="submitted && errors.has('name')" class="invalid-feedback">{{ errors.first('name') }}</div>
            </div>

            <!-- domain -->
            <div v-if="customize.domain === true" class="form-group">
                <label for="domain">{{messages.field_label_network_domain}}</label>
                <v-select v-validate="'required'" v-if="domains" :options="domains" label="name" type="text" v-model="network.domain" name="domain" class="form-control" :class="{ 'is-invalid': submitted && errors.has('domain') }"></v-select>
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

            <!-- locale -->
            <div v-if="customize.locale === true" class="form-group">
                <label htmlFor="locale">{{messages.field_label_locale}}</label>
                <v-select v-validate="'required'" v-if="locales" :options="locales" :reduce="locale => locale.localeCode" label="localeName" type="text" v-model="network.locale" name="locale" class="form-control" :class="{ 'is-invalid': submitted && errors.has('locale') }"></v-select>
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
                <v-select v-validate="'required'" :options="timezoneObjects" :reduce="tz => tz.timezoneId" label="timezoneDescription" type="text" v-model="network.timezone" name="timezone" class="form-control" :class="{ 'is-invalid': submitted && errors.has('timezone') }"></v-select>
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

            <!-- plan -->
            <div v-if="customize.plan === true" class="form-group">
                <label htmlFor="plan">{{messages.field_label_plan}}</label>
                <v-select v-validate="'required'" v-if="planObjects" :options="planObjects" :reduce="plan => plan.name" label="localName" type="text" v-model="network.plan" name="plan" class="form-control" :class="{ 'is-invalid': submitted && errors.has('plan') }"></v-select>
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
                {{messages['plan_description_'+network.plan]}}
            </div>
            <hr/>

            <!-- cloud+region -->
            <div v-if="customize.region === true" class="form-group">
                <label htmlFor="region">{{messages.field_label_region}}</label>
                <v-select v-validate="'required'" v-if="regionObjects" :options="regionObjects" :reduce="region => region.cloud+':'+region.internalName" label="name" :value="cloudRegion" type="text" v-model="cloudRegion" name="region" class="form-control" :class="{ 'is-invalid': submitted && errors.has('region') }"></v-select>
                <div v-if="submitted && errors.has('region')" class="invalid-feedback">{{ errors.first('region') }}</div>
                <button @click="customize.region = false">{{messages.button_label_use_default}}</button>
            </div>
            <div v-if="customize.region === false">
                {{messages.field_label_region}}:
                <span v-if="defaults.region">{{defaults.region.name}}</span>
                <span v-else v-html="messages.message_auto_detecting"></span>
                <button @click="customize.region = true">{{messages.button_label_customize}}</button>
            </div>
            <div>
                {{cloudRegion.name}}
            </div>
            <hr/>

            <!-- footprint -->
            <div v-if="customize.footprint === true" class="form-group">
                <label htmlFor="footprint">{{messages.field_label_footprint}}</label>
                <v-select v-validate="'required'" v-if="footprintObjects" :options="footprintObjects" :reduce="footprint => footprint.name" label="name" :value="network.footprint" type="text" v-model="network.footprint" name="footprint" class="form-control" :class="{ 'is-invalid': submitted && errors.has('footprint') }"></v-select>
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
                {{messages['footprint_description_'+network.footprint]}}
            </div>
            <hr/>

            <div class="form-group">
                <label htmlFor="paymentMethod">{{messages.field_label_paymentMethod}}</label>
                <div v-if="typeof paymentMethods === 'undefined' || paymentMethods === null || paymentMethods.length === 0" class="invalid-feedback d-block">
                    <h5>{{messages.err_noPaymentMethods}}</h5>
                </div>
                <span v-for="pm in paymentMethods">
                    <button class="btn btn-primary" :disabled="status.loading" @click="setPaymentMethod(pm)">{{messages['payment_description_'+pm.paymentMethodType]}}</button>
                </span>
            </div>

            <div v-if="paymentMethod && paymentMethod.paymentMethodType === 'credit'">
                <router-view name="stripe" v-if="paymentMethod.driverClass.endsWith('StripePaymentDriver')"></router-view>
                <router-view name="unknown" v-else></router-view>
            </div>
            <div v-if="paymentMethod && paymentMethod.paymentMethodType === 'code'">
                <router-view name="invite" v-if="paymentMethod.driverClass.endsWith('CodePaymentDriver')"></router-view>
                <router-view name="unknown" v-else></router-view>
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
                network: {
                    name: '',
                    domain: '',
                    locale: '',
                    timezone: '',
                    plan: 'bubble',
                    footprint: 'Worldwide',
                    paymentMethodObject: {
                        paymentMethodType: null,
                        paymentInfo: null
                    }
                },
                cloudRegion: '',
                customize: {
                    domain: false,
                    locale: false,
                    timezone: false,
                    plan: false,
                    footprint: false,
                    region: false
                },
                defaults: {
                    domain: '',
                    locale: '',
                    timezone: '',
                    plan: 'bubble',
                    footprint: 'Worldwide',
                    region: ''
                },
                user: util.currentUser(),
                submitted: false,
                status: {
                    creating: false
                },
                verifiedContacts: false,
                anyContacts: false,
                firstContact: null
            };
        },
        computed: {
            ...mapState('system', ['messages', 'locales', 'timezones', 'detectedTimezone', 'detectedLocale']),
            ...mapState('domains', ['domains']),
            ...mapState('plans', ['plans']),
            ...mapState('footprints', ['footprints']),
            ...mapState('paymentMethods', ['paymentMethods', 'paymentMethod', 'paymentInfo']),
            ...mapState('networks', ['nearestRegions']),
            ...mapState('networks', {
                error: state => state.error
            }),
            ...mapState('users', ['policy']),
            ...mapState('account', ['actionStatus']),
            isComplete() {
                return (this.network.name !== '')
                    && (this.customize.domain === false || this.network.domain !== '')
                    && (this.customize.locale === false || this.network.locale !== '')
                    && (this.customize.timezone === false || this.network.timezone !== '')
                    && (this.customize.plan === false || this.network.plan !== '')
                    && (this.customize.footprint === false || this.network.footprint !== '')
                    && (this.network.paymentMethodObject.paymentMethodType != null)
                    && (this.network.paymentMethodObject.paymentInfo != null);
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
            regionObjects: function () {
                const regions_array = [];
                if (this.footprints) {
                    for (let i = 0; i < this.footprints.length; i++) {
                        fp_array.push({
                            ...this.footprints[i],
                            localName: this.messages['footprint_name_' + this.footprints[i].name],
                            description: this.messages['footprint_description_' + this.footprints[i].name]
                        })
                    }
                }
                return regions_array;
            }
        },
        methods: {
            ...mapActions('users', ['getPolicyByUuid']),
            ...mapActions('account', ['approveAction', 'resendVerificationCode']),
            ...mapActions('system', ['detectTimezone', 'detectLocale']),
            ...mapActions('networks', {
                createNewNetwork: 'create',
                getNearestRegions: 'getNearestRegions'
            }),
            ...mapGetters('networks', ['loading']),
            ...mapActions('domains', {
                loadDomains: 'getAll'
            }),
            ...mapActions('plans', {
                loadPlans: 'getAll'
            }),
            ...mapActions('footprints', {
                loadFootprints: 'getAll'
            }),
            ...mapActions('paymentMethods', {
                loadPaymentMethods: 'getAll',
                setPaymentMethod: 'setPaymentMethod'
            }),
            initDefaults() {
                this.getPolicyByUuid({uuid: util.currentUser().uuid, messages: this.messages, errors: this.errors});
                this.detectTimezone();
                this.detectLocale();
                this.loadDomains(util.currentUser().uuid, this.messages, this.errors);
                this.loadPlans(this.messages, this.errors);
                this.loadFootprints(this.messages, this.errors);
                this.loadPaymentMethods(this.messages, this.errors);
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
            handleSubmit(e) {
                this.submitted = true;
                this.$validator.validate().then(valid => {
                    if (valid) {
                        if (this.paymentInfo) {
                            this.network.paymentMethodObject = {
                                paymentMethodType: this.paymentMethod.paymentMethodType,
                                paymentInfo: this.paymentInfo
                            };
                            this.createNewNetwork(this.network);
                        }
                    }
                });
            }
        },
        watch: {
            domains (doms) {
                if (doms && doms[0]) {
                    if (this.network.domain == null || this.network.domain === '') this.network.domain = doms[0].name;
                    this.defaults.domain = doms[0].name;
                    console.log('watch.domains, set this.defaults.domain='+this.defaults.domain);
                }
            },
            detectedTimezone (tz) {
                if (tz && tz.timeZoneId) {
                    if (this.network.timezone == null || this.network.timezone === '') this.network.timezone = tz.timeZoneId;
                    if (this.defaults.timezone == null || this.defaults.timezone === '') this.defaults.timezone = tz.timeZoneId;
                }
            },
            detectedLocale (loc) {
                if (loc) {
                    if (this.network.locale === null || this.network.locale === '') this.network.locale = loc;
                    this.defaults.locale = loc;
                }
            },
            paymentMethod (pm) {
                if (pm) {
                    this.network.paymentMethodObject.paymentMethodType = pm.paymentMethodType;
                    this.network.paymentMethodObject.paymentInfo = null;
                }
            },
            paymentInfo (info) {
                if (info) {
                    this.network.paymentMethodObject.paymentInfo = info;
                }
            },
            policy (p) {
                // console.log('watch.policy: received '+JSON.stringify(p));
                this.anyContacts = this.hasAnyContacts(p);
                this.verifiedContacts = this.hasVerifiedContact(p);
                this.firstContact = this.getFirstContact(p);
            },
            actionStatus (status) {
                // console.log('watch.actionStatus: received: '+JSON.stringify(status));
                if (status.success) {
                    this.initDefaults();
                }
            }
        },
        created() {
            this.initDefaults();
        }
    };
</script>