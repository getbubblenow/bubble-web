<template>
    <div>
        <div v-if="field && thing[field.name] !== null && thing[field.name] !== ''">

            {{messages[messagePrefix+field.name]}}:

            <span v-if="typeof thing[field.name] === 'boolean'">
                {{messages['message_'+thing[field.name]]}}
            </span>
            <span v-else-if="hasCustomDateFormat(field.name)">
                {{ messages[customDateMessagePrefix+field.name+'_format'].parseDateMessage(thing[field.name], messages) }}
            </span>
            <span v-else-if="field.name === 'expiration'">
                <span v-if="thing[field.name] !== null && thing[field.name] > 0">{{messages.date_format_app_data_expiration.parseDateMessage(thing[field.name], messages)}}</span>
                <span v-else>{{messages.message_app_data_no_expiration}}</span>
            </span>
            <span v-else-if="messages['!'+messagePrefix+field.name+'_format']">
                {{ messages[messagePrefix+field.name+'_format'].parseDateMessage(thing[field.name], messages) }}
            </span>
            <span v-else-if="messages['!'+messagePrefix+field.name+'_customFormat']">
                {{ messages[messagePrefix+field.name+'_customFormat'].parseMessage(this, {thing: thing, field: field, value: thing[field.name], ...thing}) }}
            </span>
            <span v-else-if="field.name === 'ctime' || field.name === 'mtime'">
                {{ messages.date_format_app_data_epoch_time.parseDateMessage(thing[field.name], messages) }}
            </span>
            <span v-else-if="longTextExpandable !== true || textLimit === null || (''+thing[field.name]).length < textLimit">{{thing[field.name]}}</span>
            <span v-else-if="longTextExpandable === true">
                <span v-if="isExpanded(thing)" @click="toggleExpanded(thing)">{{thing[field.name]}}</span>
                <span v-else @click="toggleExpanded(thing)">{{ messages.message_truncated_show_ellipsis.parseMessage(this, { msg: (''+thing[field.name]).substring(0, 30) }) }}</span>
            </span>
            <span v-else>
                {{ messages.message_truncated_show_ellipsis.parseMessage(this, { msg: (''+thing[field.name]).substring(0, 30) }) }}
            </span>

        </div>

    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import { util } from '../_helpers'

    export default {
        props: {
            messagePrefix: String,
            customDateMessagePrefix: String,
            field: Object,
            thing: Object,
            textLimit: Number,
            longTextExpandable: Boolean
        },
        created() {
            // console.log('FieldDisplay.created: this.field='+this.field);
        },
        computed: {
            ...mapState('system', ['messages'])
        },
        methods: {
            hasCustomDateFormat(field) {
                return typeof this.customDateMessagePrefix !== 'undefined'
                    && this.customDateMessagePrefix !== null
                    && this.messages['!'+this.customDateMessagePrefix+field+'_format']
            }
        }
    }
</script>