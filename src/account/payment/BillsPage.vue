<template>
    <div>
        <h4>{{messages.title_bills}}<span v-if="this.me === false"> - {{this.userId}}</span></h4>
        <table border="1">
            <thead>
            <tr>
                <td>{{messages.label_bill_period}}</td>
                <td>{{messages.label_bill_plan}}</td>
                <td>{{messages.label_bill_status}}</td>
                <td>{{messages.label_bill_total}}</td>
            </tr>
            </thead>
            <tbody v-if="billObjects">
            <tr v-for="bill in billObjects">
                <td>{{bill.periodStart}} - {{bill.periodEnd}} ({{bill.periodLabel}})</td>
                <td>{{messages['plan_name_'+bill.planObject.name]}}</td>
                <td>{{messages['bill_status_'+bill.status]}}</td>
                <td>
                    {{messages.label_bill_total_format.parseExpression({messages: messages, ...bill})}}
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../../_helpers';
    import { Settings } from 'luxon';

    export default {
        data() {
            return {
                me: null,
                userId: null,
                linkPrefix: null,
                currentUser: util.currentUser(),
                billObjects: null
            };
        },
        computed: {
            ...mapState('system', ['messages']),
            ...mapState('bills', ['bills'])
        },
        methods: {
            ...mapActions('bills', ['getAllBillsByAccount']),
            ...mapGetters('bills', ['loading'])
        },
        watch: {
            bills (b) {
                if (b && b.length && b.length > 0) {
                    const billObjects = [];
                    for (let i=0; i<b.length; i++) {
                        const bill = b[i];
                        bill['totalMajorUnits'] = bill.total / 100;
                        bill['totalMinorUnits'] = bill.total % 100;
                        billObjects.push(bill);
                    }
                    this.billObjects = billObjects;
                }
            }
        },
        created () {
            this.me = this.$route.path.startsWith('/me/');
            if (this.me) {
                this.linkPrefix = '/me';
                if (this.currentUser === null) {
                    console.warn('BillsPage.created: /me requested but no currentUser, sending to home page');
                    this.$router.push('/');
                    return;

                } else {
                    this.userId = this.currentUser.uuid;
                }

            } else if (this.currentUser.admin !== true) {
                console.warn('BillsPage.created: not admin and path not /me, sending to /me ...');
                this.$router.push('/me');
                return;

            } else if (typeof this.$route.params.id === 'undefined' || this.$route.params.id === null) {
                console.warn('BillsPage.created: no id param found, sending to accounts page');
                this.$router.push('/admin/accounts');
                return;

            } else {
                this.userId = this.$route.params.id;
                this.linkPrefix = '/admin/accounts/' + this.userId;
            }
            this.getAllBillsByAccount({userId: this.userId, messages: this.messages, errors: this.errors});
        }
    };
</script>