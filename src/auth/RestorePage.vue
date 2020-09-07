<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/ -->
<template>
    <div>
        <h2>{{ messages.form_title_restore }}</h2>

        <div v-if="!configs"><img :src="loadingImgSrc" /></div>

        <div v-else-if="configs.restoreInProgress" class="alert alert-info">
            {{ messages.message_restore_in_progress }}<hr/>
            <a href="/">{{ messages.message_back_to_root }}</a>
        </div>

        <div v-else>
            <form @submit.prevent="handleSubmit">
                <fieldset :disabled="status.uploadingRestoreRequestData">
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
                        <div style="border: 2px solid #000;">
                            <label htmlFor="restoreLongNetworkKeyFile">
                                {{ messages.field_label_restore_long_key }}
                            </label>
                            <input type="file" ref="restoreLongNetworkKeyFile" @change="readUploadedKeyFile"
                                class="form-control" :class="{ 'is-invalid': fileFieldsConstaintFailed }" />
                            <div v-if="submitted && errors.has('restoreLongNetworkKey')"
                                 class="invalid-feedback d-block">
                                {{ errors.first('restoreLongNetworkKey') }}
                            </div>

                            <div style="text-align: center">{{ messages.label_or }}</div>

                            <label htmlFor="restoreBackupPackageFile">
                                {{ messages.field_label_restore_backup_package }}
                            </label>
                            <input type="file" ref="restoreBackupPackageFile" @change="setBackupFileForUpload"
                                class="form-control" :class="{ 'is-invalid': fileFieldsConstaintFailed }" />
                            <div v-if="submitted && errors.has('restoreBackupPackageFileRef')"
                                 class="invalid-feedback d-block">
                                {{ errors.first('restoreBackupPackageFileRef') }}
                            </div>
                        </div>

                        <div class="invalid-feedback" :class="{ 'd-block': fileFieldsConstaintFailed }">
                            {{ messages.err_restoreFile_constraint }}
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
                        <button class="btn btn-primary" :disabled="status.uploadingRestoreRequestData">
                            {{ messages.button_label_restore }}
                        </button>
                        <img v-show="status.uploadingRestoreRequestData" :src="loadingImgSrc" />
                    </div>
                </fieldset>
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
            restoreBackupPackageFileRef: null,
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
        ...mapState('system', [ 'configs', 'messages' ]),
        fileFieldsConstaintFailed() {
            // only and exactly 1 file may be uploaded - either file including long network key, or full backup package
            return this.submitted && ((!this.restoreLongNetworkKey && !this.restoreBackupPackageFileRef)
                                      || (this.restoreLongNetworkKey && this.restoreBackupPackageFileRef))
        }
    },
    methods: {
        ...mapActions('account', [ 'restore', 'restoreFromPackage' ]),
        ...mapActions('system', [ 'loadSystemConfigs' ]),
        handleSubmit (e) {
            this.errors.clear();
            const { restoreShortKey, password } = this;
            this.submitted = true;
            if (!this.fileFieldsConstaintFailed) {
                if (this.restoreLongNetworkKey) {
                    this.restore({
                        shortKey: restoreShortKey, longKey: this.restoreLongNetworkKey, password: password,
                        systemConfigs: this.configs, messages: this.messages, errors: this.errors
                    });
                } else if (this.restoreBackupPackageFileRef) {
                    this.restoreFromPackage({
                        shortKey: restoreShortKey, backupFileRef: this.restoreBackupPackageFileRef, password: password,
                        systemConfigs: this.configs, messages: this.messages, errors: this.errors
                    });
                }
            }
        },
        readUploadedKeyFile() {
            var uploadedFile = this.$refs.restoreLongNetworkKeyFile.files[0];
            var reader = new FileReader();
            reader.onload = (event) => this.restoreLongNetworkKey = event.target.result;
            reader.readAsText(uploadedFile);
        },
        setBackupFileForUpload() {
            this.restoreBackupPackageFileRef = this.$refs.restoreBackupPackageFile.files[0];
        }
    }
};
</script>
