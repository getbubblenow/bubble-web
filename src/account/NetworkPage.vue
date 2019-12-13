<template>
    <div>
        Single network page
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'

    export default {
        computed: {
            ...mapState({
                loading: state => state.loading,
                network: state => state.network,
                error: state => state.error
            })
        },
        created () {
            this.getById(this.$route.params.uuid);
        },
        methods: {
            ...mapActions('networks', {
                getById: 'getByUuid',
                deleteNetwork: 'delete'
            })
        }
    };
</script>