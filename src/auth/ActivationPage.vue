<template>
    <div>
        <h2>{{messages.form_title_activation}}</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="name">{{messages.field_label_username}}</label>
                <input type="text" v-model="name" v-validate="'required'" name="name" class="form-control" :class="{ 'is-invalid': submitted && errors.has('name') }" />
                <div v-if="submitted && errors.has('name')" class="invalid-feedback">{{ errors.first('name') }}</div>
            </div>
            <div class="form-group">
                <label htmlFor="password">{{messages.field_label_password}}</label>
                <input type="password" v-model="password" v-validate="{ required: true, min: 6 }" name="password" class="form-control" :class="{ 'is-invalid': submitted && errors.has('password') }" />
                <div v-if="submitted && errors.has('password')" class="invalid-feedback">{{ errors.first('password') }}</div>
            </div>
            <div class="form-group">
                <label for="description">{{messages.field_label_description}}</label>
                <input type="text" v-model="description" name="description" class="form-control" :class="{ 'is-invalid': submitted && errors.has('description') }" />
                <div v-if="submitted && errors.has('description')" class="invalid-feedback">{{ errors.first('description') }}</div>
            </div>
            <div class="form-group">
                <label for="networkName">{{messages.field_label_network_name}}</label>
                <input type="text" v-model="networkName" name="networkName" class="form-control" :class="{ 'is-invalid': submitted && errors.has('networkName') }" />
                <div v-if="submitted && errors.has('networkName')" class="invalid-feedback">{{ errors.first('networkName') }}</div>
            </div>

            <!-- DNS -->
            <div class="form-group">
                <h3>{{messages.form_section_title_dns}}</h3>
                <label for="dnsName">{{messages.field_label_dns_service}}</label>
                <select v-model="dnsName" name="dnsName" class="form-control">
                    <option v-for="opt in dnsTemplates" v-bind:value="opt.name">{{messages['driver_'+opt.driverClass]}}</option>
                </select>
                <span v-html="messages['description_'+dnsByName[dnsName].driverClass]"></span>
                <div v-if="submitted && errors.has('dns')" class="invalid-feedback">{{ errors.first('dns') }}</div>
            </div>

            <!-- DNS fields -->
            <div v-if="cloudConfigFields(dnsByName[dnsName]).credentials && cloudConfigFields(dnsByName[dnsName]).credentials.length > 0">
                <h4>{{messages.form_section_title_dns}} {{messages.form_section_title_credentials}}</h4>
                <div v-for="credential in cloudConfigFields(dnsByName[dnsName]).credentials" class="form-group">
                    <label :for="credential.name">{{messages['driver_credential_'+credential.name+'_'+dnsByName[dnsName].driverClass]}}</label>
                    <input type="text" v-model="dnsCredentials[credential.name]" :name="credential.name" class="form-control" />
                </div>
            </div>
            <div v-if="cloudConfigFields(dnsByName[dnsName]).config && cloudConfigFields(dnsByName[dnsName]).config.length > 0">
                <h4>{{messages.form_section_title_dns}} {{messages.form_section_title_config}}</h4>
                <div v-for="config in cloudConfigFields(dnsByName[dnsName]).config" class="form-group">
                    <label :for="config.name">{{messages['driver_config_'+config.name+'_'+dnsByName[dnsName].driverClass]}}</label>
                    <input type="text" v-model="dnsConfig[config.name]" :name="config.name" class="form-control" />
                    <span v-html="messages['driver_config_description_'+config.name+'_'+dnsByName[dnsName].driverClass]"></span>
                </div>
            </div>

            <!-- Storage -->
            <div class="form-group">
                <h3>{{messages.form_section_title_storage}}</h3>
                <label for="storageName">{{messages.field_label_storage_service}}</label>
                <select v-model="storageName" name="storage" class="form-control">
                    <option v-for="opt in storageTemplates" v-bind:value="opt.name">{{messages['driver_'+opt.driverClass]}}</option>
                </select>
                <span v-html="messages['description_'+storageByName[storageName].driverClass]"></span>
                <div v-if="submitted && errors.has('storage')" class="invalid-feedback">{{ errors.first('storage') }}</div>
            </div>

            <!-- Storage fields -->
            <div v-if="cloudConfigFields(storageByName[storageName]).credentials && cloudConfigFields(storageByName[storageName]).credentials.length > 0">
                <h4>{{messages.form_section_title_storage}} {{messages.form_section_title_credentials}}</h4>
                <div v-for="credential in cloudConfigFields(storageByName[storageName]).credentials" class="form-group">
                    <label :for="credential.name">{{messages['driver_credential_'+credential.name+'_'+storageByName[storageName].driverClass]}}</label>
                    <input type="text" v-model="storageCredentials[credential.name]" :name="credential.name" class="form-control" />
                </div>
            </div>
            <div v-if="cloudConfigFields(storageByName[storageName]).config && cloudConfigFields(storageByName[storageName]).config.length > 0">
                <h4>{{messages.form_section_title_storage}} {{messages.form_section_title_config}}</h4>
                <div v-for="config in cloudConfigFields(storageByName[storageName]).config" class="form-group">
                    <label :for="config.name">{{messages['driver_config_'+config.name+'_'+storageByName[storageName].driverClass]}}</label>
                    <input type="text" v-model="storageConfig[config.name]" :name="config.name" class="form-control" />
                    <span v-html="messages['driver_config_description_'+config.name+'_'+storageByName[storageName].driverClass]"></span>
                </div>
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

    const DNS_GODADDY = {
        name: 'GoDaddyDns',
        driverClass: 'bubble.cloud.dns.godaddy.GoDaddyDnsDriver',
        credentials: {
            params: [
                {name: 'GODADDY_API_KEY', value: null},
                {name: 'GODADDY_API_SECRET', value: null},
            ]
        }
    };
    const DNS_ROUTE53 = {
        name: 'Route53Dns',
        driverClass: 'bubble.cloud.dns.route53.Route53DnsDriver',
        credentials: {
            params: [
                {name: 'AWS_ACCESS_KEY_ID', value: null},
                {name: 'AWS_SECRET_KEY', value: null},
            ]
        }
    };
    const DNS_TEMPLATES = [ DNS_GODADDY, DNS_ROUTE53 ];
    const DNS_BY_NAME = {};
    DNS_BY_NAME[DNS_GODADDY.name] = DNS_GODADDY;
    DNS_BY_NAME[DNS_ROUTE53.name] = DNS_ROUTE53;

    const STORAGE_S3 = {
        name: "S3_US_Standard",
        type: "storage",
        driverClass: "bubble.cloud.storage.s3.S3StorageDriver",
        driverConfig: {
            region: "US_EAST_1",
            bucket: '',
            prefix: '',
            listFetchSize: 100
        },
        credentials: {
            params: [
                {name: "AWS_ACCESS_KEY_ID", "value": null},
                {name: "AWS_SECRET_KEY", "value": null}
            ]
        },
        template: true
    };
    const STORAGE_LOCAL = {
        name: "LocalStorage",
        type: "storage",
        driverClass: "bubble.cloud.storage.local.LocalStorageDriver",
        driverConfig: { baseDir: '.bubble_local_storage' },
        template: false
    };
    const STORAGE_TEMPLATES = [ STORAGE_S3, STORAGE_LOCAL ];
    const STORAGE_BY_NAME = {};
    STORAGE_BY_NAME[STORAGE_S3.name] = STORAGE_S3;
    STORAGE_BY_NAME[STORAGE_LOCAL.name] = STORAGE_LOCAL;

    export default {
        data() {
            return {
                submitted: false,
                dnsTemplates: DNS_TEMPLATES,
                storageTemplates: STORAGE_TEMPLATES,
                dnsByName: DNS_BY_NAME,
                storageByName: STORAGE_BY_NAME,

                name: 'root',
                password: null,
                description: 'root user',
                networkName: null,

                dnsName: DNS_TEMPLATES[0].name,
                dns: Object.assign({}, DNS_TEMPLATES[0]),
                dnsCredentials: {},
                dnsConfig: {},

                storageName: STORAGE_TEMPLATES[0].name,
                storage: Object.assign({}, STORAGE_TEMPLATES[0]),
                storageCredentials: {},
                storageConfig: {},

                domainName: null,
                domain: {}
            };
        },
        computed: {
            ...mapState('system', ['status', 'activated', 'configs', 'messages']),
            activationRequest () {
                return {
                    name: this.name,
                    password: this.password,
                    description: this.description,
                    networkName: this.networkName,
                    dns: {
                    },
                    domain: {
                    },
                    storage: {

                    }
                }
            }
        },
        created () {
        },
        methods: {
            ...mapActions('system', ['loadIsActivated']),
            cloudConfigFields (cloud) {
                const fields = { config: [], credentials: [] };
                if (typeof cloud.driverConfig !== 'undefined' && cloud.driverConfig !== null) {
                    for (let prop in cloud.driverConfig) {
                        if (cloud.driverConfig.hasOwnProperty(prop)) {
                            fields.config.push({
                                name: prop,
                                value: cloud.driverConfig[prop]
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
            }
        },
        watch: {
            activated (active) {
                console.log('ActivationPage.watch.activated: received: '+active);
                if (active) this.$router.replace('/');
            }
        }
    };
</script>