<template>
    <div>
        <h2>{{messages.form_label_title_account_policy}}</h2>
        <form @submit.prevent="handleSubmit">
            <hr/>
            <div class="form-group">
                <label htmlFor="url">{{messages.field_label_policy_account_deletion}}</label>
                <select v-model="deletionPolicy" name="deletionPolicy" class="form-control">
                    <option v-for="opt in accountDeletionOptions" v-bind:value="opt">{{messages['account_deletion_name_'+opt]}}</option>
                </select>
                <span>{{messages['account_deletion_description_'+policy.deletionPolicy]}}</span>
                <div v-if="submitted && errors.has('deletionPolicy')" class="invalid-feedback d-block">{{ errors.first('deletionPolicy') }}</div>
            </div>

            <hr/>
            <div class="form-group">
                <label htmlFor="accountOperationTimeout">{{messages.field_label_policy_account_operation_timeout}}</label>
                <input type="number" v-model="accountOperationTimeout" name="accountOperationTimeout" class="form-control"/>
                <select v-model="accountOperationTimeoutUnits" name="accountOperationTimeoutUnits" class="form-control">
                    <option v-for="opt in timeDurationOptions" v-bind:value="opt">{{messages['time_duration_'+opt]}}</option>
                </select>
                <div v-if="submitted && errors.has('accountOperationTimeout')" class="invalid-feedback d-block">{{ errors.first('accountOperationTimeout') }}</div>
                <span>{{messages.field_label_policy_account_operation_timeout_description}}</span>
            </div>

            <hr/>
            <div class="form-group">
                <label htmlFor="nodeOperationTimeout">{{messages.field_label_policy_node_operation_timeout}}</label>
                <input type="number" v-model="nodeOperationTimeout" name="nodeOperationTimeout" class="form-control"/>
                <select v-model="nodeOperationTimeoutUnits" name="nodeOperationTimeoutUnits" class="form-control">
                    <option v-for="opt in timeDurationOptions" v-bind:value="opt">{{messages['time_duration_'+opt]}}</option>
                </select>
                <div v-if="submitted && errors.has('nodeOperationTimeout')" class="invalid-feedback d-block">{{ errors.first('nodeOperationTimeout') }}</div>
                <span>{{messages.field_label_policy_node_operation_timeout_description}}</span>
            </div>

            <hr/>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="policyStatus.updating">{{messages.button_label_update_policy}}</button>
                <img v-show="policyStatus.updating" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>

        </form>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'

    export default {
        data() {
            return {
                submitted: false,
                deletionPolicy: '',
                accountOperationTimeout: '',
                accountOperationTimeoutUnits: '',
                nodeOperationTimeout: '',
                nodeOperationTimeoutUnits: ''
            }
        },
        computed: {
            ...mapState('account', {
                currentUser: state => state.user
            }),
            ...mapState('system', ['messages', 'accountDeletionOptions', 'timeDurationOptions', 'timeDurationOptionsReversed']),
            ...mapState('users', ['policy', 'policyStatus'])
        },
        methods: {
            ...mapActions('users', ['getPolicyByUuid', 'updatePolicyByUuid', 'addPolicyContactByUuid', 'removePolicyContactByTypeAndInfo']),
            handleSubmit(e) {
                this.submitted = true;
                this.updatePolicyByUuid({
                    uuid: this.currentUser.uuid,
                    policy: {
                        deletionPolicy: this.deletionPolicy,
                        accountOperationTimeout: this.messages.durationToMillis(this.accountOperationTimeout, this.accountOperationTimeoutUnits),
                        nodeOperationTimeout: this.messages.durationToMillis(this.nodeOperationTimeout, this.nodeOperationTimeoutUnits)
                    },
                    messages: this.messages,
                    errors: this.errors
                });
            }
        },
        watch: {
            policy (p) {
                // console.log('watch.policy: received: '+JSON.stringify(p));
                if (typeof p.deletionPolicy !== 'undefined' && p.deletionPolicy !== null) {
                    this.deletionPolicy = p.deletionPolicy;
                }
                if (typeof p.accountOperationTimeout !== 'undefined' && p.accountOperationTimeout !== null) {
                    const parts = this.messages.millisToDuration(p.accountOperationTimeout);
                    this.accountOperationTimeout = parts.count;
                    this.accountOperationTimeoutUnits = parts.units;
                }
                if (typeof p.nodeOperationTimeout !== 'undefined' && p.nodeOperationTimeout !== null) {
                    const parts = this.messages.millisToDuration(p.nodeOperationTimeout);
                    this.nodeOperationTimeout = parts.count;
                    this.nodeOperationTimeoutUnits = parts.units;
                }
            }
        },
        created () {
            this.getPolicyByUuid({uuid: this.currentUser.uuid, messages: this.messages, errors: this.errors});
        }
    };
</script>