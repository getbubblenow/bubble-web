<template>
    <div>
        <h2>{{messages.form_title_model_setup}}</h2>
        <form @submit.prevent="setupModel">
            <div class="form-group">
                <label for="type">{{messages.field_label_entity_type}}</label>
                <select @change="selectType()" v-model="type" name="type" class="form-control">
                    <option v-for="opt in this.configs.entityClasses" v-bind:value="opt.value">{{opt.name}}</option>
                </select>
            </div>
        </form>

        <table border="1" v-if="this.ec && this.ec[this.lcType] && this.ec[this.lcType].listFields">
            <thead>
            <tr>
                <td v-for="field in this.ec[this.lcType].listFields">{{field}}</td>
            </tr>
            </thead>
            <tbody v-if="this.results && this.results.results">
            <tr v-for="row in this.results.results">
                <td v-for="field in ec[lcType].listFields">{{row[field]}}</td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex'

    export default {
        data() {
            return {
                ec: {},
                type: 'bubble.model.account.Account',
                query: {
                    query: '',
                    page: 1,
                    size: 10,
                    sort: ''
                },
                results: []
            };
        },
        computed: {
            ...mapState('account', ['locale']),
            ...mapState('system', ['configs', 'messages', 'entityConfigs', 'searchResults']),
            lcType () { return this.type.toLowerCase(); }
        },
        created () {
            this.loadEntityConfigs();
            this.loadSystemConfigs(); // ensure config.entityClasses is refreshed
            this.loadMessages('pre_auth', this.locale);
            this.loadMessages('post_auth', this.locale);
            this.selectType();
        },
        methods: {
            // ...mapActions('system', ['loadIsActivated', 'activate']),
            ...mapActions('system', [
                'loadIsActivated', 'loadSystemConfigs', 'loadMessages', 'loadTimezones', 'loadEntityConfigs', 'search'
            ]),
            setupModel(e) {
                console.log('setupModel called');
            },
            selectType() {
                this.search(this.type, this.query);
            }
        },
        watch: {
            entityConfigs (configs) {
                if (configs) this.ec = configs;
            },
            searchResults (results) {
                console.log('updating this.results='+JSON.stringify(results));
                if (results) this.results = results;
            }
        }
    };
</script>