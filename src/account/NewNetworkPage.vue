<template>
    <div>
        <h2>{{messages.form_label_title_new_network}}</h2>
        <form @submit.prevent="handleSubmit">
            <!-- name -->
            <div class="form-group">
                <label for="name">{{messages.field_label_network_name}}</label>
                <input type="text" v-model="network.name" v-validate="'required'" name="name" class="form-control" :class="{ 'is-invalid': submitted && errors.has('name') }" />
            </div>

            <!-- domain -->
            <div v-if="customize.domain === true" class="form-group">
                <label for="domain">{{messages.field_label_network_domain}}</label>
                <v-select v-validate="'required'" v-if="domains" :options="domains" label="name" type="text" v-model="network.domain" name="domain" class="form-control" :class="{ 'is-invalid': submitted && errors.has('domain') }"></v-select>
                <div v-if="submitted && errors.has('name')" class="invalid-feedback">{{ errors.first('name') }}</div>
                <button @click="customize.domain = false">{{messages.button_label_use_default}}</button>
            </div>
            <div v-if="customize.domain === false">
                {{messages.field_label_network_domain}}:
                <span v-if="defaults.domain">{{defaults.domain}}</span>
                <span v-else>{{messages.message_auto_detecting}}</span>
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
                <span v-else>{{messages.message_auto_detecting}}</span>
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
                <span v-else>{{messages.message_auto_detecting}}</span>
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
                <span v-else>{{messages.message_auto_detecting}}</span>
                <button @click="customize.plan = true">{{messages.button_label_customize}}</button>
            </div>
            <div>
                {{messages['plan_description_'+network.plan]}}
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
                <span v-else>{{messages.message_auto_detecting}}</span>
                <button @click="customize.footprint = true">{{messages.button_label_customize}}</button>
            </div>
            <div>
                {{messages['footprint_description_'+network.footprint]}}
            </div>
            <hr/>

            <div class="form-group">
                <label htmlFor="paymentMethod">{{messages.field_label_paymentMethod}}</label>
                <div v-if="submitted && errors.has('paymentMethod')" class="invalid-feedback">{{ errors.first('paymentMethod') }}</div>
                <div v-if="submitted && errors.has('paymentMethodInfo')" class="invalid-feedback">{{ errors.first('paymentMethodInfo') }}</div>
                <div v-if="submitted && errors.has('paymentMethodType')" class="invalid-feedback">{{ errors.first('paymentMethodType') }}</div>
                <div v-if="submitted && errors.has('paymentMethodService')" class="invalid-feedback">{{ errors.first('paymentMethodService') }}</div>
                <div v-if="submitted && errors.has('paymentInfo')" class="invalid-feedback">{{ errors.first('paymentInfo') }}</div>
                <span v-for="pm in paymentMethods">
                    <button class="btn btn-primary" :disabled="status.creating" @click="setPaymentMethod(pm)">{{messages['payment_description_'+pm.paymentMethodType]}}</button>
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
                <button class="btn btn-primary" :disabled="status.creating || !isComplete">{{messages.button_label_create_new_network}}</button>
                <img v-show="status.creating" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>
        </form>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'
    import { currentUser } from '../_helpers'

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
                customize: {
                    domain: false,
                    locale: false,
                    timezone: false,
                    plan: false,
                    footprint: false
                },
                defaults: {
                    domain: '',
                    locale: '',
                    timezone: '',
                    plan: 'bubble',
                    footprint: 'Worldwide'
                },
                user: currentUser(),
                submitted: false,
                status: {
                    creating: false
                }
            };
        },
        computed: {
            ...mapState('system', ['messages', 'locales', 'timezones', 'detectedTimezone', 'detectedLocale']),
            ...mapState('domains', ['domains']),
            ...mapState('plans', ['plans']),
            ...mapState('footprints', ['footprints']),
            ...mapState('paymentMethods', ['paymentMethods', 'paymentMethod', 'paymentInfo']),
            ...mapState('networks', {
                creating: state => state.loading,
                error: state => state.error
            }),
            isComplete() {
                return (this.name !== '')
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
            }
        },
        methods: {
            ...mapActions('networks', {
                createNewNetwork: 'create'
            }),
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
                    } else {
                        console.log('handleSubmit: no payment info found');
                        // console.log('handleSubmit: paymentMethod='+JSON.stringify(this.paymentMethod));
                        if (this.paymentMethod) console.log('handleSubmit: paymentMethod.driverClass='+JSON.stringify(this.paymentMethod.driverClass));
                    }
                });
            }
        },
        watch: {
            domains (doms) {
                if (doms && doms[0]) {
                    if (this.network.domain == null || this.network.domain === '') this.network.domain = doms[0].name;
                    if (this.defaults.domain == null || this.defaults.domain === '') this.defaults.domain = doms[0].name;
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
                    if (this.network.locale == null || this.network.locale === '') this.network.locale = loc;
                    if (this.defaults.locale == null || this.defaults.locale === '') this.defaults.locale = loc;
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
            }
        },
        created() {
            this.loadDomains(currentUser().uuid, this.messages, this.errors);
            this.loadPlans(this.messages, this.errors);
            this.loadFootprints(this.messages, this.errors);
            this.loadPaymentMethods(this.messages, this.errors);
        }
    };
</script>