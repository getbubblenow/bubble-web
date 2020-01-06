<template>
    <div>
        <h2>{{messages.form_title_activation}}</h2>
        <form @submit.prevent="submitActivation">
            <div class="form-group">
                <label for="name">{{messages.field_label_username}}</label>
                <input type="text" v-model="name" v-validate="'required'" name="name" class="form-control" :class="{ 'is-invalid': submitted && errors.has('name') }" />
                <div v-if="submitted && errors.has('name')" class="invalid-feedback d-block">{{ errors.first('name') }}</div>
            </div>
            <div class="form-group">
                <label htmlFor="password">{{messages.field_label_password}}</label>
                <input type="password" v-model="password" v-validate="{ required: true, min: 6 }" name="password" class="form-control" :class="{ 'is-invalid': submitted && errors.has('password') }" />
                <div v-if="submitted && errors.has('password')" class="invalid-feedback d-block">{{ errors.first('password') }}</div>
            </div>
            <div class="form-group">
                <label for="description">{{messages.field_label_description}}</label>
                <input type="text" v-model="description" name="description" class="form-control" :class="{ 'is-invalid': submitted && errors.has('description') }" />
                <div v-if="submitted && errors.has('description')" class="invalid-feedback d-block">{{ errors.first('description') }}</div>
            </div>

    <div v-for="csType in cloudTypes">
        <div class="form-group">
            <h3>{{messages['form_section_title_'+csType]}}</h3>
            <div v-if="submitted && errors.has(csType)" class="invalid-feedback d-block"><h5>{{ errors.first(csType) }}</h5></div>
        </div>

        <div v-for="cloud in cloudsByType(csType)" class="form-group">
            <hr/>
            <div class="form-group">
                <label :for="cloud.name+'_enabled'">
                    <h4 v-html="messages['driver_'+cloud.driverClass]"></h4>
                </label>
                <input :name="cloud.name+'_enabled'" type="checkbox" v-model="cloudsEnabled[cloud.name]"/>
                <div v-html="messages['description_'+cloud.driverClass]"></div>
            </div>

            <div v-if="cloudsEnabled[cloud.name]">
                <!-- credential fields -->
                <div v-if="cloudConfigFields(cloud).credentials && cloudConfigFields(cloud).credentials.length > 0">
                    <h5>{{messages['driver_'+cloud.driverClass]}} {{messages.form_section_title_credentials}}</h5>
                    <div v-for="credential in cloudConfigFields(cloud).credentials" class="form-group">
                        <label :for="credential.name">{{messages['driver_credential_'+credential.name+'_'+cloud.driverClass]}}</label>
                        <input type="text" v-model="credentialValues[cloud.name][credential.name]" :name="credential.name" class="form-control" />
                    </div>
                </div>
                <!-- config fields -->
                <div v-if="cloudConfigFields(cloud).config && cloudConfigFields(cloud).config.length > 0">
                    <h5>{{messages['driver_'+cloud.driverClass]}} {{messages.form_section_title_config}}</h5>
                    <div v-for="config in cloudConfigFields(cloud).config" class="form-group">
                        <label :for="config.name">{{messages['driver_config_'+config.name+'_'+cloud.driverClass]}}</label>
                        <textarea v-if="config.inputType === 'textarea'" v-model="configValues[cloud.name][config.name]" class="form-control"></textarea>
                        <input v-else :type="config.inputType" v-model="configValues[cloud.name][config.name]" :name="config.name" class="form-control" />
                        <span v-html="messages['driver_config_description_'+config.name+'_'+cloud.driverClass]"></span>
                    </div>
                </div>
            </div>
        </div>
    </div>

        <div class="form-group">
            <label for="domainName">{{messages.field_label_domain}}</label>
            <input type="text" v-model="domainName" name="domainName" class="form-control" :class="{ 'is-invalid': submitted && errors.has('domain') }" />
            <div v-if="submitted && errors.has('domain')" class="invalid-feedback d-block">{{ errors.first('domain') }}</div>
            <span>{{messages.field_label_domain_description}}</span>
        </div>

        <div class="form-group">
            <label for="publicDns">{{messages.field_label_domain_publicDns}}</label>
            <select v-model="publicDns" name="publicDns" class="form-control">
                <option v-for="dns in availableDnsServices" :value="dns.name">{{messages['driver_'+dns.driverClass]}}</option>
            </select>
            <span>{{messages.field_label_domain_publicDns_description}}</span>
            <div v-if="submitted && errors.has('publicDns')" class="invalid-feedback d-block"><h5>{{ errors.first('publicDns') }}</h5></div>
        </div>

        <div class="form-group">
                <button class="btn btn-primary" :disabled="status.activating">{{messages.button_label_activate}}</button>
                <img v-show="status.activating" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>
        </form>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'

    function toCredentialsMap(creds) {
        const map = {};
        for (let i=0; i<creds.length; i++) map[creds.name] = creds.value;
        return map;
    }

    const cloudNotFoundHandler = function (vue, fieldGroup) {
        return {
            get: function (target, name) {
                if (typeof name === 'undefined') return null;
                if (name === null) return null;
                if (name === '') return null;
                if (!target.hasOwnProperty(name)) target[name] = vue.populateDefaults(fieldGroup, name);
                return target[name];
            }
        };
    };

    export default {
        data() {
            return {
                submitted: false,
                cloudTemplates: null,

                name: 'root',
                password: null,
                description: 'root user',

                cloudsEnabled: {},
                configValues: new Proxy(Object.assign({}), cloudNotFoundHandler(this, 'config')),
                credentialValues: new Proxy(Object.assign({}), cloudNotFoundHandler(this, 'credentials')),

                domainName: null,
                publicDns: null
            };
        },
        computed: {
            ...mapState('system', ['status', 'activated', 'configs', 'messages']),
            cloudTypes () {
                const types = [];
                const typesFound = {};
                if (this.configs && this.configs.cloudConfigs) {
                    for (let i=0; i<this.configs.cloudConfigs.length; i++) {
                        if (this.configs.cloudConfigs[i].type) {
                            if (!(this.configs.cloudConfigs[i].type in typesFound)) {
                                types.push(this.configs.cloudConfigs[i].type);
                                typesFound[this.configs.cloudConfigs[i].type] = true;
                            }
                        }
                    }
                }
                return types;
            },
            availableDnsServices () {
                const dns = [];
                if (this.configs && this.configs.cloudConfigs) {
                    for (let i=0; i<this.configs.cloudConfigs.length; i++) {
                        if (this.configs.cloudConfigs[i].type && this.configs.cloudConfigs[i].type === 'dns') {
                            if (this.cloudsEnabled[this.configs.cloudConfigs[i].name]) {
                                dns.push(this.configs.cloudConfigs[i]);
                            }
                        }
                    }
                }
                return dns;
            }
        },
        created () {
            this.loadIsActivated();
        },
        methods: {
            ...mapActions('system', ['loadIsActivated', 'activate']),
            cloudsByType (csType) {
                const clouds = [];
                if (this.configs && this.configs.cloudConfigs) {
                    for (let i=0; i<this.configs.cloudConfigs.length; i++) {
                        if (this.configs.cloudConfigs[i].type) {
                            const t = this.configs.cloudConfigs[i].type;
                            if (t === csType) clouds.push(this.configs.cloudConfigs[i]);
                        }
                    }
                }
                return clouds;
            },
            cloudByName (cloudName) {
                if (this.configs && this.configs.cloudConfigs) {
                    for (let i=0; i<this.configs.cloudConfigs.length; i++) {
                        if (this.configs.cloudConfigs[i].name === cloudName.toString()) {
                            return this.configs.cloudConfigs[i];
                        }
                    }
                }
                console.warn('cloudByName('+cloudName.toString()+'): cloud not found, returning null');
                return null;
            },
            populateDefaults (fieldGroup, cloudName) {
                const cloud = this.cloudByName(cloudName);
                if (cloud === null) return {};
                const fields = this.cloudConfigFields(cloud);
                const defaults = {};
                for (let i=0; i<fields[fieldGroup].length; i++) {
                    defaults[fields[fieldGroup][i].name] = fields[fieldGroup][i].value;
                }
                console.log('returning '+cloudName.toString()+'/'+fieldGroup+' defaults: '+JSON.stringify(defaults));
                return defaults;
            },
            domainActivationObject: function () {
                return {
                    name: this.domainName,
                    template: true,
                    publicDns: this.publicDns
                };
            },
            cloudConfigFields (cloud) {
                const fields = { config: [], credentials: [] };
                if (typeof cloud.driverConfig !== 'undefined' && cloud.driverConfig !== null) {
                    for (let prop in cloud.driverConfig) {
                        if (cloud.driverConfig.hasOwnProperty(prop)) {
                            fields.config.push({
                                name: prop,
                                value: (typeof cloud.driverConfig[prop] === 'object')
                                    ? JSON.stringify(cloud.driverConfig[prop])
                                    : cloud.driverConfig[prop],
                                inputType: (cloud.driverConfig[prop] === true || cloud.driverConfig[prop] === false)
                                    ? 'checkbox' : (typeof cloud.driverConfig[prop] === 'object' ? 'textarea' : 'text')
                            });
                        }
                    }
                }
                if (typeof cloud.credentials !== 'undefined' && cloud.credentials !== null
                    && typeof cloud.credentials.params !== 'undefined' && cloud.credentials.params !== null
                    && Array.isArray(cloud.credentials.params) && cloud.credentials.params.length > 0) {
                    for (let i=0; i<cloud.credentials.params.length; i++) {
                        fields.credentials.push({
                            name: cloud.credentials.params[i].name,
                            value: cloud.credentials.params[i].value
                        });
                    }
                }
                return fields;
            },
            submitActivation (e) {
                const activation = {
                    name: this.name,
                    password: this.password,
                    description: this.description,
                    networkName: 'boot-network',
                    cloudConfigs: {},
                    domain: this.domainActivationObject()
                };
                for (let cloud in this.cloudsEnabled) {
                    if (this.cloudsEnabled.hasOwnProperty(cloud)) {
                        activation.cloudConfigs[cloud] = {
                            config: this.configValues[cloud],
                            credentials: this.credentialValues[cloud]
                        };
                    }
                }
                this.errors.clear();
                this.submitted = true;
                // console.log('sending activation: '+JSON.stringify(activation));
                this.activate({activation: activation, messages: this.messages, errors: this.errors});
            }
        },
        watch: {
            activated (active) {
                if (active) this.$router.replace('/');
            },
            dnsName (name) {
                // console.log('dns changed to '+name);
                if (typeof this.dnsByName[name].credentials !== 'undefined') {
                    this.dnsCredentials = toCredentialsMap(this.dnsByName[name].credentials);
                }
                if (typeof this.dnsByName[name].driverConfig !== 'undefined') {
                    this.dnsConfig = this.dnsByName[name].driverConfig;
                }
            },
            storageName (name) {
                // console.log('storage changed to '+name);
                if (typeof this.storageByName[name].credentials !== 'undefined') {
                    this.storageCredentials = toCredentialsMap(this.storageByName[name].credentials);
                }
                if (typeof this.storageByName[name].driverConfig !== 'undefined') {
                    this.storageConfig = this.storageByName[name].driverConfig;
                }
            },
        }
    };
</script>