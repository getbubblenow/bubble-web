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
                        <i @click="removeDevice(device.uuid)" aria-hidden="true" :class="messages.button_label_remove_device_icon" :title="messages.button_label_remove_device"></i>
                        <span class="sr-only">{{messages.button_label_remove_device}}</span>
                    </td>
                </tr>
                </tbody>
            </table>
            <hr/>
            <router-link to="/new_bubble">{{messages.button_label_new_network}}</router-link>
        </div>

        <div v-if="!devices || devices.length === 0">
            {{messages.message_no_devices}}
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
                <button class="btn btn-primary" :disabled="loading()">{{messages.button_label_add_device}}</button>
                <img v-show="loading()" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>
        </form>

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../_helpers';

    export default {
        data () {
            return {
                userId: util.currentUser().uuid,
                submitted: false,
                deviceName: null
            };
        },
        computed: {
            ...mapState('devices', ['devices', 'device']),
            ...mapState('system', ['messages'])
        },
        created () {
            this.getDevicesByUserId({
                userId: this.userId,
                messages: this.messages,
                errors: this.errors
            });
        },
        methods: {
            ...mapActions('devices', ['getDevicesByUserId', 'addDeviceByUserId', 'removeDeviceByUserId']),
            ...mapGetters('devices', ['loading']),
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
            }
        },
        watch: {
            device(dev) {
                if (dev) {
                    // after device added, clear device name field
                    this.deviceName = null;
                }
            }
        }
    };
</script>