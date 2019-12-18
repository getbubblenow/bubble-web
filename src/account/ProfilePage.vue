<template>
    <div>
        <h2>Edit Profile</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <span>{{messages.field_label_username}}: {{user.name}}</span>
            </div>
            <div class="form-group">
                <label htmlFor="url">{{messages.field_label_url}}</label>
                <input type="text" v-model="user.url" name="url" class="form-control"/>
                <div v-if="submitted && errors.has('url')" class="invalid-feedback">{{ errors.first('url') }}</div>
            </div>
            <div class="form-group">
                <label htmlFor="description">{{messages.field_label_description}}</label>
                <input type="text" v-model="user.description" name="description" class="form-control"/>
                <div v-if="submitted && errors.has('description')" class="invalid-feedback">{{ errors.first('description') }}</div>
            </div>

            <div v-if="user.admin === true && currentUser.uuid !== user.uuid" class="form-group">
                <label for="admin">{{messages.field_label_administrator}}</label>
                <input type="checkbox" id="admin" v-model="user.admin">
                <div v-if="submitted && errors.has('admin')" class="invalid-feedback">{{ errors.first('admin') }}</div>
            </div>
            <div v-if="user.admin === true && currentUser.uuid === user.uuid" class="form-group">
                <span>{{messages.field_label_administrator}}: {{messages['message_'+user.admin]}}</span>
            </div>

            <div v-if="user.admin === true && currentUser.uuid !== user.uuid" class="form-group">
                <label for="suspended">{{messages.field_label_suspended}}</label>
                <input type="checkbox" id="suspended" v-model="user.suspended">
                <div v-if="submitted && errors.has('suspended')" class="invalid-feedback">{{ errors.first('suspended') }}</div>
            </div>
            <div v-if="user.admin === true && currentUser.uuid === user.uuid" class="form-group">
                <span>{{messages.field_label_suspended}}: {{messages['message_'+user.suspended]}}</span>
            </div>

            <div>
                <h3>{{messages.field_label_auto_update_policy}}</h3>
                <div class="form-group">
                    <label for="autoUpdatePolicy.driverUpdates">{{messages.field_label_auto_update_drivers}}</label>
                    <input type="checkbox" id="autoUpdatePolicy.driverUpdates" v-model="user.autoUpdatePolicy.driverUpdates">
                </div>
                <div class="form-group">
                    <label for="autoUpdatePolicy.appUpdates">{{messages.field_label_auto_update_apps}}</label>
                    <input type="checkbox" id="autoUpdatePolicy.appUpdates" v-model="user.autoUpdatePolicy.appUpdates">
                </div>
                <div class="form-group">
                    <label for="autoUpdatePolicy.dataUpdates">{{messages.field_label_auto_update_app_data}}</label>
                    <input type="checkbox" id="autoUpdatePolicy.dataUpdates" v-model="user.autoUpdatePolicy.dataUpdates">
                </div>
                <div class="form-group">
                    <label for="autoUpdatePolicy.newStuff">{{messages.field_label_auto_update_new_drivers_and_apps}}</label>
                    <input type="checkbox" id="autoUpdatePolicy.newStuff" v-model="user.autoUpdatePolicy.newStuff">
                </div>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="status.updating">{{messages.button_label_update_profile}}</button>
                <img v-show="status.updating" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>
        </form>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'
    import { account } from '../_store/account.module'

    export default {
        data () {
            return {
                submitted: false,
                user: {
                    autoUpdatePolicy: {}
                }
            };
        },
        computed: {
            ...mapState('account', {
                currentUser: state => state.user,
                status: state => state.status
            }),
            ...mapState('system', ['messages'])
        },
        created () {
            this.user = this.currentUser;
        },
        beforeRouteUpdate (to, from, next) {
            // react to route changes...
            console.log('this.router.params.uuid='+this.router.params.uuid);
            next();
        },
        methods: {
            ...mapActions('users', ['update', 'loadUser']),
            handleSubmit (e) {
                const updatedProfile = {
                    url: this.user.url,
                    description: this.user.description,
                    admin: this.user.admin,
                    suspended: this.user.suspended,
                    autoUpdatePolicy: this.user.autoUpdatePolicy
                };
                this.submitted = true;
                this.$validator.validate().then(valid => {
                    if (valid) {
                        this.update({user: updatedProfile, messages: this.messages, errors: this.errors});
                    } else {
                        console.log('invalid!');
                    }
                });
            }
        }
    };
</script>