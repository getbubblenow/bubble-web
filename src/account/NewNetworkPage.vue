<template>
    <div>
        <h2>{{messages.form_label_title_new_network}}</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="name">{{messages.field_label_network_name}}</label>
                <input type="text" v-model="network.name" v-validate="'required'" name="name" class="form-control" :class="{ 'is-invalid': submitted && errors.has('name') }" />
                <v-select v-if="domains" :options="domains" label="name" type="text" v-model="network.domain" name="domain" class="form-control" :class="{ 'is-invalid': submitted && errors.has('domain') }"></v-select>
                <div v-if="submitted && errors.has('name')" class="invalid-feedback">{{ errors.first('name') }}</div>
            </div>
            <div class="form-group">
                <label htmlFor="locale">{{messages.field_label_locale}}</label>
                <v-select v-if="locales" :options="locales" :reduce="locale => locale.localeCode" label="localeName" type="text" v-model="network.locale" name="locale" class="form-control" :class="{ 'is-invalid': submitted && errors.has('locale') }"></v-select>
                <div v-if="submitted && errors.has('locale')" class="invalid-feedback">{{ errors.first('locale') }}</div>
            </div>
            <div class="form-group">
                <label htmlFor="timezone">{{messages.field_label_timezone}}</label>
                <v-select :options="timezoneObjects" :reduce="tz => tz.timezoneId" label="timezoneDescription" :value="detectedTimezone ? detectedTimezone.timeZoneId : null" type="text" v-model="network.timezone" name="timezone" class="form-control" :class="{ 'is-invalid': submitted && errors.has('timezone') }"></v-select>
                <div v-if="submitted && errors.has('timezone')" class="invalid-feedback">{{ errors.first('timezone') }}</div>
            </div>
            <div class="form-group">
                <label htmlFor="plan">{{messages.field_label_plan}}</label>
                <v-select v-if="planObjects" :options="planObjects" :reduce="plan => plan.name" label="localName" type="text" v-model="network.plan" name="plan" class="form-control" :class="{ 'is-invalid': submitted && errors.has('plan') }"></v-select>
                <div v-if="submitted && errors.has('plan')" class="invalid-feedback">{{ errors.first('plan') }}</div>
                <div>
                    {{messages['plan_description_'+network.plan]}}
                </div>
            </div>
            <div class="form-group">
                <label htmlFor="footprint">{{messages.field_label_footprint}}</label>
                <v-select v-if="footprintObjects" :options="footprintObjects" :reduce="footprint => footprint.name" label="name" :value="network.footprint" type="text" v-model="network.footprint" name="footprint" class="form-control" :class="{ 'is-invalid': submitted && errors.has('footprint') }"></v-select>
                <div v-if="submitted && errors.has('footprint')" class="invalid-feedback">{{ errors.first('footprint') }}</div>
                <div>
                    {{messages['footprint_description_'+network.footprint]}}
                </div>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="status.creating">{{messages.button_label_create_new_network}}</button>
                <img v-show="status.creating" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                <router-link to="/" class="btn btn-link">{{messages.button_label_cancel}}</router-link>
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
                    locale: 'en_US',
                    timezone: '',
                    plan: 'bubble',
                    footprint: 'Worldwide'
                },
                user: currentUser(),
                submitted: false,
                status: ''
            };
        },
        computed: {
            ...mapState('system', ['messages', 'locales', 'timezones', 'detectedTimezone']),
            ...mapState('domains', ['domains']),
            ...mapState('plans', ['plans']),
            ...mapState('footprints', ['footprints']),
            ...mapState('networks', {
                creating: state => state.loading,
                error: state => state.error
            }),
            timezoneObjects: function () {
                const tz_objects = [];
                for (let i=0; i<this.timezones.length; i++) {
                    tz_objects.push({
                        timezoneId: this.timezones[i],
                        timezoneDescription: this.messages['tz_name_'+this.timezones[i]] + " - " + this.messages['tz_description_'+this.timezones[i]]
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
            handleSubmit(e) {
                this.submitted = true;
                this.$validator.validate().then(valid => {
                    if (valid) {
                        this.createNewNetwork(this.network);
                    }
                });
            }
        },
        created() {
            this.loadDomains(currentUser().uuid);
            this.loadPlans();
            this.loadFootprints();
        }
    };
</script>