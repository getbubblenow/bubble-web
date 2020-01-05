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

        <div v-if="this.ec && this.ec[this.lcType] && this.ec[this.lcType].createMethod !== 'DISABLED'">
            <button @click="showingAddDialog = true">{{messages.button_label_add_entity}}</button>
            <div v-if="showingAddDialog">
                <textarea v-model="newEntityJson"></textarea>
                <button @click="createNewEntity()">{{messages.button_label_save_add_entity}}</button>
                <button @click="showingAddDialog = false">{{messages.button_label_close_add_entity}}</button>
            </div>
        </div>

        <table border="1" v-if="this.ec && this.ec[this.lcType] && this.ec[this.lcType].listFields && this.selectedEntity === null && !showingAddDialog">
            <thead>
            <tr>
                <td v-for="field in this.ec[this.lcType].listFields">{{field}}</td>
                <td>{{messages.button_label_view_entity}}</td>
<!--                <td>{{messages.button_label_edit_entity}}</td>-->
<!--                <td>{{messages.button_label_delete_entity}}</td>-->
            </tr>
            </thead>
            <tbody v-if="this.results && this.results.results">
            <tr v-for="row in this.results.results">
                <td v-for="field in ec[lcType].listFields">{{row[field]}}</td>
                <td><button @click="viewEntity(row)">{{messages.button_label_view_entity}}</button></td>
<!--                <td><button >{{messages.button_label_edit_entity}}</button></td>-->
<!--                <td><button >{{messages.button_label_delete_entity}}</button></td>-->
            </tr>
            </tbody>
        </table>

        <div style="min-height: 100%;" v-if="this.selectedEntity">
            <table border="1">
                <tr v-for="field in this.ec[this.lcType].fieldNames">
                    <td>{{field}}:</td>
                    <td>{{selectedEntity[field]}}</td>
                </tr>
                <tr>
                    <td>JSON:</td>
                    <td>{{JSON.stringify(selectedEntity)}}</td>
                </tr>
            </table>
            <button @click="closeEntity()">{{messages.button_label_close_view_entity}}</button>
        </div>
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
                results: [],
                selectedEntity: null,
                showingAddDialog: false,
                newEntityJson: ''
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
                'loadIsActivated', 'loadSystemConfigs', 'loadMessages', 'loadTimezones', 'loadEntityConfigs',
                'search', 'createEntity'
            ]),
            setupModel(e) {
                console.log('setupModel called');
            },
            selectType() {
                this.search(this.type, this.query);
            },
            viewEntity(row) {
                this.selectedEntity = row;
            },
            closeEntity() {
                this.selectedEntity = null;
            },
            createNewEntity() {
                console.log('this.newEntityJson='+this.newEntityJson);
                this.createEntity({entityConfig: this.ec[this.lcType], json: this.newEntityJson, messages: this.messages, errors: this.errors});
            }
        },
        watch: {
            entityConfigs (configs) {
                if (configs) this.ec = configs;
            },
            searchResults (results) {
                // console.log('updating this.results='+JSON.stringify(results));
                if (results) this.results = results;
            }
        }
    };
</script>