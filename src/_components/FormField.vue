<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://bubblev.com/bubble-license/ -->
<template>
    <div v-if="field" class="form-group">

        <label :htmlFor="field">{{messages[messagePrefix+field.name]}}:</label>

        <span v-if="field.mode === 'readOnly' && field.control === 'flag'"><b>{{messages['message_'+thing[field.name]]}}</b></span>
        <span v-else-if="field.mode === 'readOnly'"><b>{{thing[field.name]}}</b></span>
        <textarea v-else-if="field.control === 'textarea' || (textLimit != null && (''+thing[field.name]).length > textLimit)" v-model="thing[field.name]" class="form-control"></textarea>
        <input v-else-if="field.control === 'flag'" type="checkbox" v-model="thing[field.name]" :name="field" class="form-control" />
        <input v-else type="text" v-model="thing[field.name]" :name="field" class="form-control" />

        <small v-if="messages['!'+messagePrefix+field.name+'_description']">{{messages[messagePrefix+field.name+'_description']}}</small>
<!--        <div v-if="errors.has(field)" class="invalid-feedback d-block">{{ errors.first(field) }}</div>-->
    </div>

</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import { util } from '../_helpers'

    export default {
        props: {
            messagePrefix: String,
            field: Object,
            thing: Object,
            textLimit: Number
        },
        computed: {
            ...mapState('system', ['messages'])
        }
    }
</script>