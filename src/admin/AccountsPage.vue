<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://bubblev.com/bubble-license/ -->
<template>
    <div>
        <h2>{{messages.table_title_accounts}}</h2>

        <em v-if="loading()">Loading users...</em>

        {{messages.label_field_account_search}}: <input type="text" v-model="query.filter" width="40"/>
        <button @click="refreshData()" :disabled="loading()">{{messages.button_label_app_data_refresh}}</button>

        <hr/>
        <router-link :to="{ path: '/admin/new_account' }">{{messages.message_new_account}}</router-link>

        <div v-if="users && users.results && users.results.length > 0">
            <div v-for="user in users.results">
                <hr/>
                <router-link :to="{ path: '/admin/accounts/'+ user.name }">{{user.name}}</router-link>
                <span v-if="user.admin === true"> - {{messages.label_field_account_admin}}</span>
                <span v-if="user.suspended === true"> - {{messages.label_field_account_suspended}}</span>

                <span v-if="typeof user.lastLogin === 'undefined' || user.lastLogin === null"> - {{messages.message_account_lastLogin_neverLoggedIn}}</span>
                <span v-else> - {{messages.label_field_account_lastLogin_format.parseDateMessage(user.lastLogin, messages)}}</span>

                <span v-if="user.deleted !== null"> - {{messages.label_field_account_deleted_format.parseDateMessage(user.deleted, messages)}}</span>

                <span v-if="user.name !== currentUser.name && currentUser.admin">
                    <button v-if="user.deleted === null" @click="doDelete(user.name)" :disabled="loading()">{{messages.button_label_delete_account}}</button>
                    <button v-else @click="doDelete(user.name)" :disabled="loading()">{{messages.button_label_force_delete_account}}</button>
                </span>
            </div>

            <div v-if="hasPrevPage() || hasNextPage()">
                <span align="left" v-if="hasPrevPage()" nowrap="nowrap">
                    <button @click="prevPage()" :disabled="loading()">{{messages.message_app_data_previous_page}}</button>
                </span>
                <span align="right" v-if="hasNextPage()" nowrap="nowrap">
                    <button @click="nextPage()" :disabled="loading()">{{messages.message_app_data_next_page}}</button>
                </span>
            </div>
        </div>
        <div v-else>
            {{messages.message_empty_accounts}}
        </div>

        <hr/>
        <router-link :to="{ path: '/admin/new_account' }">{{messages.message_new_account}}</router-link>

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../_helpers';

    export default {
        data() {
            return {
                currentUser: util.currentUser(),
                lastAction: null,
                query: {
                    pageNumber: 1,
                    pageSize: 20,
                    filter: ''
                }
            }
        },
        computed: {
            ...mapState('users', ['users']),
            ...mapState('system', ['messages']),
        },
        created () {
            this.refreshData();
        },
        methods: {
            ...mapActions('users', ['searchAccounts', 'deleteUser']),
            ...mapGetters('users', ['loading']),
            hasPrevPage () { return this.query.pageNumber > 1; },
            hasNextPage () {
                return this.users.totalCount && (this.users.totalCount > (this.query.pageNumber * this.query.pageSize));
            },
            nextPage () {
                this.query.pageNumber++;
                this.refreshData();
            },
            prevPage () {
                this.query.pageNumber--;
                this.refreshData();
            },
            refreshData () {
                this.searchAccounts({
                    query: this.query,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            doDelete (name) {
                this.lastAction = 'delete';
                this.deleteUser({
                    userId: name,
                    messages: this.messages,
                    errors: this.errors
                });
            }
        },
        watch: {
            users (uList) {
                if (uList !== null && this.lastAction !== null) {
                    console.log('watch.users: updated, refreshing...');
                    this.lastAction = null;
                    this.refreshData()
                }
            }
        }
    };
</script>