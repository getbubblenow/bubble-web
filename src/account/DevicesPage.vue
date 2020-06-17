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
                    <th nowrap="nowrap">{{messages.label_field_device_type}}</th>
<!--                    <th nowrap="nowrap">{{messages.label_field_device_enabled}}</th>-->
                    <th>{{messages.label_field_device_vpn_config}}</th>
                    <th nowrap="nowrap">{{messages.label_field_device_certificate}}</th>
                    <th>{{messages.label_field_device_ctime}}</th>
                    <th>{{messages.label_field_device_help}}</th>
                    <th><!-- delete --></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="device in devices">
                    <td nowrap="nowrap">{{device.name}}</td>
                    <td nowrap="nowrap">{{messages['device_type_'+device.deviceType]}}</td>
<!--                    <td>{{messages['message_'+device.enabled]}}</td>-->
                    <td>
                        <div v-if="displayVpnConfig[device.uuid] === true" class="device-vpn-config-div">
                            <h3>{{device.name}}</h3>
                            <hr/>

                            <div v-if="qrCodeImageBase64">
                                <img :src="'data:image/png;base64,'+qrCodeImageBase64"/>
                            </div>
                            <div v-if="errors.has('deviceQRcode')" class="invalid-feedback d-block">{{ errors.first('deviceQRcode') }}</div>

                            <hr/>

                            <button v-if="vpnConfBase64" @click="util.downloadURI('data:text/plain;base64,'+vpnConfBase64, 'vpn.conf')">{{messages.message_device_vpn_download_conf}}</button>
                            <div v-if="errors.has('deviceVpnConf')" class="invalid-feedback d-block">{{ errors.first('deviceVpnConf') }}</div>

                            <hr/>
                            <button @click="hideVpnConfig()" class="btn btn-primary">{{messages.button_label_close_device_vpn_config}}</button>
                        </div>
                        <div v-else>
                            <button @click="showVpnConfig(device.uuid)">{{messages.message_device_vpn_show_config}}</button>
                        </div>
                    </td>
                    <td nowrap="nowrap"><a v-if="device.deviceType" :href="'/api/auth/cacert?deviceType='+device.deviceType">{{messages['device_type_'+device.deviceType]}}</a></td>
                    <td nowrap="nowrap">{{messages.label_device_ctime_format.parseDateMessage(device.ctime, messages)}}</td>
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

            <div class="form-group" v-if="deviceTypes">
                <label htmlFor="deviceType">{{messages.label_field_device_type}}</label>
                <select v-model="deviceType" name="deviceType" class="form-control">
                    <option v-for="type in deviceTypes" :value="type">{{messages['device_type_'+type]}}</option>
                </select>
            </div>

            <hr/>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="loading || !addDeviceReady">{{messages.button_label_add_device}}</button>
                <img v-show="loading" :src="loadingImgSrc" />
            </div>
        </form>

        <hr/>

        <div>
            <h4>{{messages.message_download_ca_cert}}</h4>
            <!-- todo: use a v-for here, don't explicitly list deviceTypes, which may change -->
            <a href="/api/auth/cacert?deviceType=macosx">{{messages.message_os_macosx}}</a> |
            <a href="/api/auth/cacert?deviceType=ios">{{messages.message_os_ios}}</a> |
            <a href="/api/auth/cacert?deviceType=windows">{{messages.message_os_windows}}</a> |
            <a href="/api/auth/cacert?deviceType=android">{{messages.message_os_android}}</a> |
            <a href="/api/auth/cacert?deviceType=linux">{{messages.message_os_linux}}</a> |
            <a href="/api/auth/cacert?deviceType=firefox">{{messages.message_os_firefox}}</a>
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
                loadingImgSrc: loadingImgSrc
            };
        },
        computed: {
            ...mapState('devices', ['deviceTypes', 'devices', 'device', 'qrCodeImageBase64', 'vpnConfBase64']),
            ...mapState('system', ['messages']),
            ...mapGetters('devices', ['loading']),
            addDeviceReady: function () {
                return this.deviceName !== null && this.deviceName !== '' && this.deviceType !== null  && this.deviceType !== '';
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
            })
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
                'getDeviceQRcodeById', 'getDeviceVPNconfById'
            ]),
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
            showVpnConfig (id) {
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
                    if (dev.uuid) this.displayDeviceHelp[dev.uuid] = true;
                }
            }
        }
    };
</script>