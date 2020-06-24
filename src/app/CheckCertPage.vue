<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div>
        <h2>{{messages.title_check_certificate}}</h2>
        <hr/>
        <div v-if="cert_verified !== null">
            <h4>{{messages['check_cert_'+cert_verified]}}</h4> ({{cert_verified}})
        </div>
<!--        <iframe style="visibility: hidden" id="cert_check_frame" v-if="configs && configs.certValidationHost" :src="'https://'+configs.certValidationHost" @load="frameLoaded()"></iframe>-->
        <iframe id="cert_check_frame" v-if="configs && configs.certValidationHost" :src="'https://'+configs.certValidationHost" @load="frameLoaded()"></iframe>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'
    export default {
        data() {
            return {
                cert_verified: null
            }
        },
        computed: {
            ...mapState('system', ['messages', 'configs'])
        },
        created() {
            this.loadSystemConfigs();
            const vue = this;
            window.setTimeout(() => {
                if (vue.cert_verified === null) vue.cert_verified = false;
            }, 10000);
        },
        methods: {
            ...mapActions('system', ['loadSystemConfigs']),
            frameLoaded() {
                console.log('frame loaded!');
                this.cert_verified = true;
            }
        }
    };
</script>