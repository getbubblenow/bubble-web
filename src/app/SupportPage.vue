<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div>
        <h2>{{messages.title_support}}</h2>
        <hr/>
        <h5>{{messages.support_preamble}}</h5>
        <hr/>
        <div v-if="configs && configs.support && configs.support.site">
            <h4><a :href="configs.support.site">{{messages.support_site_link}}</a></h4>
            <hr/>
        </div>
        <div v-if="configs && configs.support && configs.support.email">
            <h4><a :href="'mailto:'+configs.support.email">{{messages.support_email_link}}</a></h4>
            <hr/>
        </div>
        <div v-if="hasNoSupport">
            <h4>{{messages.support_not_available}}</h4>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    export default {
        data() {
            return {}
        },
        computed: {
            ...mapState('system', ['messages', 'configs']),
            hasNoSupport () {
                const configs = this.configs;
                if (configs && configs.support) {
                    if (configs.support.email) return false;
                    if (configs.support.site) return false;
                }
                return true;
            }
        }
    };
</script>