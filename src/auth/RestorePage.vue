<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div>
        <h2>{{ messages.form_title_restore }}</h2>

        <div v-if="!configs"><img :src="loadingImgSrc" /></div>

        <div v-else-if="configs.restoreInProgress" class="alert alert-info">
            {{ messages.message_restore_not_applicable }}<hr/>
            <a href="/">{{ messages.message_back_to_root }}</a>
        </div>

        <div v-else>
            <form @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label htmlFor="restoreShortKey">{{messages.field_label_restore_short_key}}</label>
                    <input type="text" v-model="restoreShortKey" name="restoreShortKey" class="form-control"
                        :class="{ 'is-invalid': submitted && !restoreShortKey }" />
                    <div v-show="submitted && !restoreShortKey" class="invalid-feedback">
                        {{ messages.err_restoreShortKey_required }}
                    </div>
                    <div v-if="submitted && errors.has('restoreShortKey')" class="invalid-feedback d-block">
                        {{ errors.first('restoreShortKey') }}
                    </div>
                </div>

                <div class="form-group">
                    <label htmlFor="restoreLongNetworkKey">{{messages.field_label_restore_long_key}}</label>
                    <textarea v-model="restoreLongNetworkKey" name="restoreLongNetworkKey" class="form-control"
                                :class="{ 'is-invalid': submitted && !restoreLongNetworkKey }" />
                    <div v-show="submitted && !restoreLongNetworkKey" class="invalid-feedback">
                        {{ messages.err_restoreLongNetworkKey_required }}
                    </div>
                    <div v-if="submitted && errors.has('restoreLongNetworkKey')" class="invalid-feedback d-block">
                        {{ errors.first('restoreLongNetworkKey') }}
                    </div>
                </div>

                <div class="form-group">
                    <label htmlFor="password">{{messages.field_label_password}}</label>
                    <input type="password" v-model="password" name="password" class="form-control"
                            :class="{ 'is-invalid': submitted && !password }" />
                    <div v-show="submitted && !password" class="invalid-feedback">
                        {{ messages.err_password_required }}
                    </div>
                    <div v-if="submitted && errors.has('password')" class="invalid-feedback d-block">
                        {{ errors.first('password') }}
                    </div>
                </div>

                <div class="form-group">
                    <button class="btn btn-primary" :disabled="status.restoring">
                        {{ messages.button_label_restore }}
                    </button>
                    <img v-show="status.restoring" :src="loadingImgSrc" />
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { loadingImgSrc } from '~/_store';

export default {
    data () {
        return {
            restoreShortKey: (this.$route.query && this.$route.query.k) ? this.$route.query.k : null,
            restoreLongNetworkKey: null,
            password: '',
            submitted: false,
            loadingImgSrc: loadingImgSrc
        }
    },
    created () {
        this.loadSystemConfigs();
    },
    computed: {
        ...mapState('account', [ 'status' ]),
        ...mapState('system', [ 'configs', 'messages' ])
    },
    methods: {
        ...mapActions('account', [ 'restore' ]),
        ...mapActions('system', [ 'loadSystemConfigs' ]),
        handleSubmit (e) {
            this.errors.clear();
            this.submitted = true;
            const { restoreShortKey, restoreLongNetworkKey, password } = this;
            this.restore({
                shortKey: restoreShortKey, longKey: restoreLongNetworkKey, password: password,
                systemConfigs: this.configs, messages: this.messages, errors: this.errors
            });
        }
    }
};
</script>
