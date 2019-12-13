<template>
    <div>
        <h2>Edit Profile</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="name">Username</label>
                <input type="text" v-model="name" name="name" class="form-control" :class="{ 'is-invalid': submitted && !name }" />
                <div v-show="submitted && !name" class="invalid-feedback">Name is required</div>
            </div>
            <div class="form-group">
                <label htmlFor="url">Url</label>
                <input type="text" v-model="url" name="url" class="form-control"/>
            </div>
            <div class="form-group">
                <label htmlFor="description">Description</label>
                <input type="text" v-model="description" name="description" class="form-control"/>
            </div>
            <div class="form-group">
                <label for="admin">Admin</label>
                <input type="checkbox" id="admin" v-model="admin">
            </div>
            <div class="form-group">
                <label for="suspended">Suspended</label>
                <input type="checkbox" id="suspended" v-model="suspended">
            </div>
            <div>
                <h3>Auto-Update Policy</h3>
                <div class="form-group">
                    <label for="autoUpdatePolicy.driverUpdates">Drivers</label>
                    <input type="checkbox" id="autoUpdatePolicy.driverUpdates" v-model="autoUpdatePolicy.driverUpdates">
                </div>
                <div class="form-group">
                    <label for="autoUpdatePolicy.appUpdates">Apps</label>
                    <input type="checkbox" id="autoUpdatePolicy.appUpdates" v-model="autoUpdatePolicy.appUpdates">
                </div>
                <div class="form-group">
                    <label for="autoUpdatePolicy.dataUpdates">App Data</label>
                    <input type="checkbox" id="autoUpdatePolicy.dataUpdates" v-model="autoUpdatePolicy.dataUpdates">
                </div>
                <div class="form-group">
                    <label for="autoUpdatePolicy.newStuff">New Drivers/Apps</label>
                    <input type="checkbox" id="autoUpdatePolicy.newStuff" v-model="autoUpdatePolicy.newStuff">
                </div>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="status.updating">Update</button>
                <img v-show="status.updating" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>
        </form>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'
    import { account } from '../_store/account.module'
    import { currentUser } from '../_helpers'

    export default {
        data () {
            if (this.$router.params && this.$router.params.uuid) {
                return {
                    ...this.loadUser($this.router.params.uuid),
                    submitted: false
                }
            }
            return {
                ...currentUser(),
                submitted: false
            };
        },
        computed: {
            ...mapState('account', ['status'])
        },
        methods: {
            ...mapActions('users', ['update', 'loadUser']),
            handleSubmit (e) {
                this.submitted = true;
                const updatedProfile = {
                    uuid: this.uuid,
                    name: this.name,
                    url: this.url,
                    description: this.description,
                    admin: this.admin,
                    suspended: this.suspended,
                    autoUpdatePolicy: this.autoUpdatePolicy
                };
                if (this.name) {
                    this.update(updatedProfile);
                }
            }
        }
    };
</script>