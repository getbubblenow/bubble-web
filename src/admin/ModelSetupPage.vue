<template>
    <div>
        <h2>{{messages.form_title_model_setup}}</h2>
        <form @submit.prevent="setupModel">
            <div class="form-group">
                <label for="configType">{{messages.field_label_entity_type}}</label>
                <select v-model="configType" name="configType" class="form-control">
                    <option v-for="opt in this.configs.entityClasses" v-bind:value="opt.value">{{opt.name}}</option>
                </select>
            </div>
        </form>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex'

    export default {
        data() {
            return {
                configType: 'Account'
            };
        },
        computed: {
            ...mapState('account', ['locale']),
            ...mapState('system', ['configs', 'messages'])
        },
        created () {
            this.loadSystemConfigs(); // ensure config.entityClasses is refreshed
            this.loadMessages('pre_auth', this.locale);
            this.loadMessages('post_auth', this.locale);
        },
        methods: {
            // ...mapActions('system', ['loadIsActivated', 'activate']),
            ...mapActions('system', ['loadIsActivated', 'loadSystemConfigs', 'loadMessages', 'loadTimezones']),
            setupModel(e) {
                console.log('setupModel called');
            }
        }
    };
</script>