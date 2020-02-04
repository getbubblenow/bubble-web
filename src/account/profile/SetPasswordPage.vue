<template>
    <div>
        <h2>{{messages.form_title_set_password}}</h2>

        <h4 v-if="submitted && errors.has('approvalToken')" class="invalid-feedback d-block">{{ errors.first('approvalToken') }}</h4>

        <form @submit.prevent="setPass()">
            <div class="form-group">
                <label htmlFor="newPassword">{{messages.field_label_new_password}}</label>
                <input type="password" v-validate="'required'" v-model="newPassword" name="newPassword" class="form-control"/>
                <div v-if="submitted && errors.has('password')" class="invalid-feedback d-block">{{ errors.first('password') }}</div>
            </div>
            <div class="form-group">
                <label htmlFor="newPasswordConfirm">{{messages.field_label_new_password_confirm}}</label>
                <input type="password" v-validate="'required'" v-model="newPasswordConfirm" name="newPasswordConfirm" class="form-control"/>
            </div>

            <div class="form-group">
                <button class="btn btn-primary" :disabled="loading()">{{messages.button_label_set_password}}</button>
                <img v-show="loading()" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>

        </form>

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../../_helpers';

    export default {
        data() {
            return {
                submitted: false,
                currentUser: util.currentUser(),
                newPassword: null,
                newPasswordConfirm: null,
                code: null
            }
        },
        computed: {
            ...mapState('users', ['user', 'policy', 'changePasswordResponse']),
            ...mapState('system', ['messages'])
        },
        methods: {
            ...mapActions("account", ['approveAction', 'denyAction']),
            ...mapActions('users', ['getUserById', 'getPolicyByUserId', 'changePassword']),
            ...mapGetters('users', ['loading']),
            setPass (e) {
                // todo: verify that newPassword === newPasswordConfirm
                this.errors.clear();
                this.submitted = true;
                this.approveAction({
                    userId: this.currentUser.uuid,
                    code: this.code,
                    data: [{name: 'password', value: this.newPassword}],
                    messages: this.messages,
                    errors: this.errors
                })
            }
        },
        created() {
            if (typeof this.$route.params.code === 'undefined' || this.$route.params.code === null || this.$route.params.code === '') {
                console.log('SetPasswordPage: no code found, sending to home');
                this.$router.push('/');
            }
            this.code = this.$route.params.code;
        },
        watch: {
            actionStatus (status) {
                if (status) {
                    console.log('watch.actionStatus: received: ' + JSON.stringify(status));
                }
            }
        }
    }
</script>