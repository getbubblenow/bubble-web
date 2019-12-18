<template>
    <div>
        <h2>{{messages.form_label_title_account_policy}}</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label htmlFor="url">{{messages.field_label_policy_account_deletion}}</label>
                <select v-model="policy.deletionPolicy" name="deletionPolicy" class="form-control">
                    <option v-for="opt in accountDeletionOptions" v-bind:value="opt">{{messages['account_deletion_name_'+opt]}}</option>
                </select>
                <span>{{messages['account_deletion_description_'+policy.deletionPolicy]}}</span>
                <div v-if="submitted && errors.has('deletionPolicy')" class="invalid-feedback">{{ errors.first('deletionPolicy') }}</div>
            </div>
        </form>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'

    export default {
        data() {
            return {submitted: false}
        },
        computed: {
            ...mapState('account', {
                currentUser: state => state.user,
                status: state => state.status
            }),
            ...mapState('system', ['messages', 'accountDeletionOptions']),
            ...mapState('users', ['policy'])
        },
        methods: {
            ...mapActions('users', ['getPolicyByUuid', 'updatePolicyByUuid', 'addPolicyContactByUuid', 'removePolicyContactByTypeAndInfo']),
            handleSubmit(e) {
                console.log('submitting with deletionPolicy='+this.policy.deletionPolicy);
            }
        },
        created () {
            this.getPolicyByUuid({uuid: this.currentUser.uuid, messages: this.messages, errors: this.errors});
        }
    };
</script>