<template>
    <div>
        <h1>Hi {{account.user.name}}!</h1>
        <em v-if="users.loading">Loading users...</em>
        <span v-if="users.error" class="text-danger">ERROR: {{users.error}}</span>
        <ul v-if="users.items">
            <li v-for="user in users.items" :key="user.id">
                {{user.name}}
                <span v-if="user.deleting"><em> - Deleting...</em></span>
                <span v-else-if="user.deleteError" class="text-danger"> - ERROR: {{user.deleteError}}</span>
                <span v-else>
                     <router-link to="/me">Edit</router-link>
                    <span v-if="user.name !== account.user.name">
                        - <a @click="deleteUser(user.uuid)" class="text-danger">Delete</a>
                    </span>
                </span>
            </li>
        </ul>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex'

    export default {
        computed: {
            ...mapState({
                account: state => state.account,
                users: state => state.users
            })
        },
        created () {
            this.getAllUsers();
        },
        methods: {
            ...mapActions('users', {
                getAllUsers: 'getAll',
                deleteUser: 'delete'
            }),
            ...mapGetters('users', ['loading'])
        }
    };
</script>