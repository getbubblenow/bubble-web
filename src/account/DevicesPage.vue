<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://git.bubblev.org/bubblev/bubble/src/branch/master/LICENSE.md -->
<template>
    <div>
        <em v-if="loading && loading.devices">{{messages.loading_devices}}</em>
        <div v-if="devices && devices.length > 0">
            <h2>{{messages.table_title_devices}}</h2>
            <table border="1">
                <thead>
                <tr>
                    <th nowrap="nowrap">{{messages.label_field_device_name}}</th>
<!--                    <th nowrap="nowrap">{{messages.label_field_device_enabled}}</th>-->
                    <th>{{messages.label_field_device_vpn_config}}</th>
                    <th>{{messages.label_field_device_ctime}}</th>
                    <th><!-- delete --></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="device in devices">
                    <td nowrap="nowrap">{{device.name}}</td>
<!--                    <td>{{messages['message_'+device.enabled]}}</td>-->
                    <td nowrap="nowrap">{{messages.label_device_ctime_format.parseDateMessage(device.ctime, messages)}}</td>
                    <td>
                        <div v-if="displayVpnConfig[device.uuid] === true" class="device-vpn-config-div">
                            <h3>{{device.name}}</h3>
                            <hr/>

                            <div v-if="qrCodeImageBase64">
                                <img :src="'data:image/png;base64,'+qrCodeImageBase64"/>
                            </div>
                            <div v-if="errors.has('deviceQRcode')" class="invalid-feedback d-block">{{ errors.first('deviceQRcode') }}</div>

                            <hr/>

                            <button v-if="vpnConfBase64" @click="downloadURI('data:text/plain;base64,'+vpnConfBase64, 'vpn.conf')">{{messages.message_device_vpn_download_conf}}</button>
                            <div v-if="errors.has('deviceVpnConf')" class="invalid-feedback d-block">{{ errors.first('deviceVpnConf') }}</div>

                            <hr/>
                            <button @click="hideVpnConfig()" class="btn btn-primary">{{messages.button_label_close_device_vpn_config}}</button>
                        </div>
                        <div v-else>
                            <button @click="showVpnConfig(device.uuid)">{{messages.message_device_vpn_show_config}}</button>
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

            <hr/>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="loading">{{messages.button_label_add_device}}</button>
                <img v-show="loading" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>
        </form>

        <hr/>

        <div>
            <h4>{{messages.message_download_ca_cert}}</h4>
            <a href="/api/auth/cacert?type=pem">{{messages.message_os_apple}}</a> |
            <a href="/api/auth/cacert?type=p12">{{messages.message_os_windows}}</a> |
            <a href="/api/auth/cacert?type=cer">{{messages.message_os_android}}</a> |
            <a href="/api/auth/cacert?type=crt">{{messages.message_os_linux}}</a>
            <hr/>
        </div>

        <div v-if="user && user.admin">
            <h4>{{messages.form_title_mitm}}: {{mitmEnabled ? messages.message_mitm_enabled : messages.message_mitm_disabled}}</h4>
            <button v-if="mitmEnabled" :disabled="mitmLoading" @click="mitmOff()">{{messages.button_label_mitm_disable}}</button>
            <button v-else :disabled="mitmLoading" @click="mitmOn()">{{messages.button_label_mitm_enable}}</button>
            <div v-if="errors.has('mitm')" class="invalid-feedback d-block">{{ errors.first('mitm') }}</div>
            <hr/>
        </div>

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../_helpers';
    import config from 'config';

    export default {
        data () {
            return {
                user: util.currentUser(),
                userId: util.currentUser().uuid,
                submitted: false,
                deviceName: null,
                displayVpnConfig: {},
                config: config,
                mitmLoading: true
            };
        },
        computed: {
            ...mapState('apps', ['mitmEnabled']),
            ...mapState('devices', ['devices', 'device', 'qrCodeImageBase64', 'vpnConfBase64']),
            ...mapState('system', ['messages']),
            ...mapGetters('devices', ['loading'])
        },
        created () {
            this.getMitmStatus({
                userId: this.userId,
                messages: this.messages,
                errors: this.errors
            });
            this.getDevicesByUserId({
                userId: this.userId,
                messages: this.messages,
                errors: this.errors
            });
        },
        methods: {
            ...mapActions('apps', ['getMitmStatus', 'enableMitm', 'disableMitm']),
            ...mapActions('devices', [
                'getDevicesByUserId', 'addDeviceByUserId', 'removeDeviceByUserId',
                'getDeviceQRcodeById', 'getDeviceVPNconfById'
            ]),
            addDevice () {
                this.errors.clear();
                this.submitted = true;
                this.addDeviceByUserId({
                    userId: this.userId,
                    device: {
                        name: this.deviceName
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

            downloadURI(uri, name) {  // adapted from https://stackoverflow.com/a/15832662/1251543
                let link = document.createElement("a");
                link.download = name;
                link.href = uri;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },
            mitmOn () {
                this.mitmLoading = true;
                this.errors.clear();
                this.enableMitm({
                    userId: this.user.uuid,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            mitmOff () {
                this.mitmLoading = true;
                this.errors.clear();
                this.disableMitm({
                    userId: this.user.uuid,
                    messages: this.messages,
                    errors: this.errors
                });
            }
        },
        watch: {
            device(dev) {
                if (dev) {
                    // after device added, clear device name field
                    this.deviceName = null;
                }
            },
            mitmEnabled (m) {
                this.mitmLoading = false;
            }
        }
    };
</script>