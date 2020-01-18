<template>
    <div>
        <h2>{{messages.form_title_login}}</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="name">{{messages.field_label_username}}</label>
                <input type="text" v-model="name" name="name" class="form-control" :class="{ 'is-invalid': submitted && !name }" />
                <div v-show="submitted && !name" class="invalid-feedback">Name is required</div>
                <div v-if="submitted && errors.has('account')" class="invalid-feedback">{{ errors.first('account') }}</div>
            </div>
            <div class="form-group">
                <label htmlFor="password">{{messages.field_label_password}}</label>
                <input type="password" v-model="password" name="password" class="form-control" :class="{ 'is-invalid': submitted && !password }" />
                <div v-show="submitted && !password" class="invalid-feedback">Password is required</div>
            </div>
            <div v-if="configs && configs.locked === true" class="form-group">
                <label htmlFor="unlockKey">{{messages.field_label_unlock_key}}</label>
                <input type="password" v-model="unlockKey" name="unlockKey" class="form-control" :class="{ 'is-invalid': submitted && !unlockKey }" />
                <div v-show="submitted && !unlockKey" class="invalid-feedback">Unlock Key is required</div>
                <div v-if="submitted && errors.has('unlockKey')" class="invalid-feedback">{{ errors.first('unlockKey') }}</div>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="status.loggingIn">{{messages.button_label_login}}</button>
                <img v-show="status.loggingIn" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                <router-link v-if="configs && configs.allowRegistration" to="/register" class="btn btn-link">{{messages.button_label_register}}</router-link>
            </div>
        </form>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { util } from '../_helpers'

export default {
    data () {
        return {
            name: '',
            password: '',
            unlockKey: (this.$route.params && this.$route.params.k) ? this.$route.params.k : null,
            submitted: false
        }
    },
    computed: {
        ...mapState('account', ['status']),
        ...mapState('system', ['configs', 'messages'])
    },
    methods: {
        ...mapActions('account', ['login', 'logout']),
        ...mapActions('system', ['loadSystemConfigs']),
        handleSubmit (e) {
            this.errors.clear();
            this.submitted = true;
            const { name, password, unlockKey } = this;
            if (name && password) {
                this.login({user: {name, password, unlockKey}, messages: this.messages, errors: this.errors});
            }
        }
    }
};
</script>