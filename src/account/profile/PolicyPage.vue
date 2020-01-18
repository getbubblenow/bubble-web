<template>
    <div>
        <div v-if="inboundAction" :class="`alert ${inboundAction.alertType}`">
            {{messages['message_inbound_'+inboundAction.actionType]}}
            {{messages['message_inbound_'+inboundAction.status]}}
            <div v-if="errors.has('token')" class="invalid-feedback d-block">{{ errors.first('token') }}</div>
            <div v-if="errors.has('request')" class="invalid-feedback d-block">{{ errors.first('request') }}</div>
        </div>

        <h2>{{messages.form_title_account_policy}}</h2>
        <form @submit.prevent="updatePolicy">
            <hr/>
            <div class="form-group">
                <label htmlFor="deletionPolicy">{{messages.field_label_policy_account_deletion}}</label>
                <select v-model="deletionPolicy" name="deletionPolicy" class="form-control">
                    <option v-for="opt in accountDeletionOptions" v-bind:value="opt">{{messages['account_deletion_name_'+opt]}}</option>
                </select>
                <span>{{messages['account_deletion_description_'+deletionPolicy]}}</span>
                <div v-if="submitted && errors.has('deletionPolicy')" class="invalid-feedback d-block">{{ errors.first('deletionPolicy') }}</div>
            </div>

            <hr/>

            <div class="form-group">
                <label htmlFor="accountOperationTimeout">{{messages.field_label_policy_account_operation_timeout}}</label>
                <input type="number" v-model="accountOperationTimeout" name="accountOperationTimeout" class="form-control"/>
                <select v-model="accountOperationTimeoutUnits" name="accountOperationTimeoutUnits" class="form-control">
                    <option v-for="opt in timeDurationOptions" v-bind:value="opt">{{messages['time_duration_'+opt]}}</option>
                </select>
                <div v-if="submitted && errors.has('accountOperationTimeout')" class="invalid-feedback d-block">{{ errors.first('accountOperationTimeout') }}</div>
                <span>{{messages.field_label_policy_account_operation_timeout_description}}</span>
            </div>

            <div class="form-group">
                <label htmlFor="nodeOperationTimeout">{{messages.field_label_policy_node_operation_timeout}}</label>
                <input type="number" v-model="nodeOperationTimeout" name="nodeOperationTimeout" class="form-control"/>
                <select v-model="nodeOperationTimeoutUnits" name="nodeOperationTimeoutUnits" class="form-control">
                    <option v-for="opt in timeDurationOptions" v-bind:value="opt">{{messages['time_duration_'+opt]}}</option>
                </select>
                <div v-if="submitted && errors.has('nodeOperationTimeout')" class="invalid-feedback d-block">{{ errors.first('nodeOperationTimeout') }}</div>
                <span>{{messages.field_label_policy_node_operation_timeout_description}}</span>
            </div>

            <div class="form-group" v-if="hasAuthenticator">
                <label htmlFor="authenticatorTimeout">{{messages.field_label_policy_authenticator_timeout}}</label>
                <input type="number" v-model="authenticatorTimeout" name="authenticatorTimeout" class="form-control"/>
                <select v-model="authenticatorTimeoutUnits" name="authenticatorTimeoutUnits" class="form-control">
                    <option v-for="opt in timeDurationOptions" v-bind:value="opt">{{messages['time_duration_'+opt]}}</option>
                </select>
                <div v-if="submitted && errors.has('authenticatorTimeout')" class="invalid-feedback d-block">{{ errors.first('authenticatorTimeout') }}</div>
                <span>{{messages.field_label_policy_authenticator_timeout_description}}</span>
            </div>

            <hr/>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="loading()">{{messages.button_label_update_policy}}</button>
                <img v-show="loading()" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>

        </form>

        <hr/>
        <h2>{{messages.form_title_account_contacts}}</h2>
        <div v-if="errors.has('contact')" class="invalid-feedback d-block">{{ errors.first('contact') }}</div>
        <table v-if="contacts && contacts.length > 0" border="1">
            <thead>
            <tr>
                <td>{{messages.field_label_policy_contact_nick}}</td>
                <td>{{messages.field_label_policy_contact_type}}</td>
                <td>{{messages.field_label_policy_contact_info}}</td>
                <td>{{messages.field_label_policy_contact_verified}}</td>

                <td>
                    <i aria-hidden="true" :class="messages.field_label_policy_contact_authFactor_icon" :title="messages.field_label_policy_contact_authFactor"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_authFactor}}</span>
                </td>

                <td>
                    <i aria-hidden="true" :class="messages.field_label_policy_contact_requiredForNetworkOperations_icon" :title="messages.field_label_policy_contact_requiredForNetworkOperations"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_requiredForNetworkOperations}}</span>
                </td>
                <td>
                    <i aria-hidden="true" :class="messages.field_label_policy_contact_requiredForAccountOperations_icon" :title="messages.field_label_policy_contact_requiredForAccountOperations"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_requiredForAccountOperations}}</span>
                </td>
                <td>
                    <i aria-hidden="true" :class="messages.field_label_policy_contact_receiveVerifyNotifications_icon" :title="messages.field_label_policy_contact_receiveVerifyNotifications"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_receiveVerifyNotifications}}</span>
                </td>
                <td>
                    <i aria-hidden="true" :class="messages.field_label_policy_contact_receiveLoginNotifications_icon" :title="messages.field_label_policy_contact_receiveLoginNotifications"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_receiveLoginNotifications}}</span>
                </td>
                <td>
                    <i aria-hidden="true" :class="messages.field_label_policy_contact_receivePasswordNotification_icon" :title="messages.field_label_policy_contact_receivePasswordNotification"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_receivePasswordNotification}}</span>
                </td>
                <td>
                    <i aria-hidden="true" :class="messages.field_label_policy_contact_receiveInformationalMessages_icon" :title="messages.field_label_policy_contact_receiveInformationalMessages"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_receiveInformationalMessages}}</span>
                </td>
                <td>
                    <i aria-hidden="true" :class="messages.field_label_policy_contact_receivePromotionalMessages_icon" :title="messages.field_label_policy_contact_receivePromotionalMessages"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_receivePromotionalMessages}}</span>
                </td>
                <td><!-- Delete --></td>
            </tr>
            </thead>
            <tbody>
            <tr v-for="contact in contacts">
                <!-- nickname -->
                <td>{{contact.nick}}</td>

                <!-- contact type -->
                <td>{{messages['field_label_policy_contact_type_'+contact.type]}}</td>

                <!-- masked contact info -->
                <td><span v-if="isNotAuthenticator(contact)">{{contact.info}}</span></td>

                <!-- verified, or show verification form -->
                <td v-if="contact.verified">
                    <i aria-hidden="true" :class="messages.field_label_policy_contact_value_enabled_icon" :title="messages.message_true"></i>
                    <span class="sr-only">{{messages.message_true}}</span>
                </td>
                <td v-else>
                    <form v-if="verifyingContact === contact.uuid || isAuthenticator(contact)" @submit.prevent="submitVerification(contact)">
                        <div v-if="isAuthenticator(contact) && contact.masked">
                            <i aria-hidden="true" :class="messages.field_label_policy_contact_value_disabled_icon" :title="messages.message_verify_authenticator_masked"></i>
                            <span class="sr-only">{{messages.message_verify_authenticator_masked}}</span>
                        </div>
                        <div v-else class="form-group">
                            <div v-if="isAuthenticator(contact)">
                                <div>{{messages.message_verify_authenticator_preamble}}</div>
                                <canvas id="authenticator_qr_canvas"></canvas>
                                <hr/>
                                <span>{{messages.message_verify_authenticator_backupCodes}}<br/>
                                    <span id="authenticator_backupCodes"></span>
                                </span>
                                <hr/>
                                <span>{{messages.message_verify_authenticator_backupCodes_description}}</span>
                            </div>
                            <label htmlFor="verifyCode">{{messages.field_label_policy_contact_verify_code}}</label>
                            <input :disabled="actionStatus.requesting" :id="'verifyContactCode_'+contact.uuid" v-validate="'required'" name="verifyCode" type="text" size="8"/>
                            <div v-if="errors.has('approvalToken')" class="invalid-feedback d-block">{{ errors.first('approvalToken') }}</div>
                            <button class="btn btn-primary" :disabled="actionStatus.requesting">{{messages.button_label_submit_verify_code}}</button>
                            <button v-if="isNotAuthenticator(contact)" class="btn btn-primary" :disabled="actionStatus.requesting" @click="resendVerification(contact)">{{messages.button_label_resend_verify_code}}</button>
                            <button v-if="isNotAuthenticator(contact)" class="btn btn-primary" :disabled="actionStatus.requesting" @click="cancelVerifyContact()">{{messages.button_label_cancel}}</button>
                        </div>
                    </form>
                    <button v-if="verifyingContact !== contact.uuid && isNotAuthenticator(contact)" @click="startVerifyContact(contact)" class="btn btn-primary">{{messages.button_label_submit_verify_code}}</button>
                </td>

                <!-- auth factor: required, sufficient, or not_required -->
                <td v-if="contact.authFactor === 'required'">
                    <i @click="toggleAuthFactor(contact)" aria-hidden="true" :class="messages.field_label_policy_contact_authFactor_name_required_icon" :title="messages.field_label_policy_contact_authFactor_name_required"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_authFactor_name_required}}</span>
                </td>
                <td v-else-if="contact.authFactor === 'sufficient'">
                    <i @click="toggleAuthFactor(contact)" aria-hidden="true" :class="messages.field_label_policy_contact_authFactor_name_sufficient_icon" :title="messages.field_label_policy_contact_authFactor_name_sufficient"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_authFactor_name_sufficient}}</span>
                </td>
                <td v-else-if="contact.authFactor === 'not_required'">
                    <i @click="toggleAuthFactor(contact)" aria-hidden="true" :class="messages.field_label_policy_contact_authFactor_name_not_required_icon" :title="messages.field_label_policy_contact_authFactor_name_not_required"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_authFactor_name_not_required}}</span>
                </td>
                <td v-else>
                    <i aria-hidden="true" :class="messages.field_label_policy_contact_value_not_applicable_icon" :title="messages.field_label_policy_contact_value_not_applicable_name"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_value_not_applicable_name}}</span>
                </td>

                <!-- required for account operations? -->
                <td v-if="contact.requiredForAccountOperations">
                    <i @click="contactFlag(contact, 'requiredForAccountOperations', false)" aria-hidden="true" :class="messages.field_label_policy_contact_value_enabled_icon" :title="messages.message_true"></i>
                    <span class="sr-only">{{messages.message_true}}</span>
                </td>
                <td v-else>
                    <i @click="contactFlag(contact, 'requiredForAccountOperations', true)" aria-hidden="true" :class="messages.field_label_policy_contact_value_disabled_icon" :title="messages.message_false"></i>
                    <span class="sr-only">{{messages.message_false}}</span>
                </td>

                <!-- required for network operations? -->
                <td v-if="contact.requiredForNetworkOperations">
                    <i @click="contactFlag(contact, 'requiredForNetworkOperations', false)" aria-hidden="true" :class="messages.field_label_policy_contact_value_enabled_icon" :title="messages.message_true"></i>
                    <span class="sr-only">{{messages.message_true}}</span>
                </td>
                <td v-else>
                    <i @click="contactFlag(contact, 'requiredForNetworkOperations', true)" aria-hidden="true" :class="messages.field_label_policy_contact_value_disabled_icon" :title="messages.message_false"></i>
                    <span class="sr-only">{{messages.message_false}}</span>
                </td>

                <!-- receive verify notifications? -->
                <td v-if="isAuthenticator(contact)">
                    <i aria-hidden="true" :class="messages.field_label_policy_contact_value_not_applicable_icon" :title="messages.field_label_policy_contact_value_not_applicable_name"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_value_not_applicable_name}}</span>
                </td>
                <td v-else-if="contact.receiveVerifyNotifications">
                    <i @click="contactFlag(contact, 'receiveVerifyNotifications', false)" aria-hidden="true" :class="messages.field_label_policy_contact_value_enabled_icon" :title="messages.message_true"></i>
                    <span class="sr-only">{{messages.message_true}}</span>
                </td>
                <td v-else>
                    <i @click="contactFlag(contact, 'receiveVerifyNotifications', true)" aria-hidden="true" :class="messages.field_label_policy_contact_value_disabled_icon" :title="messages.message_false"></i>
                    <span class="sr-only">{{messages.message_false}}</span>
                </td>

                <!-- receive login notifications? -->
                <td v-if="isAuthenticator(contact)">
                    <i aria-hidden="true" :class="messages.field_label_policy_contact_value_not_applicable_icon" :title="messages.field_label_policy_contact_value_not_applicable_name"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_value_not_applicable_name}}</span>
                </td>
                <td v-else-if="contact.receiveLoginNotifications">
                    <i @click="contactFlag(contact, 'receiveLoginNotifications', false)" aria-hidden="true" :class="messages.field_label_policy_contact_value_enabled_icon" :title="messages.message_true"></i>
                    <span class="sr-only">{{messages.message_true}}</span>
                </td>
                <td v-else>
                    <i @click="contactFlag(contact, 'receiveLoginNotifications', false)" aria-hidden="true" :class="messages.field_label_policy_contact_value_disabled_icon" :title="messages.message_false"></i>
                    <span class="sr-only">{{messages.message_false}}</span>
                </td>

                <!-- receive change password notifications? -->
                <td v-if="isAuthenticator(contact)">
                    <i aria-hidden="true" :class="messages.field_label_policy_contact_value_not_applicable_icon" :title="messages.field_label_policy_contact_value_not_applicable_name"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_value_not_applicable_name}}</span>
                </td>
                <td v-else-if="contact.receivePasswordNotification">
                    <i @click="contactFlag(contact, 'receivePasswordNotification', false)" aria-hidden="true" :class="messages.field_label_policy_contact_value_enabled_icon" :title="messages.message_true"></i>
                    <span class="sr-only">{{messages.message_true}}</span>
                </td>
                <td v-else>
                    <i @click="contactFlag(contact, 'receivePasswordNotification', true)" aria-hidden="true" :class="messages.field_label_policy_contact_value_disabled_icon" :title="messages.message_false"></i>
                    <span class="sr-only">{{messages.message_false}}</span>
                </td>

                <!-- receive informational messages? -->
                <td v-if="isAuthenticator(contact)">
                    <i aria-hidden="true" :class="messages.field_label_policy_contact_value_not_applicable_icon" :title="messages.field_label_policy_contact_value_not_applicable_name"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_value_not_applicable_name}}</span>
                </td>
                <td v-else-if="contact.receiveInformationalMessages">
                    <i @click="contactFlag(contact, 'receiveInformationalMessages', false)" aria-hidden="true" :class="messages.field_label_policy_contact_value_enabled_icon" :title="messages.message_true"></i>
                    <span class="sr-only">{{messages.message_true}}</span>
                </td>
                <td v-else>
                    <i @click="contactFlag(contact, 'receiveInformationalMessages', true)" aria-hidden="true" :class="messages.field_label_policy_contact_value_disabled_icon" :title="messages.message_false"></i>
                    <span class="sr-only">{{messages.message_false}}</span>
                </td>

                <!-- receive promotional messages? -->
                <td v-if="isAuthenticator(contact)">
                    <i aria-hidden="true" :class="messages.field_label_policy_contact_value_not_applicable_icon" :title="messages.field_label_policy_contact_value_not_applicable_name"></i>
                    <span class="sr-only">{{messages.field_label_policy_contact_value_not_applicable_name}}</span>
                </td>
                <td v-else-if="contact.receivePromotionalMessages">
                    <i @click="contactFlag(contact, 'receivePromotionalMessages', false)" aria-hidden="true" :class="messages.field_label_policy_contact_value_enabled_icon" :title="messages.message_true"></i>
                    <span class="sr-only">{{messages.message_true}}</span>
                </td>
                <td v-else>
                    <i @click="contactFlag(contact, 'receivePromotionalMessages', true)" aria-hidden="true" :class="messages.field_label_policy_contact_value_disabled_icon" :title="messages.message_false"></i>
                    <span class="sr-only">{{messages.message_false}}</span>
                </td>

                <!-- remove contact -->
                <td>
                    <i @click="removeContact(contact.uuid)" aria-hidden="true" :class="messages.button_label_remove_contact_icon" :title="messages.button_label_remove_contact"></i>
                    <span class="sr-only">{{messages.button_label_remove_contact}}</span>
                </td>
            </tr>
            </tbody>
        </table>

        <hr/>
        <h4>{{messages.form_title_account_add_contact}}</h4>
        <form @submit.prevent="addContact">
            <div class="form-group">
                <label htmlFor="contactType">{{messages.field_label_policy_contact_type}}</label>
                <select v-model="newContact.type" name="contactType" class="form-control">
                    <option v-for="opt in newContactTypes" v-bind:value="opt">{{messages['field_label_policy_contact_type_'+opt]}}</option>
                </select>
                <div v-if="contactSubmitted && errors.has('contactType')" class="invalid-feedback d-block">{{ errors.first('contactType') }}</div>
            </div>

            <div v-if="newContact.type !== '' && isNotAuthenticator(newContact)" class="form-group">
                <label htmlFor="contactInfo">{{messages['field_label_policy_contact_type_'+newContact.type+'_field']}}</label>
                <v-select v-if="newContact.type !== '' && newContact.type === 'sms'" :options="countries" :reduce="c => c.code" label="countryName" v-model="newContactSmsCountry" name="newContactSmsCountry" class="form-control"/>
                <input v-model="newContact.info" :type="newContact.type === 'sms' ? 'tel' : 'text'" name="contactInfo" class="form-control"/>
                <div v-if="contactSubmitted && errors.has('contactInfo')" class="invalid-feedback d-block">{{ errors.first('contactInfo') }}</div>
                <div v-if="contactSubmitted && errors.has('email')" class="invalid-feedback d-block">{{ errors.first('email') }}</div>
                <div v-if="contactSubmitted && errors.has('phone')" class="invalid-feedback d-block">{{ errors.first('phone') }}</div>
            </div>

            <hr/>
            <div class="form-group">
                <label for="requiredForAccountOperations">{{messages.field_label_policy_contact_requiredForAccountOperations}}</label>
                <input type="checkbox" id="requiredForAccountOperations" v-model="newContact.requiredForAccountOperations">
            </div>
            <div class="form-group">
                <label for="requiredForNetworkOperations">{{messages.field_label_policy_contact_requiredForNetworkOperations}}</label>
                <input type="checkbox" id="requiredForNetworkOperations" v-model="newContact.requiredForNetworkOperations">
                <div v-if="contactSubmitted && errors.has('requiredForNetworkOperations')" class="invalid-feedback d-block">{{ errors.first('requiredForNetworkOperations') }}</div>
            </div>
            <div v-if="newContact.type !== '' && isNotAuthenticator(newContact)" class="form-group">
                <label for="receiveVerifyNotifications">{{messages.field_label_policy_contact_receiveVerifyNotifications}}</label>
                <input type="checkbox" id="receiveVerifyNotifications" v-model="newContact.receiveVerifyNotifications">
            </div>
            <div v-if="newContact.type !== '' && isNotAuthenticator(newContact)" class="form-group">
                <label for="receiveLoginNotifications">{{messages.field_label_policy_contact_receiveLoginNotifications}}</label>
                <input type="checkbox" id="receiveLoginNotifications" v-model="newContact.receiveLoginNotifications">
            </div>
            <div v-if="newContact.type !== '' && isNotAuthenticator(newContact)" class="form-group">
                <label for="receivePasswordNotification">{{messages.field_label_policy_contact_receivePasswordNotification}}</label>
                <input type="checkbox" id="receivePasswordNotification" v-model="newContact.receivePasswordNotification">
            </div>
            <div v-if="newContact.type !== '' && isNotAuthenticator(newContact)" class="form-group">
                <label for="receiveInformationalMessages">{{messages.field_label_policy_contact_receiveInformationalMessages}}</label>
                <input type="checkbox" id="receiveInformationalMessages" v-model="newContact.receiveInformationalMessages">
            </div>
            <div v-if="newContact.type !== '' && isNotAuthenticator(newContact)" class="form-group">
                <label for="receivePromotionalMessages">{{messages.field_label_policy_contact_receivePromotionalMessages}}</label>
                <input type="checkbox" id="receivePromotionalMessages" v-model="newContact.receivePromotionalMessages">
            </div>

            <hr/>
            <div class="form-group">
                <label htmlFor="nick">{{messages.field_label_policy_contact_nick}}</label>
                <input v-model="newContact.nick" name="nick" class="form-control"/>
                <div v-if="contactSubmitted && errors.has('nick')" class="invalid-feedback d-block">{{ errors.first('nick') }}</div>
            </div>

            <hr/>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="loading() || !newContactValid">{{messages.button_label_add_contact}}</button>
                <img v-show="loading()" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            </div>
        </form>

    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';

    // convenience methods
    import { isAuthenticator, isNotAuthenticator } from '../../_store/users.module';
    window.isAuthenticator = isAuthenticator;
    window.isNotAuthenticator = isNotAuthenticator;

    const QRCode = require('qrcode');

    function initNewContact () {
        return {
            uuid: '', type: '', info: '',
            requiredForNetworkOperations: true,
            requiredForAccountOperations: true,
            receiveVerifyNotifications: true,
            receiveLoginNotifications: true,
            receivePasswordNotification: true,
            receiveInformationalMessages: true,
            receivePromotionalMessages: true
        };
    }

    function countryFromLocale(loc) {
        if (typeof loc === 'undefined' || loc == null || loc.indexOf('_') === -1) return 'US';
        return loc.substring(loc.indexOf('_')+1);
    }

    export default {
        data() {
            return {
                submitted: false,
                deletionPolicy: '',
                accountOperationTimeout: '',
                accountOperationTimeoutUnits: '',
                nodeOperationTimeout: '',
                nodeOperationTimeoutUnits: '',
                authenticatorTimeout: '',
                authenticatorTimeoutUnits: '',
                contacts: [],
                contactSubmitted: false,
                newContactSmsCountry: '',
                newContact: initNewContact(),
                verifyingContact: null,
                inboundAction: null,
                watchedPolicy: null
            }
        },
        computed: {
            ...mapState('account', {
                currentUser: state => state.user
            }),
            ...mapState('account', ['actionStatus']),
            ...mapState('system', [
                'messages', 'accountDeletionOptions', 'timeDurationOptions', 'timeDurationOptionsReversed',
                'contactTypes', 'detectedLocale', 'countries'
            ]),
            ...mapState('users', ['policy', 'contact', 'authenticator']),
            hasAuthenticator() {
                for (let i=0; i<this.contacts.length; i++) {
                    if (isAuthenticator(this.contacts[i])) return true;
                }
                return false;
            },
            newContactTypes() {
                let hasAuth = false;
                for (let i=0; i<this.contacts.length; i++) {
                    if (isAuthenticator(this.contacts[i])) {
                        hasAuth = true;
                        break;
                    }
                }
                if (!hasAuth) {
                    return this.contactTypes;
                }
                const types = [];
                for (let i=0; i<this.contactTypes.length; i++) {
                    if (isNotAuthenticator(this.contactTypes[i])) types.push(this.contactTypes[i]);
                }
                return types;
            },
            newContactValid() {
                return (this.newContact.type !== null && this.newContact.type !== '')
                    && (isAuthenticator(this.newContact)|| (this.newContact.info !== null && this.newContact.info !== ''));
            }
        },
        methods: {
            ...mapActions('account', ['approveAction', 'denyAction', 'sendAuthenticatorCode', 'resendVerificationCode']),
            ...mapActions('users', [
                'getPolicyByUserId', 'updatePolicyByUserId', 'addPolicyContactByUserId', 'removePolicyContactByUserId',
            ]),
            ...mapGetters('users', ['loading']),
            isAuthenticator(val) { return window.isAuthenticator(val); },
            isNotAuthenticator(val) { return window.isNotAuthenticator(val); },
            updatePolicy(e) {
                this.errors.clear();
                this.submitted = true;
                this.updatePolicyByUserId({
                    userId: this.currentUser.uuid,
                    policy: {
                        deletionPolicy: this.deletionPolicy,
                        accountOperationTimeout: this.messages.durationToMillis(this.accountOperationTimeout, this.accountOperationTimeoutUnits),
                        nodeOperationTimeout: this.messages.durationToMillis(this.nodeOperationTimeout, this.nodeOperationTimeoutUnits),
                        authenticatorTimeout: this.messages.durationToMillis(this.authenticatorTimeout, this.authenticatorTimeoutUnits),
                    },
                    messages: this.messages,
                    errors: this.errors
                });
            },
            addContact(e) {
                const contactToAdd = Object.assign({}, this.newContact);
                if (contactToAdd.type === 'sms') {
                    contactToAdd.info = this.newContactSmsCountry + ':' + contactToAdd.info;
                }
                this.contactSubmitted = true;
                this.errors.clear();
                // console.log('addContact: adding: '+JSON.stringify(contactToAdd));
                this.addPolicyContactByUserId({
                    userId: this.currentUser.uuid,
                    contact: contactToAdd,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            removeContact(uuid) {
                this.errors.clear();
                this.removePolicyContactByUserId({
                    userId: this.currentUser.uuid,
                    contactUuid: uuid,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            prepContact(contact) {
                // remove 'info' property before sending to API
                const c = Object.assign({}, contact);
                if (c.hasOwnProperty('info')) delete c['info'];
                return c;
            },
            contactFlag(contact, flag, val) {
                this.errors.clear();
                if (!contact.verified) {
                    this.errors.add({field: 'contact', msg: this.messages['err_contact_unverified']});
                    return;
                }
                contact[flag] = val;
                const c = this.prepContact(contact);
                // console.log('contactFlag: update: '+JSON.stringify(c));
                this.addPolicyContactByUserId({
                    userId: this.currentUser.uuid,
                    contact: c,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            toggleAuthFactor(contact) {
                if (!contact.verified) {
                    this.errors.add({field: 'contact', msg: this.messages['err_contact_unverified']});
                    return;
                }
                if (isAuthenticator(contact)) {
                    this.errors.add({field: 'contact', msg: this.messages['err_contact_authenticatorAuthFactorCannotBeChanged']});
                    return;
                }
                switch (contact.authFactor) {
                    case 'required': this.setAuthFactor(contact, 'sufficient'); break;
                    case 'sufficient': this.setAuthFactor(contact, 'not_required'); break;
                    case 'not_required': this.setAuthFactor(contact, 'required'); break;
                }
            },
            setAuthFactor(contact, factor) {
                this.errors.clear();
                const c = this.prepContact(contact);
                c.authFactor = factor;
                this.addPolicyContactByUserId({
                    userId: this.currentUser.uuid,
                    contact: c,
                    messages: this.messages,
                    errors: this.errors
                });
            },
            startVerifyContact(contact) {
                // console.log('startVerifyContact: '+JSON.stringify(contact));
                this.verifyingContact = contact.uuid;
                return false; // do not follow the click
            },
            resendVerification(contact) {
                this.errors.clear();
                this.resendVerificationCode({
                    userId: this.currentUser.uuid,
                    contact: contact,
                    messages: this.messages,
                    errors: this.errors
                });
                return false; // do not follow the click
            },
            cancelVerifyContact() {
                this.verifyingContact = null;
                this.errors.clear();
                return false; // do not follow the click
            },
            updatePolicyTimeouts(p) {
                if (typeof p.accountOperationTimeout !== 'undefined' && p.accountOperationTimeout !== null) {
                    const parts = this.messages.millisToDuration(p.accountOperationTimeout);
                    this.accountOperationTimeout = parts.count;
                    this.accountOperationTimeoutUnits = parts.units;
                }
                if (typeof p.nodeOperationTimeout !== 'undefined' && p.nodeOperationTimeout !== null) {
                    const parts = this.messages.millisToDuration(p.nodeOperationTimeout);
                    this.nodeOperationTimeout = parts.count;
                    this.nodeOperationTimeoutUnits = parts.units;
                }
                if (typeof p.authenticatorTimeout !== 'undefined' && p.authenticatorTimeout !== null) {
                    const parts = this.messages.millisToDuration(p.authenticatorTimeout);
                    this.authenticatorTimeout = parts.count;
                    this.authenticatorTimeoutUnits = parts.units;
                }
            },
            submitVerification(contact) {
                const uuid = contact.uuid;
                const type = contact.type;
                const codeElementId = 'verifyContactCode_'+uuid;
                const codeElement = document.getElementById(codeElementId);
                if (codeElement != null) {
                    const code = codeElement.value;
                    if (code === null || code === '') return;
                    this.errors.clear();
                    if (isAuthenticator(type)) {
                        // console.log('submitVerification: sending authenticator code: '+code);
                        this.sendAuthenticatorCode({
                            userId: this.currentUser.uuid,
                            code: code,
                            authOnly: null,
                            verifyOnly: true,
                            messages: this.messages,
                            errors: this.errors
                        });
                    } else {
                        this.approveAction({
                            userId: this.currentUser.uuid,
                            code: code,
                            messages: this.messages,
                            errors: this.errors
                        });
                    }
                } else {
                    console.log('submitVerification: DOM element not found: '+codeElementId);
                }
            }
        },
        watch: {
            messages (msgs) {
                if (this.accountOperationTimeoutUnits === '' && this.watchedPolicy) {
                    this.updatePolicyTimeouts(this.watchedPolicy);
                }
            },
            policy (p) {
                // console.log('watch.policy: received: '+JSON.stringify(p));
                if (p) this.watchedPolicy = p;
                if (typeof p.deletionPolicy !== 'undefined' && p.deletionPolicy !== null) {
                    this.deletionPolicy = p.deletionPolicy;
                }
                this.updatePolicyTimeouts(p);
                if (typeof p.accountContacts !== 'undefined' && p.accountContacts !== null && p.accountContacts.length > 0) {
                    this.contacts = p.accountContacts;
                } else {
                    this.contacts = [];
                }
                this.newContact = initNewContact();
            },
            contact (c) {
                // console.log('watch.contact: received: '+JSON.stringify(c));
                if (typeof c.error === 'undefined' || c.error === null) {
                    // force reload policy, refreshes contacts
                    this.getPolicyByUserId({userId: this.currentUser.uuid, messages: this.messages, errors: this.errors});
                }
            },
            actionStatus (status) {
                // console.log('watch.actionStatus: received: '+JSON.stringify(status));
                if (status.success) {
                    this.getPolicyByUserId({userId: this.currentUser.uuid, messages: this.messages, errors: this.errors});
                }
            },
            authenticator (auth) {
                // console.log('watch.authenticator: received: '+JSON.stringify(auth));
                if (auth.url) {
                    const checkExist = setInterval(function() {
                        if (document.getElementById('authenticator_qr_canvas') != null) {
                            clearInterval(checkExist);
                            const canvas = document.getElementById('authenticator_qr_canvas');
                            if (canvas !== null) {
                                QRCode.toCanvas(canvas, auth.url, function (error) {
                                    if (error) console.error('QR generation error: ' + error);
                                });
                                const backupCodes = document.getElementById('authenticator_backupCodes');
                                if (backupCodes != null && typeof auth.backupCodes !== 'undefined' && auth.backupCodes != null && auth.backupCodes.length > 0) {
                                    backupCodes.innerHTML = auth.backupCodes.join('<br/>');
                                } else {
                                    console.log('backupCodes element not found, or no backupCodes defined');
                                }
                            }
                        }
                    }, 200);
                }
            }
        },
        created () {
            this.getPolicyByUserId({userId: this.currentUser.uuid, messages: this.messages, errors: this.errors});
            // console.log('PolicyPage.created: $route.params='+JSON.stringify(this.$route.query));
            if (this.$route.query.action) {
                this.inboundAction = {
                    actionType: this.$route.query.action
                };
                if (this.inboundAction.actionType === 'invalid') {
                    this.inboundAction.status = 'invalid';
                    this.inboundAction.alertType = 'alert-danger';
                } else {
                    if (this.$route.query.ok) {
                        this.inboundAction.status = 'success';
                        this.inboundAction.alertType = 'alert-success';
                    } else {
                        this.inboundAction.status = 'failure';
                        this.inboundAction.alertType = 'alert-danger';
                    }
                }
            }
            this.newContactSmsCountry = countryFromLocale(this.detectedLocale);
        }
    };
</script>