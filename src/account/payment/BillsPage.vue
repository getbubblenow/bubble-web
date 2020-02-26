<!-- Copyright (c) 2020 Bubble, Inc. All rights reserved. For personal (non-commercial) use, see license: https://git.bubblev.org/bubblev/bubble/src/branch/master/LICENSE.md -->
<template>
    <div>
        <h4>{{messages.title_bills}}<span v-if="this.me === false"> - {{this.userId}}</span></h4>

        <div v-if="billFocus">
            <div>{{messages.label_bill_period_start}}: {{billFocus.periodStart}}</div>
            <div>{{messages.label_bill_period_end}}: {{billFocus.periodEnd}}</div>
            <div>{{messages.label_bill_plan}}: {{messages['plan_name_'+billFocus.planObject.name]}}</div>
            <div>{{messages.label_bill_status}}: {{messages['bill_status_'+billFocus.status]}}</div>
            <div>{{messages.label_bill_total}}: {{messages.label_bill_total_format.parseExpression({messages: messages, ...billFocus, totalMajorUnits: billFocus.total/100, totalMinorUnits: billFocus.total%100})}}</div>

            <table border="1">
                <thead>
                <tr>
                    <td>{{messages.label_payment_type}}</td>
                    <td>{{messages.label_payment_method}}</td>
                    <td>{{messages.label_payment_status}}</td>
                    <td>{{messages.label_payment_amount}}</td>
                    <td>{{messages.label_payment_action}}</td>
                </tr>
                </thead>
                <tbody v-if="billFocus.payments">
                <tr v-for="payment in billFocus.payments">
                    <td>{{messages['payment_method_'+payment.paymentMethodObject.paymentMethodType]}}</td>
                    <td v-if="payment.paymentMethodObject.promotion">{{messages['label_promotion_'+payment.paymentMethodObject.maskedPaymentInfo]}}</td>
                    <td v-else>{{payment.paymentMethodObject.maskedPaymentInfo}}</td>
                    <td>{{messages['payment_status_'+payment.status]}}</td>
                    <td>{{messages.label_payment_amount_format.parseExpression({messages: messages, ...payment, amountMajorUnits: payment.amount/100, amountMinorUnits: payment.amount%100})}}</td>
                    <td>
                        {{messages['payment_type_'+payment.type]}}
                    </td>
                </tr>
                </tbody>
            </table>

            <button @click="showBillDetail(null)">{{messages.button_label_close_bill_detail}}</button>
        </div>

        <div v-else>
        <table border="1">
            <thead>
            <tr>
                <td>{{messages.label_bill_period}}</td>
                <td>{{messages.label_bill_plan}}</td>
                <td>{{messages.label_bill_status}}</td>
                <td>{{messages.label_bill_total}}</td>
            </tr>
            </thead>
            <tbody v-if="bills">
            <tr v-for="bill in bills" @click="showBillDetail(bill)">
                <td>{{bill.periodStart}}</td>
                <td>{{messages['plan_name_'+bill.planObject.name]}}</td>
                <td>{{messages['bill_status_'+bill.status]}}</td>
                <td>
                    {{messages.label_bill_total_format.parseExpression({messages: messages, ...bill, totalMajorUnits: bill.total/100, totalMinorUnits: bill.total%100})}}
                </td>
            </tr>
            </tbody>
        </table>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { util } from '../../_helpers';

    export default {
        data() {
            return {
                me: null,
                userId: null,
                linkPrefix: null,
                currentUser: util.currentUser(),
                billFocus: null
            };
        },
        computed: {
            ...mapState('system', ['messages']),
            ...mapState('bills', ['bills', 'bill'])
        },
        methods: {
            ...mapActions('bills', ['getAllBillsByAccount', 'getBillByAccountAndId']),
            ...mapGetters('bills', ['loading']),
            showBillDetail (bill) {
                this.billFocus = bill;
                if (bill !== null) {
                    this.getBillByAccountAndId({userId: this.userId, billId: bill.uuid, messages: this.messages, errors: this.errors});
                }
            }
        },
        watch: {
            bill (b) {
                if (b) {
                    this.billFocus = b;
                }
            }
        },
        created () {
            if (util.validateAccount(this)) {
                this.getAllBillsByAccount({userId: this.userId, messages: this.messages, errors: this.errors});
            }
        }
    };
</script>