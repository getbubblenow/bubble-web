<template>
    <div>
        This site is not configured to handle payments of this type
    </div>
</template>

<script>
    export default {
        created () {
            console.log('UnknownPayment.vue: created, paymentMethod='+JSON.stringify(this.paymentMethod));
        }
    };
</script>