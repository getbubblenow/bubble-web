<template>
    <div>
        <h2>{{messages.form_title_model_setup}}</h2>
        <form @submit.prevent="setupModel">
            <div class="form-group">
                <label for="configType">{{messages.field_label_entity_type}}</label>
                <select v-model="configType" name="configType" class="form-control">
                    <option v-for="opt in system.configs.entityClasses" v-bind:value="opt">{{opt}}</option>
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
                configType: system.configs.entityClasses[0]
            };
        },
        computed: {
            ...mapState('system', ['configs', 'messages'])
        },
        created () {
            const locale = 'detect';
            this.loadSystemConfigs();  // determine if we can show the registration link
            this.loadMessages('pre_auth', locale);
            this.loadMessages('post_auth', locale);

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