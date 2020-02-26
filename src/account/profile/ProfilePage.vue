<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://git.bubblev.org/bubblev/bubble/src/branch/master/LICENSE.md -->
<template>
    <div>
        <h2 v-if="newUser !== null && newUser === true">{{messages.title_account_new}}</h2>
        <h2 v-else-if="newUser !== null">{{messages.title_account_manage}}</h2>

        <div v-if="newUser === null || newUser === false">
            <router-link :to="linkPrefix+'/changePassword'">{{messages.link_label_change_password}}</router-link>
            <hr/>
            <router-link :to="linkPrefix+'/policy'">{{messages.link_label_account_policy}}</router-link>
            <hr/>
            <router-link :to="linkPrefix+'/keys'">{{messages.link_label_account_ssh_keys}}</router-link>
            <hr/>
            <div v-if="configs.sageLauncher">
                <router-link :to="linkPrefix+'/payment'">{{messages.link_label_account_payments}}</router-link>
                <hr/>
                <router-link :to="linkPrefix+'/bills'">{{messages.link_label_account_bills}}</router-link>
                <hr/>
            </div>
        </div>

        <form @submit.prevent="handleSubmit">
            <div v-if="submitted && errors.has('user')" class="invalid-feedback d-block"><h5>{{ errors.first('user') }}</h5></div>

            <div v-if="newUser === null || newUser === false || admin !== true" class="form-group">
                <span>{{messages.field_label_username}}: {{subject.name}}</span>
            </div>
            <div v-else class="form-group">
                <label htmlFor="url">{{messages.field_label_username}}</label>
                <input type="text" v-model="subject.name" name="name" class="form-control"/>
                <div v-if="submitted && errors.has('name')" class="invalid-feedback d-block">{{ errors.first('name') }}</div>
            </div>

            <div v-if="newUser === true && admin === true" class="form-group">
                <label htmlFor="email">{{messages.field_label_email}}</label>
                <input type="text" v-model="subject.email" name="email" class="form-control"/>
                <div v-if="submitted && errors.has('email')" class="invalid-feedback d-block">{{ errors.first('email') }}</div>
                <div v-if="submitted && errors.has('contact')" class="invalid-feedback d-block">{{ errors.first('contact') }}</div>
            </div>
            <div v-if="newUser === true && admin === true" class="form-group">
                <label htmlFor="sendWelcomeEmail">{{messages.field_label_sendWelcomeEmail}}
                    <input type="checkbox" v-model="subject.sendWelcomeEmail" name="sendWelcomeEmail" class="form-control"/>
                </label>
            </div>
            <div v-if="newUser === true && admin === true" class="form-group">
                <label htmlFor="password">{{messages.field_label_password}}
                    <input type="password" v-model="subject.password" name="password" class="form-control"/>
                </label>
                <div v-if="submitted && errors.has('password')" class="invalid-feedback d-block">{{ errors.first('password') }}</div>
            </div>

            <div class="form-group">
                <label htmlFor="url">{{messages.field_label_url}}</label>
                <input type="text" v-model="subject.url" name="url" class="form-control"/>
                <div v-if="submitted && errors.has('url')" class="invalid-feedback d-block">{{ errors.first('url') }}</div>
            </div>

            <div class="form-group">
                <label htmlFor="description">{{messages.field_label_description}}</label>
                <input type="text" v-model="subject.description" name="description" class="form-control"/>
                <div v-if="submitted && errors.has('description')" class="invalid-feedback d-block">{{ errors.first('description') }}</div>
            </div>

            <div v-if="admin === true && currentUser.uuid !== subject.uuid" class="form-group">
                <label for="admin">{{messages.field_label_administrator}}</label>
                <input type="checkbox" id="admin" v-model="subject.admin">
                <div v-if="submitted && errors.has('admin')" class="invalid-feedback d-block">{{ errors.first('admin') }}</div>
            </div>
            <div v-if="admin === true && currentUser.uuid === subject.uuid" class="form-group">
                <span>{{messages.field_label_administrator}}: {{messages['message_'+subject.admin]}}</span>
            </div>

            <div v-if="admin === true && currentUser.uuid !== subject.uuid" class="form-group">
                <label for="suspended">{{messages.field_label_suspended}}</label>
                <input type="checkbox" id="suspended" v-model="subject.suspended">
                <div v-if="submitted && errors.has('suspended')" class="invalid-feedback d-block">{{ errors.first('suspended') }}</div>
            </div>
            <div v-if="admin === true && currentUser.uuid === subject.uuid" class="form-group">
                <span>{{messages.field_label_suspended}}: {{messages['message_'+subject.suspended]}}</span>
            </div>

            <div>
                <h3>{{messages.field_label_auto_update_policy}}</h3>
                <div class="form-group">
                    <label for="autoUpdatePolicy.driverUpdates">{{messages.field_label_auto_update_drivers}}</label>
                    <input type="checkbox" id="autoUpdatePolicy.driverUpdates" v-model="subject.autoUpdatePolicy.driverUpdates">
                </div>
                <div class="form-group">
                    <label for="autoUpdatePolicy.appUpdates">{{messages.field_label_auto_update_apps}}</label>
                    <input type="checkbox" id="autoUpdatePolicy.appUpdates" v-model="subject.autoUpdatePolicy.appUpdates">
                </div>
                <div class="form-group">
                    <label for="autoUpdatePolicy.dataUpdates">{{messages.field_label_auto_update_app_data}}</label>
                    <input type="checkbox" id="autoUpdatePolicy.dataUpdates" v-model="subject.autoUpdatePolicy.dataUpdates">
                </div>
                <div class="form-group">
                    <label for="autoUpdatePolicy.newStuff">{{messages.field_label_auto_update_new_drivers_and_apps}}</label>
                    <input type="checkbox" id="autoUpdatePolicy.newStuff" v-model="subject.autoUpdatePolicy.newStuff">
                </div>
            </div>
            <div class="form-group">
                <button v-if="newUser === null || newUser === false || admin !== true" class="btn btn-primary" :disabled="loading()">{{messages.button_label_update_profile}}</button>
                <button v-else class="btn btn-primary" :disabled="loading()">{{messages.button_label_create_account}}</button>
                <img v-show="loading()" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>
        </form>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../../_helpers';

    const BLANK_SUBJECT = {
        name: null,
        email: null,
        sendWelcomeEmail: true,
        password: null,
        url: null,
        description: null,
        locale: null,
        admin: null,
        suspended: null,
        autoUpdatePolicy: {
            driverUpdates: true,
            appUpdates: true,
            dataUpdates: true,
            newStuff: true
        }
    };

    export default {
        data () {
            return {
                currentUser: util.currentUser(),
                linkPrefix: null,
                me: null,
                admin: false,
                newUser: null,
                submitted: false,
                subject: Object.assign({}, BLANK_SUBJECT)
            };
        },
        computed: {
            ...mapState('users', ['user']),
            ...mapState('system', ['messages', 'configs'])
        },
        created () {
            this.me = this.$route.path === '/me' || this.$route.path.startsWith('/me/');
            if (this.me) {
                this.linkPrefix = '/me';
                if (this.currentUser === null) {
                    this.admin = false;
                    console.warn('ProfilePage.created: /me requested but no currentUser, sending to home page');
                    this.$router.push('/');
                    return;

                } else {
                    this.admin = this.currentUser.admin === true;
                    this.getUserById({
                        userId: this.currentUser.name,
                        messages: this.messages,
                        errors: this.errors
                    });
                }

            } else if (this.currentUser.admin !== true) {
                console.warn('ProfilePage.created: not admin and path not /me, sending to /me ...');
                this.$router.push('/me');
                return;

            } else {
                this.admin = this.currentUser.admin === true;
                this.newUser = typeof this.$route.params.id === 'undefined' || this.$route.params.id === null || this.$route.params.id === '';
                if (!this.newUser) {
                    this.linkPrefix = '/admin/accounts/' + this.$route.params.id;
                    this.getUserById({
                        userId: this.$route.params.id,
                        messages: this.messages,
                        errors: this.errors
                    });
                } else {
                    this.linkPrefix = null;
                    console.log('setting subject to new user');
                    this.subject = Object.assign({}, BLANK_SUBJECT);
                    console.log('set subject='+JSON.stringify(this.subject));
                }
            }
        },
        beforeRouteUpdate (to, from, next) {
            // react to route changes...
            console.log('this.router.params='+JSON.stringify(this.$router.params));
            next();
        },
        methods: {
            ...mapActions('users', ['createUser', 'updateUser', 'updateSelf', 'getUserById']),
            ...mapGetters('users', ['loading']),
            handleSubmit (e) {
                const updatedProfile = {
                    name: this.subject.name,
                    url: this.subject.url,
                    description: this.subject.description,
                    locale: this.subject.locale,
                    admin: this.subject.admin,
                    suspended: this.subject.suspended,
                    autoUpdatePolicy: this.subject.autoUpdatePolicy
                };
                this.submitted = true;
                this.errors.clear();
                this.$validator.validate().then(valid => {
                    if (valid) {
                        if (this.newUser) {
                            updatedProfile.contact = {
                                type: 'email',
                                info: this.subject.email
                            };
                            updatedProfile.sendWelcomeEmail = this.subject.sendWelcomeEmail;
                            updatedProfile.password = this.subject.password;
                            updatedProfile.agreeToTerms = true;
                            this.createUser({user: updatedProfile, messages: this.messages, errors: this.errors});
                        } else {
                            this.updateUser({user: updatedProfile, messages: this.messages, errors: this.errors});
                        }
                    } else {
                        console.log('invalid!');
                    }
                });
            }
        },
        watch: {
            user (u) {
                if (u) {
                    console.log('watch.user: received: '+JSON.stringify(u));
                    if (this.submitted) {
                        console.log('watch.user: action was successful, refreshing page');
                        if (this.me) {
                            this.$router.push('/');
                        } else if (this.admin) {
                            this.$router.push('/admin/accounts');
                        } else {
                            this.$router.push('/');
                        }
                    } else {
                        this.subject = u;
                    }
                }
            }
        }
    };
</script>