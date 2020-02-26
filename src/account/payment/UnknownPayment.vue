<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://git.bubblev.org/bubblev/bubble/src/branch/master/LICENSE.md -->
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