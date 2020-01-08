<template>
    <div class="invalid-feedback d-block">
        <h5>{{messages.message_payment_not_supported}}</h5>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    export default {
        computed: { ...mapState('system', ['messages']) }
    };
</script>