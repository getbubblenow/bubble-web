<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div>
        <em v-if="loading && loading.devices">{{messages.loading_devices}}</em>
        <div v-if="devices && devices.length > 0">
            <h2>{{messages.table_title_devices}}</h2>
            <table border="1">
                <thead>
                <tr>
                    <th nowrap="nowrap">{{messages.label_field_device_name}}</th>
<!--                    <th nowrap="nowrap">{{messages.label_field_device_type}}</th>-->
                    <th nowrap="nowrap">{{messages.label_field_device_app}}</th>
<!--                    <th nowrap="nowrap">{{messages.label_field_device_enabled}}</th>-->
                    <th>{{messages.label_field_device_vpn_config}}</th>
                    <th nowrap="nowrap">{{messages.label_field_device_certificate}}</th>
                    <th nowrap="nowrap">{{messages.label_field_device_security_level}}</th>
                    <th nowrap="nowrap">{{messages.label_field_device_connection}}</th>
<!--                    <th>{{messages.label_field_device_ctime}}</th>-->
                    <th>{{messages.label_field_device_help}}</th>
                    <th><!-- delete --></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="device in devices">
                    <td nowrap="nowrap">{{device.name}}</td>
<!--                    <td nowrap="nowrap">-->
<!--                        <i :class="messages['device_type_icon_'+device.deviceType]+' bubble-app-icon'"></i><br/>-->
<!--                        {{messages['device_type_'+device.deviceType]}}-->
<!--                    </td>-->
                    <td align="center">
                        <a v-if="appLinks" target="_blank" rel="noopener noreferrer" :href="appLinks[device.deviceType]">
                            <i :class="messages['device_type_icon_'+device.deviceType]+' bubble-app-icon'"></i><br/>
                            {{messages.message_download_app}}
                        </a>
                    </td>
<!--                    <td>{{messages['message_'+device.enabled]}}</td>-->
                    <td>
                        <div v-if="displayVpnConfig[device.uuid] === true" class="device-vpn-config-div">
                            <h3>{{device.name}}</h3>
                            <hr/>

                            <div v-if="qrCodeImageBase64 && messages['device_type_vpn_'+device.deviceType] === 'show_qr_code'">
                                <img :src="'data:image/png;base64,'+qrCodeImageBase64"/>
                                <div v-if="errors.has('deviceQRcode')" class="invalid-feedback d-block">{{ errors.first('deviceQRcode') }}</div>
                            </div>
                            <div v-else-if="vpnConfBase64 && messages['device_type_vpn_'+device.deviceType] === 'download_conf'">
                                <button v-if="vpnConfBase64" @click="util.downloadURI('data:text/plain;base64,'+vpnConfBase64, vpnConfFileName)">{{messages.message_device_vpn_download_conf}}</button>
                                <div v-if="errors.has('deviceVpnConf')" class="invalid-feedback d-block">{{ errors.first('deviceVpnConf') }}</div>
                            </div>
                            <div v-else>
                                <h5>{{messages.message_device_vpn_unavailable}}</h5>
                            </div>
                            <hr/>
                            <button @click="hideVpnConfig()" class="btn btn-primary">{{messages.button_label_close_device_vpn_config}}</button>
                        </div>
                        <div v-else-if="messages['!button_label_vpn_config_'+messages['device_type_vpn_'+device.deviceType]]">
                            <button @click="showVpnConfig(device.uuid)">{{messages['button_label_vpn_config_'+messages['device_type_vpn_'+device.deviceType]]}}</button>
                        </div>
                        <div v-else>
                            {{messages.message_device_vpn_unavailable}}
                        </div>
                    </td>
                    <td>
                        <a :href="'/api/auth/cacert?deviceType='+device.deviceType">
                            {{messages.message_download_ca_cert}}
                        </a>
                    </td>
                    <td>
                        <form v-if="configs.securityLevels" @submit.prevent="false">
                            <input type="hidden" name="deviceId" :value="device.uuid"/>
                            <select v-model="device.securityLevel" @change="setSecurityLevel($event)">
                                <option v-for="level in configs.securityLevels" :value="level">{{messages['device_security_level_'+level]}}</option>
                            </select>
                        </form>
                    </td>
                    <td class="device-connection-status">
                        <div v-if="device.status.ip">
                            {{device.status.ip}}
                            <div v-if="device.status.location">
                                <hr/>
                                <span v-if="device.status.location.city && device.status.location.region && device.status.location.country">{{device.status.location.city}}, {{device.status.location.region}}, {{messages['country_'+device.status.location.country]}}</span>
                                <span v-else-if="device.status.location.region && device.status.location.country">{{device.status.location.region}}, {{messages['country_'+device.status.location.country]}}</span>
                                <span v-else-if="device.status.location.city && device.status.location.country">{{device.status.location.city}}, {{messages['country_'+device.status.location.country]}}</span>
                                <span v-else-if="device.status.location.country">{{messages['country_'+device.status.location.country]}}</span>
                                <span v-else-if="device.status.location.city && device.status.location.region">{{device.status.location.city}}, {{device.status.location.region}}</span>
                                <span v-else-if="device.status.location.region">{{device.status.location.region}}</span>
                                <span v-else-if="device.status.location.city">{{device.status.location.city}}</span>
                            </div>
                        </div>
                        <div v-if="device.status.bytesSent || device.status.bytesReceived">
                            <hr/>
                            <div v-if="device.status.bytesSent">
                                {{device.status.bytesSent}}{{device.status.sentUnits}} {{messages.label_field_device_transfer_sent}}
                            </div>
                            <div v-if="device.status.bytesReceived">
                                {{device.status.bytesReceived}}{{device.status.receivedUnits}} {{messages.label_field_device_transfer_received}}
                            </div>
                        </div>
                        <div v-if="device.status.lastHandshakeTime">
                            <hr/>
                            {{messages.label_field_device_connection_handshake}}:
                            <span v-if="device.status.lastHandshakeMinutes && device.status.lastHandshakeSeconds">{{device.status.lastHandshakeMinutes}}{{messages.units_minutes_short}}, {{device.status.lastHandshakeSeconds}}{{messages.units_seconds_short}}</span>
                            <span v-else-if="device.status.lastHandshakeMinutes">{{device.status.lastHandshakeMinutes}}{{messages.units_minutes_short}}</span>
                            <span v-else-if="device.status.lastHandshakeSeconds">{{device.status.lastHandshakeSeconds}}{{messages.units_seconds_short}}</span>
                            {{messages.label_field_device_connection_handshake_ago}}
                        </div>
                    </td>
<!--                    <td nowrap="nowrap">{{messages.label_device_ctime_format.parseDateMessage(device.ctime, messages)}}</td>-->
                    <td>
                        <div v-if="displayDeviceHelp[device.uuid] === true" class="device-help-div">
                            <div v-html="messages['device_type_'+device.deviceType+'_help_html']"></div>
                            <button @click="hideDeviceHelp()" class="btn btn-primary">{{messages.button_label_close_device_help}}</button>
                        </div>
                        <div v-else>
                            <button @click="showDeviceHelp(device.uuid)">{{messages.label_field_device_help}}</button>
                        </div>
                    </td>
                    <td>
                        <i @click="removeDevice(device.uuid)" aria-hidden="true" :class="messages.button_label_remove_device_icon" :title="messages.button_label_remove_device"></i>
                        <span class="sr-only">{{messages.button_label_remove_device}}</span>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>

        <hr/>

        <form @submit.prevent="addDevice()">
            <h4>{{messages.form_title_add_device}}</h4>

            <div class="form-group">
                <label htmlFor="name">{{messages.label_field_device_name}}</label>
                <input v-model="deviceName" name="name" class="form-control"/>
                <div v-if="submitted && errors.has('name')" class="invalid-feedback d-block">{{ errors.first('name') }}</div>
                <div v-if="submitted && errors.has('deviceName')" class="invalid-feedback d-block">{{ errors.first('deviceName') }}</div>
            </div>

            <div class="form-group" v-if="addableDeviceTypes">
                <label htmlFor="deviceType">{{messages.label_field_device_type}}</label>
                <select v-model="deviceType" name="deviceType" class="form-control">
                    <option v-for="type in addableDeviceTypes" :value="type">{{messages['device_type_'+type]}}</option>
                </select>
            </div>

            <hr/>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="loading || !addDeviceReady">{{messages.button_label_add_device}}</button>
                <img v-show="loading" :src="loadingImgSrc" />
            </div>
        </form>

        <hr/>

        <div v-if="certDeviceTypes">
            <table border="0" width="100%">
                <tr><td colspan="5"><h4>{{messages.message_download_ca_cert}}</h4></td></tr>
                <tr>
                    <td v-for="certDevice in certDeviceTypes" align="center" :width="certDeviceWidth+'%'">
                        <a :href="'/api/auth/cacert?deviceType='+certDevice">
                            <i :class="messages['device_type_icon_'+certDevice]+' bubble-app-icon'"></i><br/>
                            {{messages['device_type_'+certDevice]}}
                        </a>
                    </td>
                </tr>
            </table>
            <hr/>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../_helpers';
    import config from 'config';
    import { loadingImgSrc } from '../_store';

    export default {
        data () {
            return {
                user: util.currentUser(),
                userId: util.currentUser().uuid,
                submitted: false,
                deviceName: null,
                deviceType: null,
                displayVpnConfig: {},
                displayDeviceHelp: {},
                config: config,
                loadingImgSrc: loadingImgSrc,
                util: util
            };
        },
        computed: {
            ...mapState('devices', ['deviceTypes', 'devices', 'device', 'qrCodeImageBase64', 'vpnConfBase64']),
            ...mapState('system', ['messages', 'appLinks', 'configs']),
            ...mapGetters('devices', ['loading']),
            vpnConfFileName: function () {
                if (this.configs && this.configs.networkUuid) {
                    return 'bubble-'+this.configs.networkUuid.split('-')[0]+'-vpn.conf';
                } else {
                    return 'vpn.conf';
                }
            },
            addDeviceReady: function () {
                return this.deviceName !== null && this.deviceName !== '' && this.deviceType !== null  && this.deviceType !== '';
            },
            addableDeviceTypes: function () {
                if (this.messages && this.messages['!addable_device_types']) {
                    return this.messages['addable_device_types'].split('|');
                }
                return [];
            },
            addableDeviceWidth: function () {
                return 100.0/this.addableDeviceTypes.length
            },
            certDeviceTypes: function () {
                if (this.messages && this.messages['!cert_device_types']) {
                    return this.messages['cert_device_types'].split('|');
                }
                return [];
            },
            certDeviceWidth: function () {
                return 100.0/this.certDeviceTypes.length
            }
        },
        created () {
            this.getDevicesByUserId({
                userId: this.userId,
                messages: this.messages,
                errors: this.errors
            });
            this.getAllDeviceTypesByUserId({
                userId: this.userId,
                messages: this.messages,
                errors: this.errors
            });
            const user = util.currentUser();
            if (user) this.getAppLinks(user.locale);
            this.loadSystemConfigs();
        },
        mounted() {
            window.addEventListener('keyup', ev => {
                if (ev.key === "Escape") {
                    this.hideVpnConfig();
                    this.hideDeviceHelp();
                }
            });
        },
        methods: {
            ...mapActions('devices', [
                'getAllDeviceTypesByUserId', 'getDevicesByUserId', 'addDeviceByUserId', 'removeDeviceByUserId',
                'getDeviceQRcodeById', 'getDeviceVPNconfById', 'setDeviceSecurityLevel'
            ]),
            ...mapActions('system', ['getAppLinks', 'loadSystemConfigs']),
            addDevice () {
                this.errors.clear();
                this.submitted = true;
                this.addDeviceByUserId({
                    userId: this.userId,
                    device: {
                        name: this.deviceName,
                        deviceType: this.deviceType
                    },
                    messages: this.messages,
                    errors: this.errors
                });
            },
            removeDevice (id) {
                this.errors.clear();
                this.submitted = true;
                this.removeDeviceByUserId({
                    userId: this.userId,
                    deviceId: id,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            setSecurityLevel (event) {
                this.setDeviceSecurityLevel({
                    userId: this.userId,
                    deviceId: event.target.form.deviceId.value,
                    securityLevel: event.target.value,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            showVpnConfig (id) {
                this.hideDeviceHelp();
                const show = {};
                show[id] = true;
                this.errors.clear();
                this.getDeviceQRcodeById({
                    userId: this.userId,
                    deviceId: id,
                    messages: this.messages,
                    errors: this.errors
                });
                this.getDeviceVPNconfById({
                    userId: this.userId,
                    deviceId: id,
                    messages: this.messages,
                    errors: this.errors
                });
                this.displayVpnConfig = Object.assign({}, show);
            },
            hideVpnConfig () { this.displayVpnConfig = {}; },

            showDeviceHelp (id) {
                this.hideVpnConfig();
                this.displayDeviceHelp = {};
                this.displayDeviceHelp[id] = true;
            },
            hideDeviceHelp () { this.displayDeviceHelp = {}; }
        },
        watch: {
            device(dev) {
                if (dev) {
                    // after device added, clear device fields
                    this.deviceName = null;
                    this.deviceType = null;
                    if (dev.uuid) this.showVpnConfig(dev.uuid);
                }
            }
        }
    };
</script>