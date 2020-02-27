<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://git.bubblev.org/bubblev/bubble/src/branch/master/LICENSE.md -->
<template>
    <div>
        <h2>{{messages.title_legal_topics}}</h2>
        <hr/>
        <div v-if="topics && topics.length > 0" v-for="topic in topics">
            <a :href="topic.link"><h5>{{topic.label}}</h5></a><br/>
            <hr/>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    export default {
        data() {
            return {
                topics: null
            }
        },
        computed: {
            ...mapState('system', ['messages'])
        },
        created() { this.initTopics(); },
        methods: {
            initTopics () {
                if (this.messages.legal_topics) {
                    const tops = [];
                    const topicNames = this.messages.legal_topics.split(',');
                    for (let i=0; i<topicNames.length; i++) {
                        const topicName = topicNames[i];
                        tops.push({
                            label: this.messages['legal_'+ topicName],
                            link: this.messages['legal_'+ topicName+'_link']
                        })
                    }
                    this.topics = tops;
                }
            }
        },
        watch: {
            messages (m) {
                if (m) this.initTopics();
            }
        }
    };
</script>